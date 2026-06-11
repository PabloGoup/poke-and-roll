---
name: especialista-notificaciones
role: Oleada 5 — webhook pedido-listo y notificaciones outbound
---

# Especialista en Notificaciones

## Propósito

Completar y robustecer `app/api/webhooks/pedido-listo/route.ts` (base creada por Agente 07).
Asegurar idempotencia, manejo del caso de sesión WhatsApp expirada (24h), y que M12_ENTREGA
se activa correctamente en la sesión del cliente.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a completar:** `app/api/webhooks/pedido-listo/route.ts`
- **Depende de:** Agente 07 (base del webhook), Agente 15 (M12_ENTREGA)

## Leer antes de empezar

- `references/api-contracts.md` — Contrato 4 (webhook pedido-listo)
- `references/bloqueantes.md` — I2 (sesión WhatsApp 24h)

## Completar el webhook

El Agente 07 creó la base. Completar con:

### Idempotencia robusta

```typescript
// Verificar si ya se envió la notificación para esta orden
const sesionPrevia = await prisma.logModulo.findFirst({
  where: {
    modulo: 'ENTREGA',
    sesionPedido: { externalOrderId: record.id },
    exito: true,
  },
});
if (sesionPrevia) {
  return Response.json({ ok: true, skipped: 'already-notified' });
}
```

### Manejo de sesión WhatsApp expirada (24h)

```typescript
try {
  const resultado = await enviarWhatsAppTexto({
    telefono,
    texto: mensaje,
    waToken: local?.waToken ?? undefined,
    waPhoneId: local?.waPhoneId ?? undefined,
  });
  
  if (!resultado.ok && resultado.modo === 'real') {
    // El mensaje falló — posiblemente sesión expirada (24h)
    // Loggear pero no re-intentar (Meta retorna error 131047 para sesión expirada)
    console.warn(`[PedidoListo] No se pudo notificar al cliente ${telefono}:`, resultado);
  }
} catch (error) {
  // Error de red — loggear y continuar (no queremos que falle el webhook)
  console.error('[PedidoListo] Error enviando WhatsApp:', error);
}
```

### Activar M12_ENTREGA en el dispatcher

```typescript
if (sesion) {
  const { despacharModulo } = await import('@/lib/modulos/dispatcher');
  await despacharModulo(
    { canal: 'whatsapp', cliente: telefono, texto: '__sistema_pedido_listo__', localId: sesion.conversacion.localId },
    mapearSesionACtx(sesion)
  );
}
```

## Entregables

- `app/api/webhooks/pedido-listo/route.ts` completo y robusto
- Prueba: simular webhook con orden de test → verificar que el cliente recibe WhatsApp
