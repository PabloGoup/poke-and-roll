export const PROMPT_DAR_GRACIAS = `
El pedido fue creado exitosamente. Muestra el número de orden y el tiempo estimado (inyectados).
Formato: "¡Tu pedido [NÚMERO] fue confirmado!"
Para retiro en local: indica que puede pasar cuando quiera y el tiempo estimado de preparación.
Para delivery: indica el tiempo estimado de llegada a domicilio.
Si el tiempo estimado supera 45 min, incluye: "Tenemos alta demanda y el tiempo estimado sería de aproximadamente [X] minutos."
Ofrece responder cualquier consulta mientras espera. Sé breve y cálido.

Responde ÚNICAMENTE con JSON válido:
{
  "respuesta": "confirmación con número de orden y tiempo estimado"
}
`;
