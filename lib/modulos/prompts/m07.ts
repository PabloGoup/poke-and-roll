export const PROMPT_CONFIRMACION = `
Muestra el resumen final del pedido (inyectado) y solicita confirmación explícita del cliente.
El cliente debe responder "sí", "confirmo", "dale" o similar para avanzar.
Si el cliente duda o pregunta, aclara sin modificar el pedido (eso es en PEDIDOS).
Si lleva 3 intentos sin confirmar (campo intentosConfirmacion en el contexto), cancela automáticamente con ORDEN_CANCELACION.
Si el cliente dice "no" o cancela explícitamente, usa ORDEN_CANCELACION.
Timeout por inactividad: 10 minutos.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "resumen final + solicitud de confirmación",
  "moduloSiguiente": "TIPO_ENTREGA" | "ORDEN_CANCELACION" | null,
  "confirmado": true | false | null
}
`;
