// ============================================================
// lib/modulos/dispatcher.ts — Despachador central de módulos IA
// ============================================================

import { guardarLogModulo } from '@/lib/db-helpers';
import { formatearPrecio, obtenerContextoNegocio } from '@/lib/catalogo';
import {
  type ModuloAgente,
  type MensajeDespacho,
  type RespuestaModulo,
  type SesionPedidoCtx,
  TRANSICIONES_VALIDAS,
} from './types';
import { construirResumenPedido, esCierreDePedido, normalizarTexto, pareceReclamo } from './flujo-utils';
import { detectarIntencionVisual } from '@/lib/catalogo-visual';
import { detectarModificacion } from './intenciones-pedido';

// --------------- Tipo de handler ----------------------------

type HandlerModule = {
  ejecutar: (
    msg: MensajeDespacho,
    sesion: SesionPedidoCtx | null
  ) => Promise<RespuestaModulo>;
};

// --------------- Mapa de imports dinámicos ------------------
// Los módulos m01-m13 se cargan bajo demanda para evitar dependencias circulares.

const HANDLERS: Record<ModuloAgente, () => Promise<HandlerModule>> = {
  BIENVENIDA:        () => import('./m01-bienvenida'),
  CONSULTAS:         () => import('./m02-consultas'),
  ATENCION:          () => import('./m03-atencion'),
  PEDIDOS:           () => import('./m04-pedidos'),
  ORDEN_COMPRA:      () => import('./m05-orden-compra'),
  ORDEN_CANCELACION: () => import('./m06-orden-cancelacion'),
  CONFIRMACION:      () => import('./m07-confirmacion'),
  TIPO_ENTREGA:      () => import('./m08-tipo-entrega'),
  DIRECCION:         () => import('./m09-direccion'),
  FORMAS_PAGO:       () => import('./m10-formas-pago'),
  DAR_GRACIAS:       () => import('./m11-dar-gracias'),
  ENTREGA:           () => import('./m12-entrega'),
  DESPEDIDA:         () => import('./m13-despedida'),
};

// --------------- Respuesta de escalada ----------------------

function respuestaEscalada(motivo: string): RespuestaModulo {
  console.warn('[dispatcher] Escalando conversación:', motivo);
  return {
    respuesta:
      'En este momento necesito derivarte con nuestro equipo para darte la mejor atención. Un momento, por favor.',
    moduloSiguiente: 'ATENCION',
    requiereHumano: true,
    actualizarSesion: {
      estadoSesion: 'esperando_humano',
    },
  };
}

function normalizar(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function esPedidoDirecto(texto: string) {
  const n = normalizar(texto);
  return /\b(dame|quiero|agrega|agregame|anota|anotame|pideme|pídeme|necesito|llevo|dejame)\b/.test(n)
    && /\b(poke|pokes|gohan|roll|rolls|hand\s?roll|handroll|promo|piezas|sushi|burger)\b/.test(n);
}

function esPreguntaContenidoProducto(texto: string) {
  const n = normalizar(texto);
  return /\b(que trae|qué trae|que contiene|qué contiene|incluye|ingredientes|de que es|de qué es|como viene|cómo viene)\b/.test(n);
}

function esConsultaEstadoPedido(texto: string) {
  const n = normalizar(texto);
  return /\b(como va|cómo va|estado|mi pedido|orden|listo|preparacion|preparación)\b/.test(n);
}

function quiereCambiarOrdenCreada(texto: string) {
  const n = normalizar(texto);
  return /\b(cambiar|agregar|agregame|añadir|anadir|cancelar|cancela|modificar|sacar|quitar)\b/.test(n);
}

function esModalidadEntrega(texto: string) {
  const n = normalizar(texto);
  return /\b(retiro|retirar|paso a buscar|buscar al local|en local|delivery|despacho|envio|envío|domicilio)\b/.test(n);
}

function esReferenciaProductoActivo(texto: string) {
  const n = normalizar(texto);
  return /\b(en la|en el|la de|el de|esa|ese|esa misma|ese mismo|a la|al de)\b/.test(n);
}

function clienteDiceQueYaPidio(texto: string) {
  const n = normalizar(texto);
  return n.includes('ya te hice el pedido')
    || n.includes('ya hice el pedido')
    || n.includes('ya te lo pedi')
    || n.includes('ya lo pedi')
    || n.includes('ya esta mi pedido');
}

function resumenCarrito(sesion: SesionPedidoCtx) {
  const items = sesion.items
    .map((item) => `- ${item.quantity}x ${item.productName}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');
  const subtotal = sesion.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  return `${items}\nSubtotal: $${subtotal.toLocaleString('es-CL')}`;
}

function respuestaPedidoYaRegistrado(sesion: SesionPedidoCtx): RespuestaModulo {
  const faltaEntrega = !sesion.modalidad;
  const faltaPago = !sesion.metodoPago;

  if (faltaEntrega) {
    return {
      respuesta: `Sí, lo tengo anotado:\n${resumenCarrito(sesion)}\n¿Lo prefieres para retiro en local o delivery?`,
      moduloSiguiente: 'TIPO_ENTREGA',
    };
  }

  if (faltaPago || !sesion.nombreCliente) {
    return {
      respuesta: `Sí, lo tengo anotado:\n${resumenCarrito(sesion)}\nLo dejamos para ${sesion.modalidad === 'retiro_local' ? 'retiro en local' : 'delivery'}. ¿A nombre de quién queda y cómo deseas pagar?`,
      moduloSiguiente: 'FORMAS_PAGO',
    };
  }

  return {
    respuesta: `Sí, lo tengo anotado:\n${resumenCarrito(sesion)}\n¿Confirmas que lo ingrese así?`,
    moduloSiguiente: 'CONFIRMACION',
  };
}

function esNoAntePreguntaDeAgregar(texto: string) {
  const n = normalizarTexto(texto);
  return n === 'no' || n === 'nop' || n === 'no gracias';
}

function respuestaCerrarCarrito(sesion: SesionPedidoCtx): RespuestaModulo {
  return {
    respuesta: `Perfecto, tengo esto anotado:\n${construirResumenPedido(sesion)}\n\n¿Confirmas que el pedido está correcto?`,
    moduloSiguiente: 'CONFIRMACION',
  };
}

function normalizarComparacion(texto: string) {
  return normalizar(texto).replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function scoreCoincidencia(base: string, candidato: string) {
  const b = normalizarComparacion(base);
  const c = normalizarComparacion(candidato);
  if (!b || !c) return 0;
  if (b === c) return 100;
  if (b.includes(c) || c.includes(b)) return 80;
  const palabrasBase = b.split(' ').filter((p) => p.length > 2);
  const palabrasCandidato = c.split(' ').filter((p) => p.length > 2);
  const coincidencias = palabrasBase.filter((p) => palabrasCandidato.includes(p)).length;
  return coincidencias / Math.max(palabrasBase.length, 1);
}

async function respuestaContenidoItemCarrito(sesion: SesionPedidoCtx): Promise<RespuestaModulo | null> {
  const item = sesion.items[sesion.items.length - 1];
  if (!item) return null;

  try {
    const contexto = await obtenerContextoNegocio(item.productName);
    const promociones = contexto.promociones
      .map((promo) => ({ promo, score: scoreCoincidencia(item.productName, promo.nombre) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const mejorPromo = promociones[0]?.promo;
    if (mejorPromo) {
      return {
        respuesta: `${mejorPromo.nombre} ${mejorPromo.precio ? `(${formatearPrecio(mejorPromo.precio)})` : ''} trae: ${mejorPromo.descripcion} ¿La dejamos anotada así o quieres cambiarla?`,
        moduloSiguiente: 'PEDIDOS',
      };
    }

    const productos = contexto.productos
      .map((producto) => ({ producto, score: scoreCoincidencia(item.productName, producto.nombre) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
    const mejorProducto = productos[0]?.producto;
    if (mejorProducto?.descripcion) {
      return {
        respuesta: `${mejorProducto.nombre} trae: ${mejorProducto.descripcion} ¿Lo dejamos anotado así o quieres cambiarlo?`,
        moduloSiguiente: 'PEDIDOS',
      };
    }
  } catch {
    // Si el catálogo falla, respondemos sin inventar.
  }

  return {
    respuesta: `Tengo anotado ${item.quantity}x ${item.productName}. No tengo el detalle de ingredientes confirmado en este momento; si quieres, te derivo con el equipo para confirmarlo antes de cerrar.`,
    moduloSiguiente: 'PEDIDOS',
  };
}

// --------------- Resolución de afirmaciones cortas ----------
// Bug crítico detectado en producción: "¿Te refieres a la Promo 30 fritas?" → "Si"
// → el agente saludaba de nuevo porque la afirmación llegaba sin contexto.
// Aquí reescribimos el mensaje corto usando la última pregunta del agente.

function esAfirmacionCorta(texto: string) {
  const n = normalizar(texto).replace(/[^\w\s]/g, '').trim();
  return ['si', 'sii', 'siii', 'sip', 'ya', 'ok', 'oka', 'okey', 'dale', 'bueno', 'eso', 'esa', 'ese', 'claro', 'correcto', 'exacto', 'asi es', 'me refiero a esa'].includes(n);
}

function obtenerUltimaPreguntaAgente(historial?: { rol: 'cliente' | 'agente'; texto: string }[]) {
  if (!historial?.length) return null;
  for (let i = historial.length - 1; i >= 0; i--) {
    const m = historial[i];
    if (m.rol === 'agente' && m.texto.includes('?')) return m.texto;
  }
  return null;
}

// Extrae el producto de preguntas tipo "¿Te refieres a la Promo 30 Piezas Fritas, verdad?"
function extraerProductoDeAclaracion(pregunta: string): string | null {
  const patrones = [
    /te refieres a (?:la |el |un |una )?([^,?¿]+?)(?:,| ¿|\?|$)/i,
    /quieres decir (?:la |el )?([^,?¿]+?)(?:,| ¿|\?|$)/i,
  ];
  for (const patron of patrones) {
    const match = pregunta.match(patron);
    if (match?.[1]) return match[1].trim().replace(/[¿?]/g, '').replace(/\s+(verdad|cierto|no)$/i, '').trim();
  }
  return null;
}

function resolverAfirmacionConContexto(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): MensajeDespacho {
  if (!esAfirmacionCorta(msg.texto)) return msg;
  const ultimaPregunta = obtenerUltimaPreguntaAgente(msg.historial);
  if (!ultimaPregunta) return msg;
  const preguntaNormalizada = normalizar(ultimaPregunta);

  if (sesion?.items?.length && /\b(cerramos|cerrar|dejamos ese pedido|eso seria todo|eso sería todo|algo mas|algo más)\b/.test(preguntaNormalizada)) {
    return { ...msg, texto: 'solo eso' };
  }

  if (sesion?.items?.length && /\b(confirmas|confirmar|pedido esta correcto|pedido está correcto)\b/.test(preguntaNormalizada)) {
    return { ...msg, texto: 'confirmo el pedido' };
  }

  const producto = extraerProductoDeAclaracion(ultimaPregunta);
  if (producto && !sesion?.items?.length) {
    // El cliente confirmó una aclaración de producto y el carrito está vacío
    // → convertir en pedido directo
    return { ...msg, texto: `quiero ${producto}` };
  }

  // Afirmación genérica: inyectar la pregunta como contexto para que el módulo la interprete
  return {
    ...msg,
    texto: `sí (el cliente responde afirmativamente a tu pregunta anterior: "${ultimaPregunta.slice(0, 200)}")`,
  };
}

async function resolverModuloDeterministico(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  moduloActual: ModuloAgente
): Promise<{ modulo?: ModuloAgente; respuesta?: RespuestaModulo }> {
  if (pareceReclamo(msg.texto)) {
    return { modulo: 'ATENCION' };
  }

  if (sesion?.externalOrderId) {
    if (esConsultaEstadoPedido(msg.texto)) return { modulo: 'CONSULTAS' };
    if (quiereCambiarOrdenCreada(msg.texto)) {
      return {
        respuesta: {
          respuesta: `Tu orden ${sesion.externalOrderNumber ? `#${sesion.externalOrderNumber}` : ''} ya fue creada. Para cambios, agregados o cancelaciones te derivo con el equipo para revisar si aún es posible.`,
          moduloSiguiente: 'ATENCION',
          requiereHumano: true,
        },
      };
    }
    return { modulo: 'CONSULTAS' };
  }

  if ((moduloActual === 'BIENVENIDA' || moduloActual === 'CONSULTAS') && detectarIntencionVisual(msg.texto)) {
    return { modulo: 'CONSULTAS' };
  }

  if (sesion?.items?.length && clienteDiceQueYaPidio(msg.texto)) {
    return { respuesta: respuestaPedidoYaRegistrado(sesion) };
  }

  if (
    sesion?.items?.length &&
    moduloActual !== 'CONFIRMACION' &&
    (esCierreDePedido(msg.texto) || esNoAntePreguntaDeAgregar(msg.texto))
  ) {
    return { respuesta: respuestaCerrarCarrito(sesion) };
  }

  if (sesion?.items?.length && (detectarModificacion(msg.texto) || esReferenciaProductoActivo(msg.texto))) {
    return { modulo: 'PEDIDOS' };
  }

  if (sesion?.items?.length && esPreguntaContenidoProducto(msg.texto)) {
    return { respuesta: await respuestaContenidoItemCarrito(sesion) ?? undefined };
  }

  if (sesion?.items?.length && esModalidadEntrega(msg.texto)) {
    return { modulo: 'TIPO_ENTREGA' };
  }

  if (sesion?.items?.length && moduloActual === 'TIPO_ENTREGA' && !sesion.modalidad) {
    return { modulo: 'TIPO_ENTREGA' };
  }

  if (sesion?.items?.length && sesion.modalidad === 'despacho' && !sesion.direccion) {
    return { modulo: 'DIRECCION' };
  }

  if (
    sesion?.items?.length &&
    sesion.modalidad &&
    (moduloActual === 'FORMAS_PAGO' || (!sesion.metodoPago || !sesion.nombreCliente))
  ) {
    return { modulo: 'FORMAS_PAGO' };
  }

  if ((moduloActual === 'BIENVENIDA' || moduloActual === 'CONSULTAS') && esPedidoDirecto(msg.texto)) {
    return { modulo: 'PEDIDOS' };
  }

  return {};
}

// --------------- Función principal de despacho --------------

export async function despacharModulo(
  msgOriginal: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  moduloObjetivo?: ModuloAgente
): Promise<RespuestaModulo> {
  // Resolver afirmaciones cortas ("si", "ok", "dale") contra la última pregunta del agente
  const msg = resolverAfirmacionConContexto(msgOriginal, sesion);

  // Determinar módulo a ejecutar
  const moduloActual: ModuloAgente =
    moduloObjetivo ?? sesion?.moduloActual ?? 'BIENVENIDA';

  const deterministico = await resolverModuloDeterministico(msg, sesion, moduloActual);
  if (deterministico.respuesta) {
    return { ...deterministico.respuesta, moduloEjecutado: moduloActual };
  }
  const moduloEjecucion = deterministico.modulo ?? moduloActual;

  // Validar transición si hay sesión activa con módulo distinto
  if (
    sesion &&
    moduloEjecucion !== sesion.moduloActual
  ) {
    const transicionesPermitidas = TRANSICIONES_VALIDAS[sesion.moduloActual];
    if (!transicionesPermitidas.includes(moduloEjecucion)) {
      const motivo = `Transición inválida: ${sesion.moduloActual} → ${moduloEjecucion}`;
      console.warn(`[dispatcher] ${motivo}`);

      await guardarLogModulo({
        sesionPedidoId: sesion?.id,
        modulo: moduloEjecucion,
        mensajeEntrada: msg.texto,
        respuestaSalida: '',
        transicionHacia: 'ATENCION',
        exito: false,
        errorDetalle: motivo,
        duracionMs: 0,
      });

      return respuestaEscalada(motivo);
    }
  }

  const inicio = Date.now();
  let respuesta: RespuestaModulo;
  let exito = false;
  let errorDetalle: string | undefined;

  try {
    const loaderFn = HANDLERS[moduloEjecucion];
    if (!loaderFn) {
      throw new Error(`No existe handler para módulo: ${moduloEjecucion}`);
    }

    const handler = await loaderFn();
    respuesta = await handler.ejecutar(msg, sesion);

    // Validar transición propuesta por el módulo
    if (respuesta.moduloSiguiente) {
      const permitidas = TRANSICIONES_VALIDAS[moduloEjecucion];
      if (!permitidas.includes(respuesta.moduloSiguiente)) {
        console.warn(
          `[dispatcher] Módulo ${moduloEjecucion} propuso transición inválida → ${respuesta.moduloSiguiente}. Ignorando.`
        );
        respuesta = { ...respuesta, moduloSiguiente: undefined };
      }
    }

    exito = true;
  } catch (err) {
    errorDetalle =
      err instanceof Error ? err.message : 'Error desconocido en handler';
    console.error(`[dispatcher] Error en módulo ${moduloEjecucion}:`, errorDetalle);
    respuesta = respuestaEscalada(errorDetalle);
  }

  const duracionMs = Date.now() - inicio;

  // Guardar log siempre (éxito o fallo)
  await guardarLogModulo({
    sesionPedidoId: sesion?.id,
    modulo: moduloEjecucion,
    mensajeEntrada: msg.texto,
    respuestaSalida: respuesta.respuesta,
    transicionHacia: respuesta.moduloSiguiente ?? null,
    exito,
    errorDetalle,
    duracionMs,
  }).catch((logErr) => {
    // No fallar el dispatch si falla el log
    console.error('[dispatcher] No se pudo guardar log:', logErr);
  });

  return { ...respuesta, moduloEjecutado: moduloEjecucion };
}

export const despachar = despacharModulo;
