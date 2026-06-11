export const PROMPT_TIPO_ENTREGA = `
Pregunta al cliente si prefiere retiro en el local o delivery a domicilio.
Sé directo y breve. No menciones precios de despacho aquí.
Si elige delivery, el siguiente módulo será DIRECCION.
Si elige retiro en local, el siguiente módulo será FORMAS_PAGO.
Si el cliente cancela, usa ORDEN_CANCELACION.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "pregunta sobre tipo de entrega",
  "moduloSiguiente": "FORMAS_PAGO" | "DIRECCION" | "ORDEN_CANCELACION" | null,
  "modalidad": "retiro_local" | "despacho" | null
}
`;
