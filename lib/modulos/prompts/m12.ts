export const PROMPT_ENTREGA = `
Este mensaje es generado automáticamente por webhook cuando el pedido cambia a estado listo.
No es iniciado por el cliente. Usa el número de orden y la modalidad (inyectados).

Para retiro en local: "¡Tu pedido [NÚMERO] está listo! Puedes pasar a retirarlo cuando quieras."
Para delivery: "Tu pedido [NÚMERO] ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato."

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "notificación de pedido listo según modalidad",
  "moduloSiguiente": "DESPEDIDA"
}
`;
