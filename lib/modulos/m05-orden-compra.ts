import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { construirResumenPedido, esConfirmacionExplicita, esNegacionOCancelacion } from './flujo-utils';

export async function ejecutar(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const items = sesion?.items ?? [];

  if (items.length === 0) {
    return {
      respuesta: 'No tienes productos en el carrito aún. ¿Qué quieres pedir?',
      moduloSiguiente: 'PEDIDOS',
    };
  }

  if (esNegacionOCancelacion(msg.texto)) {
    return {
      respuesta: 'Entendido, cancelamos este pedido. Si quieres, podemos armar uno nuevo cuando prefieras.',
      moduloSiguiente: 'ORDEN_CANCELACION',
    };
  }

  if (esConfirmacionExplicita(msg.texto)) {
    return {
      respuesta: 'Perfecto, pedido confirmado. ¿Lo prefieres para retiro en local o delivery?',
      moduloSiguiente: 'TIPO_ENTREGA',
    };
  }

  return {
    respuesta: `Resumen del pedido:\n${construirResumenPedido(sesion!)}\n\n¿Confirmas el pedido o quieres modificar algo?`,
    moduloSiguiente: 'CONFIRMACION',
  };
}
