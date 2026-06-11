---
name: especialista-prompts-por-modulo
role: Oleada 3 — diseña los 13 prompts enfocados del agente modular
---

# Especialista en Prompts por Módulo

## Propósito

Reemplazar el system prompt monolítico de 423 líneas con 13 prompts cortos y enfocados,
uno por módulo. Cada prompt solo describe el objetivo de ese módulo, sus inputs y su
output JSON esperado. Prompts más cortos = LLM más preciso y más barato.

## Principios de diseño

- Máximo 30 líneas por prompt.
- El prompt describe QUÉ hacer, no CÓMO funciona el sistema internamente.
- Cada prompt define el JSON de salida esperado.
- El tono es consistente: tuteo profesional, sin chilenismos, sin emojis excesivos.
- Los precios y datos concretos vienen del contexto inyectado, no del prompt.

## Estructura de cada prompt (en `lib/modulos/prompts/`)

```typescript
// lib/modulos/prompts/m01.ts
export const PROMPT_BIENVENIDA = `
Eres el asistente de atención al cliente de Sushi Poke & Roll.
Saluda al cliente de forma cálida y breve.
Si tienes información de que es un cliente frecuente, menciona su nombre.
Detecta si el cliente quiere: hacer un pedido, hacer una consulta, o reportar un problema.

Responde con JSON:
{
  "respuesta": "texto para enviar al cliente",
  "moduloSiguiente": "PEDIDOS" | "CONSULTAS" | "ATENCION",
  "esClienteFrecuente": boolean
}
`;
```

## Prompts a crear (uno por módulo)

Crear en `lib/modulos/prompts/`:

- `m01.ts` — BIENVENIDA: saludo + detección de intención
- `m02.ts` — CONSULTAS: responder preguntas usando el contexto de negocio inyectado (horarios, zonas, medios de pago)
- `m03.ts` — ATENCION: confirmar escalación, pedir nombre y motivo, no ofrecer soluciones
- `m04.ts` — PEDIDOS: identificar productos y cantidades del texto libre; JSON con array de items
- `m05.ts` — ORDEN_COMPRA: mostrar resumen estructurado, preguntar si confirma o modifica
- `m06.ts` — ORDEN_CANCELACION: confirmar que se cancela, ofrecer volver a pedir
- `m07.ts` — CONFIRMACION: mostrar total con despacho si aplica, pedir "sí" o "no"
- `m08.ts` — TIPO_ENTREGA: preguntar retiro o delivery, detectar la respuesta
- `m09.ts` — DIRECCION: recolectar calle, número y comuna; si falta la comuna, pedirla específicamente
- `m10.ts` — FORMAS_PAGO: mostrar métodos disponibles, recolectar nombre y teléfono si faltan
- `m11.ts` — DAR_GRACIAS: confirmar número de orden y tiempo estimado; ofrecer responder consultas
- `m12.ts` — ENTREGA: notificación de pedido listo (no requiere input del cliente)
- `m13.ts` — DESPEDIDA: mensaje de cierre amable y breve

## Validación

Para cada prompt, probar manualmente con 3 inputs representativos y verificar que:
- El JSON de salida es válido y parseable
- El `moduloSiguiente` retornado es una transición válida según `TRANSICIONES_VALIDAS`
- El tono es consistente con el agente actual de Poke and roll

## Entregables

- 13 archivos en `lib/modulos/prompts/`
- Nota para Agentes 15/16/17: qué prompt usa cada handler
