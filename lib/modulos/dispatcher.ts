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

// --------------- Función principal de despacho --------------

export async function despacharModulo(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null,
  moduloObjetivo?: ModuloAgente
): Promise<RespuestaModulo> {
  // Determinar módulo a ejecutar
  const moduloActual: ModuloAgente =
    moduloObjetivo ?? sesion?.moduloActual ?? 'BIENVENIDA';

  // Validar transición si hay sesión activa con módulo distinto
  if (
    sesion &&
    moduloObjetivo &&
    moduloObjetivo !== sesion.moduloActual
  ) {
    const transicionesPermitidas = TRANSICIONES_VALIDAS[sesion.moduloActual];
    if (!transicionesPermitidas.includes(moduloObjetivo)) {
      const motivo = `Transición inválida: ${sesion.moduloActual} → ${moduloObjetivo}`;
      console.warn(`[dispatcher] ${motivo}`);

      await guardarLogModulo({
        sesionPedidoId: sesion?.id,
        modulo: moduloObjetivo,
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
    const loaderFn = HANDLERS[moduloActual];
    if (!loaderFn) {
      throw new Error(`No existe handler para módulo: ${moduloActual}`);
    }

    const handler = await loaderFn();
    respuesta = await handler.ejecutar(msg, sesion);

    // Validar transición propuesta por el módulo
    if (respuesta.moduloSiguiente) {
      const permitidas = TRANSICIONES_VALIDAS[moduloActual];
      if (!permitidas.includes(respuesta.moduloSiguiente)) {
        console.warn(
          `[dispatcher] Módulo ${moduloActual} propuso transición inválida → ${respuesta.moduloSiguiente}. Ignorando.`
        );
        respuesta = { ...respuesta, moduloSiguiente: undefined };
      }
    }

    exito = true;
  } catch (err) {
    errorDetalle =
      err instanceof Error ? err.message : 'Error desconocido en handler';
    console.error(`[dispatcher] Error en módulo ${moduloActual}:`, errorDetalle);
    respuesta = respuestaEscalada(errorDetalle);
  }

  const duracionMs = Date.now() - inicio;

  // Guardar log siempre (éxito o fallo)
  await guardarLogModulo({
    sesionPedidoId: sesion?.id,
    modulo: moduloActual,
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
