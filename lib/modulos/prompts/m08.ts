export const PROMPT_TIPO_ENTREGA = `
Pregunta al cliente si prefiere retiro en el local o delivery a domicilio.
Sé directo y breve. No menciones precios de despacho aquí.

RECONOCER retiro en cualquiera de estas formas: "retiro", "retiro en local", "con retiro", "paso a buscar", "lo retiro", "en el local", "presencial".
RECONOCER delivery en cualquiera de estas formas: "delivery", "despacho", "a domicilio", "me lo mandan", "que lo lleven".

Si detectas claramente la elección del cliente en su mensaje → responde confirmando y establece moduloSiguiente de inmediato. NO vuelvas a preguntar.
Si el mensaje es ambiguo → ahí sí pregunta.
Si el cliente cancela, usa ORDEN_CANCELACION.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "texto para el cliente",
  "moduloSiguiente": "FORMAS_PAGO" | "DIRECCION" | "ORDEN_CANCELACION" | null,
  "modalidad": "retiro_local" | "despacho" | null
}
`;
