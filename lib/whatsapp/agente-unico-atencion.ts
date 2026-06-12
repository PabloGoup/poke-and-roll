import OpenAI from 'openai';
import { cargarMediaCatalogoVisual, detectarIntencionVisual } from '@/lib/catalogo-visual';
import {
  obtenerContextoNegocio,
  formatearPrecio as formatearPrecioCatalogo,
  serializarContextoNegocio,
} from '@/lib/catalogo';
import { REGLAS_COMERCIALES, TONO_Y_ESTILO } from '@/lib/modulos/contexto-comercial';
import { formatearTarifasDespachoAgente, resolverCoberturaDespacho } from '@/lib/zonas-despacho';
import { crearOrdenWhatsApp, consultarEstadoOrden, resolverItemsCarrito } from '@/lib/supabase-pedidos';
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
};

type EstadoFase = NonNullable<EstadoConversacionalWA['fase']>;

const ESTADOS_ORDEN: Record<string, string> = {
  pending: 'pendiente',
  confirmed: 'confirmado',
  preparing: 'en preparación',
  ready: 'listo para entrega',
  dispatched: 'en camino',
  delivered: 'entregado',
  cancelled: 'cancelado',
};

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
- No inventes productos, precios, promociones, zonas, horarios, stock ni tiempos.
- Si el cliente pregunta por menu/carta/promociones, el sistema adjunta media; tu texto debe ser corto.
- Si falta un dato para cerrar pedido, pregunta solo ese dato.
- Si hay reclamo, alergia severa, reembolso, pedido grande/evento o cambio de orden ya creada, requiereHumano true.
- No escribas resumen de pedido ni confirmes orden si no aparece en el contexto.
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

function esAfirmacion(texto: string) {
  const n = normalizarTexto(texto).replace(/[^\w\s]/g, '').trim();
  return /^(si|sí|sii|siii|sip|sipo|yapo|yapo|ya po|dale|ok|oka|okay|correcto|confirmo|confirmado|exacto|por favor|si por favor|sí por favor|ya|listo)$/.test(n);
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

  const estado = ESTADOS_ORDEN[orden.status] ?? orden.status;
  return { respuesta: `Tu pedido #${orden.number} está ${estado}.` };
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
        ? 'Te envío la carta. Si buscas algo específico, puedo ayudarte a elegir.'
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

  const { resueltos, noEncontrados } = await resolverItemsCarrito([itemDetectado]);
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
      estadoConversacional: actualizarEstado(sesion, {
        fase: 'pago',
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
    .replace(/\b(transferencia|transferir|transfiero|tarjeta|debito|débito|credito|crédito|efectivo|cash|mixto|parte y parte)\b/gi, ' ')
    .replace(/\b(a nombre de|nombre|soy|me llamo|queda para|para)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (metodoPago && normalizarTexto(limpio) === normalizarTexto(metodoPago)) return null;
  if (!limpio || limpio.length < 2 || /\d/.test(limpio)) return null;
  const palabras = limpio.split(' ').filter(Boolean);
  if (palabras.length > 4) return null;
  return palabras.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

async function resolverPagoYCrearOrden(msg: MensajeDespacho, sesion: SesionPedidoCtx): Promise<RespuestaModulo | null> {
  if (!sesion.modalidad) return null;
  if (sesion.modalidad === 'despacho' && !sesion.direccion) return null;

  const metodoDetectado = detectarMetodoPago(msg.texto);
  const metodoPago = metodoDetectado ?? sesion.metodoPago ?? null;
  const nombreDetectado = extraerNombreCliente(msg.texto, metodoDetectado);
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

  try {
    const resultado = await crearOrdenWhatsApp(sesionCompleta);
    return {
      respuesta: `¡Pedido recibido! Tu número de orden es ${resultado.number}. En breve lo estaremos preparando.`,
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
    const contextoNegocio = await obtenerContextoNegocio(msg.texto).catch(() => null);
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
      respuesta: parsed.respuesta,
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

    const pago = await resolverPagoYCrearOrden(msg, sesion);
    if (pago && (estado.fase === 'pago' || sesion.modalidad)) return pago;

    if (esCierreDePedido(texto) || esNegacionSimple(texto)) {
      return cerrarCarrito(sesion);
    }
  }

  const itemAgregado = await agregarItemPedido(msg, sesion);
  if (itemAgregado) return itemAgregado;

  const consultaGeneral = await responderConsultaGeneral(msg, sesion);
  if (consultaGeneral) return consultaGeneral;

  const ultimoAgente = ultimoMensajeAgente(contexto.historial ?? msg.historial);
  if (esAfirmacion(texto) && sesion?.items?.length && /cerramos|algo mas|algo más|pedido correcto|confirmas/i.test(ultimoAgente)) {
    return /confirmas|pedido correcto/i.test(ultimoAgente) ? pedirEntrega(sesion) : cerrarCarrito(sesion);
  }

  if (/^hola|buenas|buen dia|buen día|buenas tardes|buenas noches$/i.test(texto.trim())) {
    return conEstado(sesion, {
      respuesta: '¡Hola! Soy tu asistente virtual de Sushi Poke & Roll. ¿En qué puedo ayudarte?',
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
