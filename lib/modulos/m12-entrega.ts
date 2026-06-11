// ============================================================
// lib/modulos/m12-entrega.ts — Notificación de pedido listo
// Activado por el webhook pedido-listo, NO por mensaje del cliente.
// No llama al LLM — mensaje predefinido.
// Transiciona a DESPEDIDA y marca la sesión como completada.
// ============================================================

import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';

export async function ejecutar(
  _msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const numero = sesion?.externalOrderNumber ?? 'tu pedido';
  const esDelivery = sesion?.modalidad === 'despacho';

  const texto = esDelivery
    ? `Tu pedido ${numero} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato.`
    : `Tu pedido ${numero} está listo. Puedes pasar a retirarlo cuando quieras.`;

  return {
    respuesta: texto,
    moduloSiguiente: 'DESPEDIDA',
    actualizarSesion: { estadoSesion: 'completada' },
  };
}
