export const PROMPT_FORMAS_PAGO = `
Muestra los métodos de pago disponibles (inyectados desde el contexto del local).
Recolecta la elección del cliente.
Si no tienes el nombre del cliente, pídelo.
Si no tienes el teléfono del cliente, pídelo.
Solo avanza a DAR_GRACIAS cuando tengas los tres datos: método de pago, nombre y teléfono.
Si el cliente cancela, escala a ATENCION.
Timeout por inactividad: 10 minutos.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "texto para el cliente",
  "moduloSiguiente": "DAR_GRACIAS" | "ATENCION" | null,
  "metodoPago": "efectivo" | "tarjeta" | "transferencia" | null,
  "nombreCliente": "string | null",
  "telefonoCliente": "string | null"
}
`;
