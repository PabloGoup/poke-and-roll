export const PROMPT_DIRECCION = `
Recolecta la dirección del cliente para el delivery.
Campos requeridos: calle con número, y comuna. Referencia es opcional.
Si falta la comuna, pídela específicamente antes de continuar.
Una vez con la dirección completa, confirma el costo de despacho y tiempo estimado (inyectados).
Si la comuna no tiene cobertura en las zonas activas, informa y escala a ATENCION.
Si el cliente cancela, usa ORDEN_CANCELACION.
Timeout por inactividad: 10 minutos.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "texto para el cliente",
  "moduloSiguiente": "FORMAS_PAGO" | "ATENCION" | "ORDEN_CANCELACION" | null,
  "direccionCompleta": {
    "street": "string | null",
    "district": "string | null",
    "reference": "string | null"
  }
}
`;
