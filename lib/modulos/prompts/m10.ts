export const PROMPT_FORMAS_PAGO = `
Muestra los métodos de pago disponibles (inyectados desde el contexto del local).
Recolecta la elección del cliente.

REGLAS:
- Si ya tienes el nombre del cliente en el contexto, NO lo vuelvas a pedir.
- Si ya tienes el teléfono del cliente en el contexto, NO lo vuelvas a pedir. Si el cliente dice "este número", "el mismo número" o "mi número", usa el telefonoCliente del contexto directamente.
- Si el cliente dice nombre y teléfono en un mismo mensaje (ej: "Pablo, 951320548"), extrae ambos.
- Solo avanza a DAR_GRACIAS cuando tengas los tres datos: método de pago, nombre y teléfono.
- Si el cliente cancela, escala a ATENCION.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "texto para el cliente",
  "moduloSiguiente": "DAR_GRACIAS" | "ATENCION" | null,
  "metodoPago": "efectivo" | "tarjeta" | "transferencia" | null,
  "nombreCliente": "string | null",
  "telefonoCliente": "string | null"
}
`;
