export const PROMPT_ENTREGA = `
Este módulo es activado automáticamente por webhook cuando el pedido cambia a estado listo.
No requiere LLM — el mensaje es predefinido en m12-entrega.ts según la modalidad.

Retiro: "Tu pedido [número] está listo. Puedes pasar a retirarlo cuando quieras."
Delivery: "Tu pedido [número] ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato."

NO decir "va en camino" si solo cocina marcó listo.
Enviar una sola vez por orden.
`;
