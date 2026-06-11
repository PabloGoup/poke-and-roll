// ============================================================
// lib/modulos/dispatcher.ts — Despachador central de módulos IA
// ============================================================

import { guardarLogModulo } from '@/lib/db-helpers';
import {
  type ModuloAgente,
  type MensajeDespacho,
  type RespuestaModulo,
  type SesionPedidoCtx,
  TRANSICIONES_VALIDAS,
} from './types';
import { construirResumenPedido, esCierreDePedido, normalizarTexto, pareceReclamo } from './flujo-utils';

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

function esModalidadEntrega(texto: string) {
  const n = normalizar(texto);
  return /\b(retiro|retirar|paso a buscar|buscar al local|en local|delivery|despacho|envio|envío|domicilio)\b/.test(n);
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

function resolverModuloDeterministico(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  moduloActual: ModuloAgente
): { modulo?: ModuloAgente; respuesta?: RespuestaModulo } {
  if (pareceReclamo(msg.texto)) {
    return { modulo: 'ATENCION' };
  }

  if (sesion?.items?.length && clienteDiceQueYaPidio(msg.texto)) {
    return { respuesta: respuestaPedidoYaRegistrado(sesion) };
  }

  if (sesion?.items?.length && (esCierreDePedido(msg.texto) || esNoAntePreguntaDeAgregar(msg.texto))) {
    return { respuesta: respuestaCerrarCarrito(sesion) };
  }

  if (sesion?.items?.length && esModalidadEntrega(msg.texto)) {
    return { modulo: 'TIPO_ENTREGA' };
  }

  if ((moduloActual === 'BIENVENIDA' || moduloActual === 'CONSULTAS') && esPedidoDirecto(msg.texto)) {
    return { modulo: 'PEDIDOS' };
  }

  return {};
}

// --------------- Función principal de despacho --------------

export async function despacharModulo(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  moduloObjetivo?: ModuloAgente
): Promise<RespuestaModulo> {
  // Determinar módulo a ejecutar
  const moduloActual: ModuloAgente =
    moduloObjetivo ?? sesion?.moduloActual ?? 'BIENVENIDA';

  const deterministico = resolverModuloDeterministico(msg, sesion, moduloActual);
  if (deterministico.respuesta) {
    return deterministico.respuesta;
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

  return respuesta;
}

export const despachar = despacharModulo;
