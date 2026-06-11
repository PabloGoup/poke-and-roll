---
name: ingeniero-modulos-m11-m13
role: Oleada 4 — implementa DAR_GRACIAS, ENTREGA, DESPEDIDA
---

# Ingeniero Módulos M11–M13

## Propósito

Implementar los módulos de cierre del flujo: confirmación de orden, notificación de
entrega (activada por webhook) y despedida. Son los módulos más simples en lógica
pero los más importantes para la experiencia del cliente.

## M11 — DAR_GRACIAS

- Mostrar: número de orden, tiempo estimado (desde `resultado.estimatedReadyAt`).
- Formatear tiempo estimado en español: "Tu pedido estará listo a las 20:35 aprox."
- Para retiro: indicar dónde retirar (dirección del restaurante desde `ConfiguracionRestaurante`).
- Para delivery: confirmar la dirección de entrega.
- Ofrecer: "Si tienes alguna consulta mientras esperas, escríbeme."
- El módulo permanece activo — si el cliente escribe, transicionar a `CONSULTAS` sin perder la sesión.

```typescript
// Este módulo es especial: puede recibir mensajes mientras espera el pedido
// Si el cliente escribe algo que no sea una cancelación, ir a CONSULTAS
// Si llega el webhook de pedido listo, activar M12
```

## M12 — ENTREGA

- Este módulo es activado por el webhook `pedido-listo`, NO por un mensaje del cliente.
- No llama al LLM — el mensaje es predefinido.
- Para retiro: "¡Tu pedido {número} está listo! Puedes pasar a retirarlo cuando quieras. 🎉"
- Para delivery: "Tu pedido {número} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato."
- Después de enviar: `moduloSiguiente = 'DESPEDIDA'`.

```typescript
export async function ejecutar(mensaje: any, sesion: SesionPedidoCtx): Promise<RespuestaModulo> {
  const numero = sesion.externalOrderNumber ?? 'tu pedido';
  const esDelivery = sesion.modalidad === 'despacho';
  
  const texto = esDelivery
    ? `Tu pedido ${numero} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato.`
    : `Tu pedido ${numero} está listo. Puedes pasar a retirarlo cuando quieras.`;
  
  return {
    respuesta: texto,
    moduloSiguiente: 'DESPEDIDA',
    actualizarSesion: { estadoSesion: 'completada' },
  };
}
```

## M13 — DESPEDIDA

- Mensaje de cierre cálido y breve.
- NO hacer preguntas adicionales.
- Ejemplos: "¡Gracias por tu pedido! Que lo disfrutes. 🍣" / "¡Hasta pronto! Fue un placer atenderte."
- Limpiar `estadoSesion = 'completada'` (si no se hizo en M12).
- No transicionar a ningún módulo — es el estado final.

## Entregables

- 3 archivos en `lib/modulos/`: m11, m12, m13
- M12 debe ser invocable directamente desde el webhook handler (sin mensaje del cliente)
