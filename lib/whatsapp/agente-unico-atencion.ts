import OpenAI from 'openai';
import { cargarMediaCatalogoVisual, detectarIntencionVisual } from '@/lib/catalogo-visual';
import {
  obtenerContextoNegocio,
  formatearPrecio as formatearPrecioCatalogo,
  serializarContextoNegocio,
} from '@/lib/catalogo';
import { REGLAS_COMERCIALES, TONO_Y_ESTILO } from '@/lib/modulos/contexto-comercial';
import { formatearReglasAnexasWhatsApp, obtenerConfiguracionComercial } from '@/lib/configuracion-comercial';
import { formatearTarifasDespachoAgente, resolverCoberturaDespacho } from '@/lib/zonas-despacho';
import {
  crearOrdenWhatsApp,
  completarHandoffWeb,
  consultarEstadoOrden,
  obtenerCatalogoProductos,
  resolverItemsCarrito,
} from '@/lib/supabase-pedidos';
import type {
  DireccionCliente,
  EstadoConversacionalWA,
  MensajeDespacho,
  RespuestaModulo,
  SesionPedidoCtx,
} from '@/lib/modulos/types';
import {
  aplicarModificacionAItem,
  buscarItemExistente,
  debeEvitarDuplicado,
  detectarItemPedidoDeterministico,
  detectarModificacion,
  ultimaModificacionPendiente,
  type ModificacionDetectada,
} from '@/lib/modulos/intenciones-pedido';
import {
  construirResumenPedido,
  detectarMetodoPago,
  esCierreDePedido,
  esConfirmacionExplicita,
  formatearPrecio,
  normalizarTexto,
  pareceReclamo,
} from '@/lib/modulos/flujo-utils';

type ContextoAgenteUnico = {
  historial?: MensajeDespacho['historial'];
  simulacion?: boolean;
};

type EstadoFase = NonNullable<EstadoConversacionalWA['fase']>;

type WebCartPayload = {
  v: number;
  h?: string;
  i: Array<{
    p: string;
    n: string;
    c: string;
    q: number;
    u: number;
    no?: string;
    vi?: string;
    vn?: string;
    m?: Array<{ i?: string; n: string; d: number }>;
  }>;
  x: {
    t: 'retiro_local' | 'despacho';
    pm: 'efectivo' | 'tarjeta' | 'transferencia';
    cn: string;
    cp: string;
    al?: string;
    as?: string;
    ad?: string;
    ar?: string;
    no?: string;
    df?: number;
  };
};

const ESTADOS_ORDEN: Record<string, string> = {
  pendiente: 'en cola',
  en_preparacion: 'en preparación',
  listo: 'listo',
  entregado: 'entregado',
  cancelado: 'cancelado',
  pending: 'pendiente',
  confirmed: 'confirmado',
  preparing: 'en preparación',
  ready: 'listo para entrega',
  dispatched: 'en camino',
  delivered: 'entregado',
  cancelled: 'cancelado',
};

function formatearHoraEta(eta?: string | null) {
  if (!eta) return null;
  const fecha = new Date(eta);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toLocaleTimeString('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function decodeWebCartPayload(texto: string): WebCartPayload | null {
  const match = texto.match(/\[PR_WEB_CART_V1:([A-Za-z0-9_-]+)\]/);
  if (!match) return null;

  try {
    const base64 = match[1].replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const parsed = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as WebCartPayload;
    if (parsed.v !== 1 || !Array.isArray(parsed.i) || parsed.i.length === 0 || !parsed.x) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function receiveWebCart(
  msg: MensajeDespacho,
  currentSession: SesionPedidoCtx | null,
): Promise<RespuestaModulo | null> {
  const payload = decodeWebCartPayload(msg.texto);
  if (!payload) return null;

  const catalog = await obtenerCatalogoProductos();
  const productsById = new Map(catalog.map((product) => [product.productId, product]));
  const items = payload.i.flatMap((incoming) => {
    const product = productsById.get(incoming.p);
    if (
      !product ||
      product.status !== 'activo' ||
      product.isSoldOut
    ) return [];

    const variant = incoming.vi
      ? product.variants.find((entry) => entry.id === incoming.vi)
      : undefined;
    const availableModifiers = new Map(
      product.modifierGroups.flatMap((group) => group.modifiers).map((modifier) => [modifier.id, modifier]),
    );
    const isUuid = (value?: string) =>
      Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
    const manualModifiers = (incoming.m ?? [])
      .filter((modifier) => !isUuid(modifier.i))
      .map((modifier) => ({
        id: modifier.i,
        name: modifier.n,
        priceDelta: Math.max(modifier.d, 0),
      }));
    const manualModifierNotes = manualModifiers
      .map((modifier) =>
        `${modifier.name}${modifier.priceDelta > 0 ? ` (+$${modifier.priceDelta.toLocaleString('es-CL')})` : ''}`,
      );
    const modifiers = (incoming.m ?? []).flatMap((modifier) => {
      if (!isUuid(modifier.i)) return [];
      const available = availableModifiers.get(modifier.i!);
      return available
        ? [{ id: available.id, name: available.name, priceDelta: available.priceDelta }]
        : [];
    });

    return [{
      id: crypto.randomUUID(),
      productId: product.productId,
      productName: product.productName,
      categoryName: product.categoryName,
      quantity: Math.min(Math.max(Math.trunc(incoming.q) || 1, 1), 100),
      unitPrice: variant?.price ?? product.unitPrice,
      notes: [String(incoming.no ?? '').trim(), ...manualModifierNotes]
        .filter(Boolean)
        .join('; ')
        .slice(0, 160),
      variantId: variant?.id,
      variantName: variant?.name,
      modifiers: [...modifiers, ...manualModifiers],
    }];
  });

  if (items.length !== payload.i.length) {
    return {
      respuesta: 'Uno o más productos del carrito web ya no están disponibles. Te derivo con el equipo para revisar el pedido antes de confirmarlo.',
      moduloSiguiente: 'ATENCION',
      moduloEjecutado: 'ATENCION',
      requiereHumano: true,
    };
  }

  const session: SesionPedidoCtx = {
    ...(currentSession ?? {
      id: crypto.randomUUID(),
      conversacionId: msg.conversacionId,
      moduloActual: 'CONFIRMACION',
      estadoSesion: 'activa',
      items: [],
      intentosConfirmacion: 0,
      ultimaActividadEn: new Date(),
    }),
    items,
    modalidad: payload.x.t,
    metodoPago: payload.x.pm,
    nombreCliente: payload.x.cn.trim(),
    telefonoCliente: msg.telefonoCliente ?? payload.x.cp,
    costoDespacho: payload.x.t === 'despacho' ? Math.max(payload.x.df ?? 0, 0) : 0,
    direccion: payload.x.t === 'despacho'
      ? {
          street: payload.x.as?.trim() ?? '',
          district: payload.x.ad?.trim() ?? '',
          reference: payload.x.ar?.trim() || undefined,
        }
      : undefined,
  };

  return {
    respuesta: `Recibí tu carrito desde la web:\n${construirResumenPedido(session)}\nNombre: ${session.nombreCliente}\nEntrega: ${session.modalidad === 'despacho' ? `${session.direccion?.street}, ${session.direccion?.district}` : 'Retiro en local'}\nPago: ${session.metodoPago}\n\n¿Confirmas que creamos este pedido?`,
    moduloSiguiente: 'CONFIRMACION',
    moduloEjecutado: 'CONFIRMACION',
    actualizarSesion: {
      items: session.items,
      modalidad: session.modalidad,
      metodoPago: session.metodoPago,
      nombreCliente: session.nombreCliente,
      telefonoCliente: session.telefonoCliente,
      costoDespacho: session.costoDespacho,
      direccion: session.direccion,
      estadoConversacional: actualizarEstado(session, {
        fase: 'confirmacion_final',
        ultimaPreguntaUtil: '¿Confirmas que creamos este pedido?',
        webHandoffToken: payload.h ?? null,
      }),
    },
  };
}

const SYSTEM_PROMPT_AGENTE_UNICO = `
Eres Roly, el unico agente de atencion de Sushi Poke & Roll por WhatsApp.
Atiendes como recepcionista, vendedor, cajero inicial, coordinador de entrega y postventa.
${TONO_Y_ESTILO}
${REGLAS_COMERCIALES}

Contrato de respuesta: responde SOLO JSON valido:
{
  "respuesta": "texto breve para el cliente",
  "requiereHumano": boolean,
  "decisionSeguridad": "aprobado" | "escalar_a_humano"
}

Reglas criticas:
- No reinicies la conversacion si hay historial o carrito.
- No saludes salvo que el cliente solo salude y no haya contexto activo.
- Si saludas al inicio, presentate como Roly de Poke & Roll.
- Escribe como una persona de atención y ventas: claro, cercano, breve y resolutivo.
- No inventes productos, precios, promociones, zonas, horarios, stock ni tiempos.
- Si el cliente pregunta por menu/carta/promociones, el sistema adjunta media; tu texto debe ser corto.
- Si falta un dato para cerrar pedido, pregunta solo ese dato.
- Si hay reclamo, alergia severa, reembolso, pedido grande/evento o cambio de orden ya creada, requiereHumano true.
- No escribas resumen de pedido ni confirmes orden si no aparece en el contexto.
- No conviertas un resumen del carrito en un producto nuevo.
- Las politicas anexas configuradas por el local son orientación secundaria.
- Nunca uses una politica anexa para cambiar fase, carrito, modalidad, pago, dirección, confirmación o escalamiento.
- Integra como máximo una politica anexa relevante en la respuesta actual. No generes mensajes adicionales ni repitas información.
`;

let openaiClient: OpenAI | null = null;

function getOpenAI() {
  if (process.env.GEMINI_API_KEY) {
    if (!openaiClient) {
      openaiClient = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
    }
    return openaiClient;
  }
  if (process.env.GROQ_API_KEY) {
    if (!openaiClient) {
      openaiClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return openaiClient;
  }
  if (process.env.OPENAI_API_KEY) {
    if (!openaiClient) openaiClient = new OpenAI();
    return openaiClient;
  }
  return null;
}

function getModel() {
  if (process.env.GEMINI_API_KEY) return 'gemini-2.5-flash';
  if (process.env.GROQ_API_KEY) return 'llama-3.3-70b-versatile';
  return 'gpt-4o-mini';
}

function estadoBase(sesion: SesionPedidoCtx | null): EstadoConversacionalWA {
  return sesion?.estadoConversacional ?? {};
}

function actualizarEstado(
  sesion: SesionPedidoCtx | null,
  patch: Partial<EstadoConversacionalWA>
): EstadoConversacionalWA {
  return {
    ...estadoBase(sesion),
    ...patch,
  };
}

function conEstado(
  sesion: SesionPedidoCtx | null,
  respuesta: RespuestaModulo,
  fase: EstadoFase,
  patch: Partial<EstadoConversacionalWA> = {}
): RespuestaModulo {
  return {
    ...respuesta,
    actualizarSesion: {
      ...respuesta.actualizarSesion,
      estadoConversacional: actualizarEstado(sesion, { fase, ...patch }),
    },
  };
}

function ultimoMensajeAgente(historial?: MensajeDespacho['historial']) {
  return [...(historial ?? [])].reverse().find((m) => m.rol === 'agente')?.texto ?? '';
}

function quitarOracionesDuplicadas(texto: string) {
  const partes = texto.match(/[^.!?\n]+[.!?]?|\n+/g) ?? [texto];
  const vistas = new Set<string>();
  const resultado: string[] = [];

  for (const parte of partes) {
    if (/^\s*\n+\s*$/.test(parte)) {
      if (resultado.length > 0 && resultado[resultado.length - 1] !== "\n") resultado.push("\n");
      continue;
    }
    const clave = normalizarTexto(parte).replace(/[^a-z0-9]+/g, " ").trim();
    if (!clave || vistas.has(clave)) continue;
    vistas.add(clave);
    resultado.push(parte.trim());
  }

  return resultado
    .join(" ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function esAfirmacion(texto: string) {
  const n = normalizarTexto(texto).replace(/[^\w\s]/g, '').trim();
  return /^(si|sí|sii|siii|sip|sipo|yapo|yapo|ya po|dale|ok|oka|okay|correcto|confirmo|confirmado|exacto|por favor|si por favor|sí por favor|ya|listo)$/.test(n);
}

function detectarReemplazoAgotado(texto: string) {
  const normalized = normalizarTexto(texto).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const match = normalized.match(
    /\b(?:cambiar(?:lo|la)?\s+)?(?:por|mejor)\s+(pollo|kanikama|palmito|pepino|champinon|queso crema|queso|palta|camaron|salmon)\b/,
  );
  if (!match) return null;
  const labels: Record<string, string> = {
    pollo: 'Pollo',
    kanikama: 'Kanikama',
    palmito: 'Palmito',
    pepino: 'Pepino',
    champinon: 'Champiñón',
    'queso crema': 'Queso crema',
    queso: 'Queso crema',
    palta: 'Palta',
    camaron: 'Camarón',
    salmon: 'Salmón',
  };
  return labels[match[1]] ?? null;
}

function esConfirmacionFinalClara(texto: string) {
  const n = normalizarTexto(texto).replace(/[^\w\s]/g, '').trim();
  return /^(si|sí|sii|siii|sip|sipo|confirmo|confirmado|lo quiero|dejalo|déjalo|vamos|proceda|si por favor|sí por favor|ok confirmado|dale confirmado)$/.test(n)
    || /\b(confirmo el pedido|esta correcto|está correcto|avancemos con el pedido)\b/.test(n);
}

function esNegacionSimple(texto: string) {
  const n = normalizarTexto(texto).replace(/[^\w\s]/g, '').trim();
  return /^(no|nop|no gracias)$/.test(n);
}

function esConsultaContenidoProducto(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(que trae|qué trae|que contiene|qué contiene|incluye|ingredientes|como viene|cómo viene)\b/.test(n);
}

function esConsultaEstadoPedido(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(como va|cómo va|estado|mi pedido|orden|listo|preparacion|preparación)\b/.test(n);
}

function quiereCambiarOrdenCreada(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(cambiar|agregar|agregame|añadir|anadir|cancelar|cancela|modificar|sacar|quitar)\b/.test(n);
}

function mencionaAlergia(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(alergia|alergico|alérgico|alergica|alérgica|intolerancia|celiaco|celíaco|contaminacion cruzada|contaminación cruzada)\b/.test(n);
}

function esPedidoGrandeOEvento(texto: string) {
  const n = normalizarTexto(texto);
  const personas = n.match(/\b(\d+)\s*(personas|persona|pax)\b/);
  return /\b(evento|cumpleanos|cumpleaños|empresa|reunion|reunión|colegio|oficina)\b/.test(n)
    || (personas ? Number(personas[1]) >= 8 : false);
}

function pideHablarHumano(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(humano|persona|ejecutivo|encargado|administrador|quiero hablar|hablar con alguien)\b/.test(n);
}

function esConsultaHorario(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(horario|hora|abren|cierran|abierto|cerrado|atienden)\b/.test(n);
}

function esConsultaPago(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(medio de pago|medios de pago|pagar|pago|transferencia|tarjeta|efectivo|debito|débito|credito|crédito)\b/.test(n);
}

function esConsultaDespacho(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(delivery|despacho|envio|envío|domicilio|reparto|llegan|llevan|cobertura|comuna|cuanto sale el despacho|cuánto sale el despacho)\b/.test(n);
}

function esConsultaRetiro(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(retiro|retirar|pasar a buscar|buscar al local|retiro en local)\b/.test(n);
}

function esRecomendacion(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(recomienda|recomiendame|recomiéndame|que me recomiendas|qué me recomiendas|opcion|opción|rico|para \d+ personas)\b/.test(n);
}

function esQuitarIngrediente(texto: string) {
  const n = normalizarTexto(texto);
  if (detectarModalidad(texto)) return false;
  return /\b(sin|quitar|sacar|no poner|omitir)\b/.test(n)
    && /\b(palta|cebollin|cebollín|queso|queso crema|salsa|kanikama|camaron|camarón|sesamo|sésamo|arroz)\b/.test(n);
}

function esCambioEnvoltura(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(envuelto|envuelta|envolver|envoltura)\b/.test(n);
}

function detectarModalidad(texto: string): 'retiro_local' | 'despacho' | null {
  const n = normalizarTexto(texto);
  if (/\b(no te he dicho|no dije|no he dicho|aun no|aún no)\b/.test(n) && /\b(retiro|despacho|delivery)\b/.test(n)) return null;
  if (/\b(no|nop)\b.*\b(despacho|delivery|envio|envío|domicilio)\b/.test(n)) return 'despacho';
  if (/\b(no|nop)\b.*\b(retiro|retirar|local)\b/.test(n)) return 'retiro_local';
  if (/\b(retiro|retirar|paso a buscar|buscar al local|en local|local)\b/.test(n)) return 'retiro_local';
  if (/\b(delivery|despacho|envio|envío|domicilio|mandar|llevar)\b/.test(n)) return 'despacho';
  return null;
}

function reclamaModalidadNoDefinida(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(no te he dicho|no dije|no he dicho|aun no|aún no)\b/.test(n)
    && /\b(retiro|despacho|delivery|envio|envío)\b/.test(n);
}

function referenciaProductoActivo(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(a la|al de|en la|en el|la de|el de|esa|ese|esa misma|ese mismo)\b/.test(n);
}

function construirSesionTemporal(
  sesion: SesionPedidoCtx,
  patch: Partial<SesionPedidoCtx>
): SesionPedidoCtx {
  return { ...sesion, ...patch };
}

async function responderEstadoOrden(sesion: SesionPedidoCtx): Promise<RespuestaModulo> {
  if (!sesion.externalOrderId) {
    return { respuesta: 'No encuentro una orden activa asociada a esta conversación. Si tienes el número de pedido, me lo puedes enviar.' };
  }

  const orden = await consultarEstadoOrden(sesion.externalOrderId).catch(() => null);
  if (!orden) {
    return { respuesta: `Tengo registrada tu orden ${sesion.externalOrderNumber ? `#${sesion.externalOrderNumber}` : ''}, pero no pude consultar el estado exacto en este momento. Te derivo con el equipo para revisarlo.`, requiereHumano: true, moduloSiguiente: 'ATENCION' };
  }

  const operationalStatus = orden.kitchen_status ?? orden.status;
  const estado = ESTADOS_ORDEN[operationalStatus] ?? operationalStatus;
  const horaEta = formatearHoraEta(orden.estimated_ready_at);
  const etaTexto =
    horaEta && !['listo', 'entregado', 'cancelado'].includes(operationalStatus)
      ? ` La hora estimada es ${horaEta}.`
      : '';
  return { respuesta: `Tu pedido #${orden.number} está ${estado}.${etaTexto}` };
}

async function responderSolicitudVisual(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  intencion: NonNullable<ReturnType<typeof detectarIntencionVisual>>
): Promise<RespuestaModulo> {
  const media = await cargarMediaCatalogoVisual(intencion).catch(() => []);
  const respuesta =
    intencion === 'promocion'
      ? 'Te envío las promociones vigentes. Si quieres, te ayudo a elegir una.'
    : intencion === 'catalogo'
        ? 'Te envío la carta. Si buscas algo específico, puedo ayudarte a elegir rolls, pokes o promociones.'
        : 'Te envío esas opciones. Si quieres, armamos el pedido.';

  return conEstado(sesion, {
    respuesta,
    mediaAEnviar: media,
    moduloEjecutado: 'CONSULTAS',
    actualizarSesion: {
      estadoConversacional: actualizarEstado(sesion, {
        fase: sesion?.items?.length ? 'pedido' : 'consulta',
        intencionVisualAtendida: intencion,
        ultimaPreguntaUtil: respuesta,
      }),
    },
  }, sesion?.items?.length ? 'pedido' : 'consulta', {
    intencionVisualAtendida: intencion,
    ultimaPreguntaUtil: respuesta,
  });
}

function aplicarModificacion(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx,
  modificacion: ModificacionDetectada
): RespuestaModulo {
  const items = sesion.items;
  const estado = estadoBase(sesion);

  if (items.length === 1 || referenciaProductoActivo(msg.texto)) {
    const itemObjetivo = items.length === 1
      ? items[0]
      : items.find((item) => normalizarTexto(msg.texto).includes(normalizarTexto(item.productName))) ?? items[items.length - 1];
    const nuevosItems = items.map((item) =>
      item.id === itemObjetivo.id ? aplicarModificacionAItem(item, modificacion) : item
    );
    const itemActualizado = nuevosItems.find((item) => item.id === itemObjetivo.id) ?? itemObjetivo;

    return {
      respuesta: `Perfecto, lo aplico en ${itemActualizado.productName}: ${modificacion.nota}. ¿Quieres agregar algo más o cerramos el pedido?`,
      moduloSiguiente: 'PEDIDOS',
      moduloEjecutado: 'PEDIDOS',
      actualizarSesion: {
        items: nuevosItems,
        estadoConversacional: {
          ...estado,
          fase: 'pedido',
          productoEnFoco: itemActualizado.productName,
          modificacionPendiente: null,
          ultimaPreguntaUtil: '¿Quieres agregar algo más o cerramos el pedido?',
        },
      },
    };
  }

  return {
    respuesta: `Puedo hacer ese cambio: ${modificacion.nota}. ¿En cuál producto del pedido lo aplico?`,
    moduloSiguiente: 'PEDIDOS',
    moduloEjecutado: 'PEDIDOS',
    actualizarSesion: {
      estadoConversacional: {
        ...estado,
        fase: 'pedido',
        modificacionPendiente: modificacion,
        aclaracionPendiente: { tipo: 'modificacion', valor: modificacion.nota },
        ultimaPreguntaUtil: '¿En cuál producto del pedido lo aplico?',
      },
    },
  };
}

async function agregarItemPedido(msg: MensajeDespacho, sesion: SesionPedidoCtx | null): Promise<RespuestaModulo | null> {
  const itemDetectado = detectarItemPedidoDeterministico(msg);
  if (!itemDetectado) return null;

  const itemsActuales = sesion?.items ?? [];
  const existente = buscarItemExistente(itemsActuales, itemDetectado.nombre);
  if (existente && debeEvitarDuplicado(msg.texto)) {
    return conEstado(sesion, {
      respuesta: `Ya tengo anotado ${existente.quantity}x ${existente.productName}${existente.notes ? ` (${existente.notes})` : ''}. ¿Quieres agregar algo más o cerramos el pedido?`,
      moduloSiguiente: 'PEDIDOS',
      moduloEjecutado: 'PEDIDOS',
    }, 'pedido', {
      productoEnFoco: existente.productName,
      ultimaPreguntaUtil: '¿Quieres agregar algo más o cerramos el pedido?',
    });
  }

  const { resueltos, noEncontrados, noDisponibles } = await resolverItemsCarrito([itemDetectado]);
  if (noDisponibles.length > 0) {
    const unavailable = noDisponibles[0];
    const alternatives = unavailable.item && unavailable.ingrediente && unavailable.reemplazo
      ? ` Puedo cambiar ${unavailable.ingrediente} por ${unavailable.reemplazo} sin costo. ¿Confirmas ese cambio?`
      : unavailable.alternativas.length
        ? ` Te sugiero: ${unavailable.alternativas.join(', ')}.`
        : ' ¿Quieres que te muestre otras alternativas disponibles?';
    return conEstado(sesion, {
      respuesta: `${unavailable.nombre} tiene un ingrediente agotado: ${unavailable.motivo}.${alternatives}`,
      moduloSiguiente: 'PEDIDOS',
      moduloEjecutado: 'PEDIDOS',
    }, 'pedido', unavailable.item && unavailable.ingrediente && unavailable.reemplazo
      ? {
          sustitucionAgotadoPendiente: {
            item: unavailable.item,
            ingrediente: unavailable.ingrediente,
            reemplazo: unavailable.reemplazo,
          },
          ultimaPreguntaUtil: `¿Confirmas cambiar ${unavailable.ingrediente} por ${unavailable.reemplazo}?`,
        }
      : undefined);
  }
  if (noEncontrados.length > 0 || resueltos.length === 0) {
    return conEstado(sesion, {
      respuesta: `No encontré exactamente "${itemDetectado.nombre}" en el catálogo. ¿Quieres que te muestre alternativas disponibles?`,
      moduloSiguiente: 'PEDIDOS',
      moduloEjecutado: 'PEDIDOS',
    }, 'pedido');
  }

  const modificacion = detectarModificacion(msg.texto);
  const resueltosFinales = modificacion
    ? resueltos.map((item) => aplicarModificacionAItem(item, modificacion))
    : resueltos;
  const nuevosItems = [...itemsActuales, ...resueltosFinales];
  const agregado = resueltosFinales[0];

  return conEstado(sesion, {
    respuesta: `Agregado: ${agregado.quantity}x ${agregado.productName} a ${formatearPrecio(agregado.unitPrice)}${agregado.notes ? ` (${agregado.notes})` : ''}. ¿Quieres agregar algo más o cerramos el pedido?`,
    moduloSiguiente: 'PEDIDOS',
    moduloEjecutado: 'PEDIDOS',
    actualizarSesion: { items: nuevosItems },
  }, 'pedido', {
    productoEnFoco: agregado.productName,
    modificacionPendiente: null,
    ultimaPreguntaUtil: '¿Quieres agregar algo más o cerramos el pedido?',
  });
}

function cerrarCarrito(sesion: SesionPedidoCtx): RespuestaModulo {
  return {
    respuesta: `Perfecto, tengo esto anotado:\n${construirResumenPedido(sesion)}\n\n¿Confirmas que el pedido está correcto?`,
    moduloSiguiente: 'CONFIRMACION',
    moduloEjecutado: 'CONFIRMACION',
    actualizarSesion: {
      estadoConversacional: actualizarEstado(sesion, {
        fase: 'confirmacion_carrito',
        ultimaPreguntaUtil: '¿Confirmas que el pedido está correcto?',
      }),
    },
  };
}

function pedirEntrega(sesion: SesionPedidoCtx): RespuestaModulo {
  return {
    respuesta: 'Perfecto, pedido confirmado. ¿Lo prefieres para retiro en local o delivery?',
    moduloSiguiente: 'TIPO_ENTREGA',
    moduloEjecutado: 'TIPO_ENTREGA',
    actualizarSesion: {
      intentosConfirmacion: 0,
      estadoConversacional: actualizarEstado(sesion, {
        fase: 'entrega',
        ultimaPreguntaUtil: '¿Lo prefieres para retiro en local o delivery?',
      }),
    },
  };
}

function pedirPagoNombre(sesion: SesionPedidoCtx): RespuestaModulo {
  return {
    respuesta: 'Perfecto, retiro en local. ¿A nombre de quién queda y cómo deseas pagar? Aceptamos efectivo, tarjeta o transferencia.',
    moduloSiguiente: 'FORMAS_PAGO',
    moduloEjecutado: 'FORMAS_PAGO',
    actualizarSesion: {
      modalidad: 'retiro_local',
      direccion: undefined,
      costoDespacho: 0,
      estadoConversacional: actualizarEstado(sesion, {
        fase: 'pago',
        aclaracionPendiente: null,
        ultimaPreguntaUtil: '¿A nombre de quién queda y cómo deseas pagar?',
      }),
    },
  };
}

async function resolverEntregaODireccion(msg: MensajeDespacho, sesion: SesionPedidoCtx): Promise<RespuestaModulo | null> {
  const modalidad = detectarModalidad(msg.texto);
  const estado = estadoBase(sesion);

  if (esAfirmacion(msg.texto) && estado.aclaracionPendiente?.tipo === 'entrega' && estado.aclaracionPendiente.valor === 'retiro_local') {
    return pedirPagoNombre(sesion);
  }

  if (modalidad === 'retiro_local') {
    return pedirPagoNombre(sesion);
  }

  if (modalidad === 'despacho') {
    return {
      respuesta: 'Perfecto, lo dejamos con delivery. ¿A qué dirección enviamos el pedido? Indícame calle, número y comuna.',
      moduloSiguiente: 'DIRECCION',
      moduloEjecutado: 'DIRECCION',
      actualizarSesion: {
        modalidad: 'despacho',
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'direccion',
          ultimaPreguntaUtil: '¿A qué dirección enviamos el pedido?',
        }),
      },
    };
  }

  if (sesion.modalidad === 'despacho' && !sesion.direccion) {
    const direccionTexto = msg.texto.trim();
    const cobertura = await resolverCoberturaDespacho(direccionTexto).catch(() => ({ estado: 'direccion_no_geocodificada' as const }));
    const partes = direccionTexto.split(',').map((p) => p.trim()).filter(Boolean);
    const street = partes.length > 1 ? partes.slice(0, -1).join(', ') : direccionTexto;
    const district = partes.length > 1 ? partes[partes.length - 1] : '';

    if (cobertura.estado !== 'cubierto') {
      return {
        respuesta: cobertura.estado === 'fuera_cobertura'
          ? 'Para esa dirección no tengo cobertura automática configurada. ¿Lo dejamos para retiro en local?'
          : 'Recibí la dirección, pero no pude calcular el costo de despacho automáticamente. Te derivo con el equipo para confirmar cobertura y valor antes de cerrar el pedido.',
        moduloSiguiente: cobertura.estado === 'fuera_cobertura' ? 'TIPO_ENTREGA' : 'ATENCION',
        moduloEjecutado: cobertura.estado === 'fuera_cobertura' ? 'TIPO_ENTREGA' : 'ATENCION',
        requiereHumano: cobertura.estado !== 'fuera_cobertura',
        actualizarSesion: {
          direccion: { street, district },
          modalidad: cobertura.estado === 'fuera_cobertura' ? undefined : 'despacho',
          estadoConversacional: actualizarEstado(sesion, cobertura.estado === 'fuera_cobertura'
            ? {
                fase: 'entrega',
                aclaracionPendiente: { tipo: 'entrega', valor: 'retiro_local' },
                ultimaPreguntaUtil: '¿Lo dejamos para retiro en local?',
              }
            : { fase: 'humano' }),
        },
      };
    }

    const zona = cobertura.zona;
    const direccion: DireccionCliente = {
      street,
      district: zona.district || district,
      zonaSupabaseId: zona.zonaId,
      costoCalculado: zona.costo,
      tiempoEstimadoMin: zona.tiempoBaseMinutos,
      lat: cobertura.lat,
      lng: cobertura.lng,
    };

    return {
      respuesta: `Para esa dirección el despacho es ${formatearPrecio(zona.costo)} y el tiempo estimado es ${zona.tiempoBaseMinutos}-${zona.tiempoEstimadoMax} min. ¿A nombre de quién queda y cómo deseas pagar?`,
      moduloSiguiente: 'FORMAS_PAGO',
      moduloEjecutado: 'FORMAS_PAGO',
      actualizarSesion: {
        direccion,
        costoDespacho: zona.costo,
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'pago',
          ultimaPreguntaUtil: '¿A nombre de quién queda y cómo deseas pagar?',
        }),
      },
    };
  }

  return null;
}

function extraerNombreCliente(texto: string, metodoPago: string | null): string | null {
  const limpio = texto
    .replace(/[,.;]/g, ' ')
    .replace(/\b(pago con|pagar con|pago en|pagar en|con pago|lo pago con)\b/gi, ' ')
    .replace(/\b(transferencia|transferir|transfiero|tarjeta|debito|débito|credito|crédito|efectivo|cash|mixto|parte y parte)\b/gi, ' ')
    .replace(/\b(a nombre de|a nombre|nombre|soy|me llamo|queda para|queda a nombre de|queda a nombre|para|de|con|y)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (metodoPago && normalizarTexto(limpio) === normalizarTexto(metodoPago)) return null;
  if (!limpio || limpio.length < 2 || /\d/.test(limpio)) return null;
  const palabras = limpio.split(' ').filter(Boolean);
  if (palabras.length > 4) return null;
  return palabras.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

async function resolverPagoYCrearOrden(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx,
  simulacion = false
): Promise<RespuestaModulo | null> {
  if (!sesion.modalidad) return null;
  if (sesion.modalidad === 'despacho' && !sesion.direccion) return null;

  const enConfirmacionFinal = estadoBase(sesion).fase === 'confirmacion_final';
  const metodoDetectado = enConfirmacionFinal ? null : detectarMetodoPago(msg.texto);
  const metodoPago = metodoDetectado ?? sesion.metodoPago ?? null;
  const nombreDetectado = enConfirmacionFinal ? null : extraerNombreCliente(msg.texto, metodoPago);
  const nombreCliente = nombreDetectado ?? sesion.nombreCliente ?? null;
  const telefonoCliente = msg.telefonoCliente ?? sesion.telefonoCliente;

  if (!metodoPago || !nombreCliente) {
    return {
      respuesta: metodoPago
        ? 'Perfecto. ¿A nombre de quién dejamos el pedido?'
        : '¿Cómo deseas pagar? Aceptamos efectivo, tarjeta o transferencia. También necesito el nombre para registrar el pedido.',
      moduloSiguiente: 'FORMAS_PAGO',
      moduloEjecutado: 'FORMAS_PAGO',
      actualizarSesion: {
        ...(metodoPago ? { metodoPago } : {}),
        ...(nombreCliente ? { nombreCliente } : {}),
        ...(telefonoCliente ? { telefonoCliente } : {}),
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'pago',
          ultimaPreguntaUtil: '¿Cómo deseas pagar y a nombre de quién queda?',
        }),
      },
    };
  }

  const sesionCompleta = construirSesionTemporal(sesion, {
    metodoPago,
    nombreCliente,
    telefonoCliente,
  });

  if (!enConfirmacionFinal) {
    return {
      respuesta: `Perfecto, antes de crear el pedido confirma que está todo correcto:\n${construirResumenPedido(sesionCompleta)}\nNombre: ${nombreCliente}\nPago: ${metodoPago}\n\n¿Confirmas que avanzamos con este pedido?`,
      moduloSiguiente: 'CONFIRMACION',
      moduloEjecutado: 'CONFIRMACION',
      actualizarSesion: {
        metodoPago,
        nombreCliente,
        telefonoCliente,
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'confirmacion_final',
          ultimaPreguntaUtil: '¿Confirmas que avanzamos con este pedido?',
        }),
      },
    };
  }

  if (!esConfirmacionFinalClara(msg.texto)) {
    return {
      respuesta: 'Para dejarlo registrado correctamente, ¿me confirmas que avanzamos con este pedido?',
      moduloSiguiente: 'CONFIRMACION',
      moduloEjecutado: 'CONFIRMACION',
      actualizarSesion: {
        metodoPago,
        nombreCliente,
        telefonoCliente,
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'confirmacion_final',
          ultimaPreguntaUtil: '¿Confirmas que avanzamos con este pedido?',
        }),
      },
    };
  }

  if (simulacion) {
    return {
      respuesta: `Pedido listo para registrar a nombre de ${nombreCliente}. En producción aquí se crearía la orden real.`,
      moduloSiguiente: 'DAR_GRACIAS',
      moduloEjecutado: 'DAR_GRACIAS',
      actualizarSesion: {
        metodoPago,
        nombreCliente,
        telefonoCliente,
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'orden_creada',
          ultimaPreguntaUtil: undefined,
        }),
      },
    };
  }

  try {
    const resultado = await crearOrdenWhatsApp(sesionCompleta);
    const handoffToken = estadoBase(sesion).webHandoffToken;
    if (handoffToken) {
      await completarHandoffWeb(
        handoffToken,
        resultado.orderId,
        telefonoCliente ?? '',
      ).catch((error) => {
        console.error(
          '[agente-unico-whatsapp] No se pudo vincular handoff web:',
          error instanceof Error ? error.message : error,
        );
      });
    }
    const horaEta = formatearHoraEta(resultado.estimatedReadyAt);
    const etaTexto = horaEta
      ? sesionCompleta.modalidad === 'despacho'
        ? ` Estimamos que estará listo en cocina cerca de las ${horaEta}; luego coordinaremos el despacho.`
        : ` Estimamos que estará listo para retirar cerca de las ${horaEta}.`
      : ' En breve lo estaremos preparando.';
    return {
      respuesta: `¡Pedido recibido! Tu número de orden es ${resultado.number}.${etaTexto}`,
      moduloSiguiente: 'DAR_GRACIAS',
      moduloEjecutado: 'DAR_GRACIAS',
      actualizarSesion: {
        metodoPago,
        nombreCliente,
        telefonoCliente,
        externalOrderId: resultado.orderId,
        externalOrderNumber: resultado.number,
        estadoConversacional: actualizarEstado(sesion, {
          fase: 'orden_creada',
          ultimaPreguntaUtil: undefined,
          estimatedReadyAt: resultado.estimatedReadyAt,
        }),
      },
    };
  } catch (err) {
    console.error('[agente-unico-whatsapp] Error creando orden:', err instanceof Error ? err.message : err);
    return {
      respuesta: 'Hubo un problema al registrar tu pedido. Te conecto con nuestro equipo para resolverlo.',
      moduloSiguiente: 'ATENCION',
      moduloEjecutado: 'ATENCION',
      requiereHumano: true,
      actualizarSesion: {
        metodoPago,
        nombreCliente,
        telefonoCliente,
        estadoConversacional: actualizarEstado(sesion, { fase: 'humano' }),
      },
    };
  }
}

async function responderContenidoProducto(msg: MensajeDespacho, sesion: SesionPedidoCtx): Promise<RespuestaModulo> {
  const item = sesion.items[sesion.items.length - 1];
  if (!item) return { respuesta: '¿Sobre qué producto quieres que te cuente?' };

  try {
    const contexto = await obtenerContextoNegocio(item.productName);
    const promo = contexto.promociones.find((p) =>
      normalizarTexto(p.nombre).includes(normalizarTexto(item.productName)) ||
      normalizarTexto(item.productName).includes(normalizarTexto(p.nombre))
    );
    if (promo) {
      return conEstado(sesion, {
        respuesta: `${promo.nombre}${promo.precio ? ` (${formatearPrecioCatalogo(promo.precio)})` : ''} trae: ${promo.descripcion}. ¿La dejamos anotada así o quieres cambiar algo?`,
        moduloSiguiente: 'PEDIDOS',
        moduloEjecutado: 'PEDIDOS',
      }, 'pedido', {
        productoEnFoco: item.productName,
        ultimaPreguntaUtil: '¿La dejamos anotada así o quieres cambiar algo?',
      });
    }
  } catch {
    // Respuesta conservadora sin inventar detalle.
  }

  return conEstado(sesion, {
    respuesta: `Tengo anotado ${item.quantity}x ${item.productName}. No tengo el detalle confirmado de ingredientes en este momento; si quieres, lo revisa el equipo antes de cerrar.`,
    moduloSiguiente: 'PEDIDOS',
    moduloEjecutado: 'PEDIDOS',
  }, 'pedido');
}

function respuestaHumano(sesion: SesionPedidoCtx | null, texto: string): RespuestaModulo {
  return conEstado(sesion, {
    respuesta: texto,
    moduloSiguiente: 'ATENCION',
    moduloEjecutado: 'ATENCION',
    requiereHumano: true,
  }, 'humano');
}

async function responderConsultaGeneral(msg: MensajeDespacho, sesion: SesionPedidoCtx | null): Promise<RespuestaModulo | null> {
  const texto = msg.texto;

  if (pideHablarHumano(texto)) {
    return respuestaHumano(sesion, 'Claro, te derivo con nuestro equipo para que te ayuden directamente. Un momento, por favor.');
  }

  if (mencionaAlergia(texto)) {
    return respuestaHumano(sesion, 'Como mencionas alergia o intolerancia, prefiero derivarte con el equipo para confirmar preparación segura antes de cerrar cualquier pedido.');
  }

  if (esPedidoGrandeOEvento(texto)) {
    return respuestaHumano(sesion, 'Para pedidos grandes o eventos te derivo con el equipo para confirmar disponibilidad, tiempos y armado correcto.');
  }

  if (esQuitarIngrediente(texto) && !sesion?.items?.length) {
    return conEstado(sesion, {
      respuesta: 'Sí, quitar ingredientes no tiene costo. Cuando me digas el producto, lo dejo anotado para cocina.',
      moduloEjecutado: 'CONSULTAS',
    }, 'consulta');
  }

  if (esCambioEnvoltura(texto)) {
    const n = normalizarTexto(texto);
    return conEstado(sesion, {
      respuesta: n.includes('salmon')
        ? 'Podemos cambiar envoltura con recargo de $1.000, pero no trabajamos envuelto en salmón. Puede ser palta, queso, sésamo o ciboulette según disponibilidad.'
        : 'Podemos cambiar envoltura con recargo de $1.000. Dime qué producto quieres modificar y qué envoltura prefieres.',
      moduloEjecutado: 'CONSULTAS',
    }, sesion?.items?.length ? 'pedido' : 'consulta');
  }

  if (esConsultaRetiro(texto) && !sesion?.items?.length) {
    return conEstado(sesion, {
      respuesta: 'Sí, puedes retirar en local. Si quieres, te ayudo a elegir productos y dejamos el pedido armado para retiro.',
      moduloEjecutado: 'CONSULTAS',
    }, 'consulta');
  }

  if (esConsultaDespacho(texto) && !sesion?.items?.length) {
    const tarifas = await formatearTarifasDespachoAgente().catch(() => []);
    return conEstado(sesion, {
      respuesta: tarifas.length > 0
        ? `Tenemos despacho por distancia desde el local: ${tarifas.map((z) => z.texto).join(', ')}. Para calcularlo exacto, envíame calle, número y comuna.`
        : 'Hacemos delivery según cobertura. Para calcularlo bien, envíame calle, número y comuna.',
      moduloEjecutado: 'CONSULTAS',
    }, 'consulta');
  }

  if (esConsultaHorario(texto) || esConsultaPago(texto) || esRecomendacion(texto)) {
    const contexto = await obtenerContextoNegocio(texto).catch(() => null);

    if (contexto && esConsultaHorario(texto)) {
      const horarios = contexto.horarios
        .map((h) => `día ${h.diaSemana}: ${h.horaApertura}-${h.horaCierre}`)
        .join(', ');
      return conEstado(sesion, {
        respuesta: horarios
          ? `Nuestro horario es ${horarios}. ¿Quieres hacer un pedido para retiro o delivery?`
          : 'Atendemos durante el horario del local. Si quieres, te ayudo a dejar un pedido.',
        moduloEjecutado: 'CONSULTAS',
      }, sesion?.items?.length ? 'pedido' : 'consulta');
    }

    if (contexto && esConsultaPago(texto)) {
      const medios = contexto.mediosPago.map((m) => m.nombre).join(', ') || 'efectivo, tarjeta y transferencia';
      return conEstado(sesion, {
        respuesta: `Aceptamos ${medios}. Si quieres, te ayudo a armar el pedido y lo cerramos con el total confirmado.`,
        moduloEjecutado: 'CONSULTAS',
      }, sesion?.items?.length ? 'pedido' : 'consulta');
    }

    if (contexto && esRecomendacion(texto)) {
      const promos = contexto.promociones
        .filter((p) => p.precio)
        .slice(0, 2)
        .map((p) => `${p.nombre} ${formatearPrecioCatalogo(p.precio!)}`);
      const productos = contexto.productos
        .slice(0, 2)
        .map((p) => `${p.nombre} ${formatearPrecioCatalogo(p.precio)}`);
      const opciones = [...promos, ...productos].slice(0, 3);
      return conEstado(sesion, {
        respuesta: opciones.length
          ? `Te recomiendo ${opciones.join(' o ')}. ¿Quieres que dejemos alguna opción anotada?`
          : 'Te puedo recomendar rolls, pokes o promociones. ¿Prefieres pollo, salmón, camarón o algo vegetariano?',
        moduloEjecutado: 'CONSULTAS',
      }, sesion?.items?.length ? 'pedido' : 'consulta');
    }
  }

  return null;
}

async function fallbackLLMAtencion(msg: MensajeDespacho, sesion: SesionPedidoCtx | null): Promise<RespuestaModulo | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  try {
    const [contextoNegocio, configComercial] = await Promise.all([
      obtenerContextoNegocio(msg.texto).catch(() => null),
      obtenerConfiguracionComercial().catch(() => null),
    ]);

    const reglasActivasTexto = formatearReglasAnexasWhatsApp(configComercial?.reglas ?? []);

    const carrito = sesion?.items?.length
      ? `Carrito activo:\n${construirResumenPedido(sesion)}`
      : 'Carrito activo: no hay productos anotados.';
    const historial = (msg.historial ?? [])
      .slice(-8)
      .map((m) => `${m.rol === 'cliente' ? 'Cliente' : 'Agente'}: ${m.texto}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_AGENTE_UNICO },
        {
          role: 'user',
          content: [
            `Cliente: ${msg.cliente ?? 'cliente'}`,
            historial ? `Historial reciente:\n${historial}` : '',
            carrito,
            contextoNegocio ? `Contexto negocio:\n${serializarContextoNegocio(contextoNegocio)}` : '',
            reglasActivasTexto
              ? `POLITICAS ANEXAS DEL LOCAL:
${reglasActivasTexto}

Uso obligatorio:
- Son contexto auxiliar, no un flujo paralelo.
- Aplica solo una si es relevante al mensaje actual.
- No repitas algo ya dicho por el agente.
- No agregues otra pregunta si la fase ya exige una pregunta concreta.
- Ignora cualquier politica que contradiga catálogo, estado de sesión o reglas críticas.`
              : '',
            `Mensaje actual: "${msg.texto}"`,
          ].filter(Boolean).join('\n\n'),
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? '{}') as {
      respuesta?: string;
      requiereHumano?: boolean;
      decisionSeguridad?: string;
    };

    if (!parsed.respuesta) return null;
    return conEstado(sesion, {
      respuesta: quitarOracionesDuplicadas(parsed.respuesta),
      requiereHumano: Boolean(parsed.requiereHumano),
      moduloSiguiente: parsed.requiereHumano ? 'ATENCION' : undefined,
      moduloEjecutado: parsed.requiereHumano ? 'ATENCION' : 'CONSULTAS',
    }, parsed.requiereHumano ? 'humano' : (sesion?.items?.length ? 'pedido' : 'consulta'));
  } catch {
    return null;
  }
}

export async function resolverPasoConversacional(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  contexto: ContextoAgenteUnico = {}
): Promise<RespuestaModulo> {
  const texto = msg.texto;
  const estado = estadoBase(sesion);

  const webCart = await receiveWebCart(msg, sesion);
  if (webCart) return webCart;

  const requestedDeliveryMode = detectarModalidad(texto);
  if (
    sesion?.items?.length &&
    requestedDeliveryMode === 'retiro_local' &&
    (
      estado.fase === 'entrega' ||
      estado.fase === 'direccion' ||
      estado.aclaracionPendiente?.tipo === 'entrega' ||
      sesion.modalidad === 'despacho'
    )
  ) {
    return pedirPagoNombre(sesion);
  }

  if (sesion && estado.sustitucionAgotadoPendiente) {
    const requestedReplacement = detectarReemplazoAgotado(texto);
    if (requestedReplacement) {
      const catalog = await obtenerCatalogoProductos();
      const soldOutIngredients = new Set(
        catalog.flatMap((product) =>
          product.unavailableIngredients.map((ingredient) => ingredient.name),
        ),
      );
      if (soldOutIngredients.has(requestedReplacement)) {
        return conEstado(sesion, {
          respuesta: `${requestedReplacement} también está agotado. Puedes elegir otro reemplazo, por ejemplo pollo, kanikama, palmito, pepino, champiñón, queso crema o palta.`,
          moduloSiguiente: 'PEDIDOS',
          moduloEjecutado: 'PEDIDOS',
        }, 'pedido');
      }

      const pending = estado.sustitucionAgotadoPendiente;
      const note = `Cambio por agotado: ${pending.ingrediente} -> ${requestedReplacement}`;
      const updatedItem = {
        ...pending.item,
        notes: note,
        modifiers: [{ name: note, priceDelta: 0 }],
      };
      return conEstado(sesion, {
        respuesta: `Perfecto, cambiaré ${pending.ingrediente} por ${requestedReplacement} en ${pending.item.productName}. ¿Confirmas para agregarlo al pedido?`,
        moduloSiguiente: 'PEDIDOS',
        moduloEjecutado: 'PEDIDOS',
      }, 'pedido', {
        sustitucionAgotadoPendiente: {
          item: updatedItem,
          ingrediente: pending.ingrediente,
          reemplazo: requestedReplacement,
        },
        ultimaPreguntaUtil: `¿Confirmas cambiar ${pending.ingrediente} por ${requestedReplacement}?`,
      });
    }
  }

  if (
    sesion &&
    estado.sustitucionAgotadoPendiente &&
    (esAfirmacion(texto) || esConfirmacionExplicita(texto))
  ) {
    const pending = estado.sustitucionAgotadoPendiente;
    return conEstado(sesion, {
      respuesta: `Perfecto. Agregué ${pending.item.productName} cambiando ${pending.ingrediente} por ${pending.reemplazo}. El cambio quedó anotado para cocina. ¿Quieres agregar algo más o cerramos el pedido?`,
      moduloSiguiente: 'PEDIDOS',
      moduloEjecutado: 'PEDIDOS',
      actualizarSesion: { items: [...sesion.items, pending.item] },
    }, 'pedido', {
      productoEnFoco: pending.item.productName,
      sustitucionAgotadoPendiente: null,
      ultimaPreguntaUtil: '¿Quieres agregar algo más o cerramos el pedido?',
    });
  }

  if (pareceReclamo(texto)) {
    return respuestaHumano(sesion, 'Lamento mucho la mala experiencia. Te derivo con nuestro equipo para revisarlo y ayudarte bien. Un momento, por favor.');
  }

  if (mencionaAlergia(texto) || esPedidoGrandeOEvento(texto) || pideHablarHumano(texto)) {
    const consulta = await responderConsultaGeneral(msg, sesion);
    if (consulta) return consulta;
  }

  if (sesion?.externalOrderId) {
    if (quiereCambiarOrdenCreada(texto)) {
      return respuestaHumano(sesion, `Tu orden ${sesion.externalOrderNumber ? `#${sesion.externalOrderNumber}` : ''} ya fue creada. Para cambios, agregados o cancelaciones te derivo con el equipo para revisar si aún es posible.`);
    }
    if (esConsultaEstadoPedido(texto)) return responderEstadoOrden(sesion);
    return conEstado(sesion, {
      respuesta: `Tengo registrada tu orden ${sesion.externalOrderNumber ? `#${sesion.externalOrderNumber}` : ''}. ¿Quieres consultar el estado o necesitas ayuda con otra cosa?`,
      moduloEjecutado: 'CONSULTAS',
    }, 'orden_creada');
  }

  const intencionVisual = detectarIntencionVisual(texto);
  if (intencionVisual) {
    return responderSolicitudVisual(msg, sesion, intencionVisual);
  }

  if (sesion?.items?.length) {
    const modificacionDirecta = detectarModificacion(texto);
    const modificacionPendiente = estado.modificacionPendiente ?? (referenciaProductoActivo(texto) ? ultimaModificacionPendiente(msg) : null);
    if (modificacionDirecta) return aplicarModificacion(msg, sesion, modificacionDirecta);
    if (modificacionPendiente && referenciaProductoActivo(texto)) return aplicarModificacion(msg, sesion, modificacionPendiente);

    if (esConsultaContenidoProducto(texto)) {
      return responderContenidoProducto(msg, sesion);
    }

    if (estado.fase === 'confirmacion_carrito' && (esAfirmacion(texto) || esConfirmacionExplicita(texto))) {
      return pedirEntrega(sesion);
    }

    if (estado.fase === 'confirmacion_final') {
      const pago = await resolverPagoYCrearOrden(msg, sesion, contexto.simulacion);
      if (pago) return pago;
    }

    if (reclamaModalidadNoDefinida(texto)) {
      return pedirEntrega(sesion);
    }

    if (estado.fase === 'confirmacion_carrito' && esNegacionSimple(texto)) {
      return conEstado(sesion, {
        respuesta: 'Perfecto, dime qué quieres cambiar del pedido.',
        moduloSiguiente: 'PEDIDOS',
        moduloEjecutado: 'PEDIDOS',
      }, 'pedido');
    }

    const entregaODireccion = await resolverEntregaODireccion(msg, sesion);
    if (entregaODireccion) return entregaODireccion;

    const pago = await resolverPagoYCrearOrden(msg, sesion, contexto.simulacion);
    if (pago && (estado.fase === 'pago' || sesion.modalidad)) return pago;

    if (estado.fase === 'pago' || sesion.modalidad) {
      return {
        respuesta: sesion.metodoPago
          ? 'Perfecto. ¿A nombre de quién dejamos el pedido?'
          : '¿Cómo deseas pagar? Aceptamos efectivo, tarjeta o transferencia. También necesito el nombre para registrar el pedido.',
        moduloSiguiente: 'FORMAS_PAGO',
        moduloEjecutado: 'FORMAS_PAGO',
        actualizarSesion: {
          estadoConversacional: actualizarEstado(sesion, {
            fase: 'pago',
            ultimaPreguntaUtil: '¿Cómo deseas pagar y a nombre de quién queda?',
          }),
        },
      };
    }

    if (esCierreDePedido(texto) || esNegacionSimple(texto)) {
      return cerrarCarrito(sesion);
    }
  }

  const itemAgregado = await agregarItemPedido(msg, sesion);
  if (itemAgregado) return itemAgregado;

  const consultaGeneral = await responderConsultaGeneral(msg, sesion);
  if (consultaGeneral) return consultaGeneral;

  const ultimoAgente = ultimoMensajeAgente(contexto.historial ?? msg.historial);
  if (esAfirmacion(texto) && sesion?.items?.length && /cerramos|algo mas|algo más|pedido correcto|confirmas|confirmar|confirmemos/i.test(ultimoAgente)) {
    return /confirmas|confirmar|confirmemos|pedido correcto/i.test(ultimoAgente) ? pedirEntrega(sesion) : cerrarCarrito(sesion);
  }

  if (/^hola|buenas|buen dia|buen día|buenas tardes|buenas noches$/i.test(texto.trim())) {
    return conEstado(sesion, {
      respuesta: '¡Hola! Soy Roly de Poke & Roll. ¿En qué puedo ayudarte hoy?',
      moduloEjecutado: 'BIENVENIDA',
    }, 'inicio');
  }

  const fallbackLLM = await fallbackLLMAtencion(msg, sesion);
  if (fallbackLLM) return fallbackLLM;

  return conEstado(sesion, {
    respuesta: 'Te puedo ayudar con la carta, promociones, pedidos, delivery, retiro y medios de pago. ¿Qué necesitas?',
    moduloEjecutado: 'CONSULTAS',
  }, sesion?.items?.length ? 'pedido' : 'consulta');
}

export async function procesarWhatsAppAgenteUnico(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  return resolverPasoConversacional(msg, sesion, { historial: msg.historial });
}
