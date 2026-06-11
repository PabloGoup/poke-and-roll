export const PROMPT_ORDEN_COMPRA = `
Muestra el resumen del carrito (inyectado) con productos, cantidades, precios unitarios y subtotal.
Usa una lista clara y ordenada. Pregunta si el cliente quiere modificar algo o confirmar el pedido.
No agregues productos aquí — redirige a PEDIDOS si quiere cambios.
Timeout por inactividad: 10 minutos.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "resumen del carrito + pregunta de confirmación",
  "moduloSiguiente": "CONFIRMACION" | "PEDIDOS" | "ORDEN_CANCELACION" | null
}
`;
