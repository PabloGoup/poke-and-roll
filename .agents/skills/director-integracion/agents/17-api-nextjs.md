---
name: ingeniero-api-nextjs
role: Oleada 5 — refactoriza el webhook WhatsApp para usar el dispatcher modular
---

# Ingeniero API Next.js

## Propósito

Refactorizar `app/api/webhooks/whatsapp/route.ts` para usar el dispatcher modular
en vez de `generarRespuesta()`. Este es el punto de entrada de todos los mensajes WhatsApp.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a modificar:** `app/api/webhooks/whatsapp/route.ts`
- **Depende de:** Agentes 05, 10, 12 (todos los módulos deben estar listos)

## Leer antes de empezar

- `references/api-contracts.md` — flujo completo
- `lib/modulos/guards.ts` — resultado de Agente 12

## Nueva lógica del webhook

```typescript
// app/api/webhooks/whatsapp/route.ts — sección POST handler

// 1. Parsear mensaje y obtener datos del local (lógica existente, sin cambios)
const { telefono, texto, localId } = parsearWebhookWhatsApp(body);

// 2. Upsert cliente y conversacion (helpers existentes, sin cambios)
const cliente = await upsertCliente({ canal: 'whatsapp', canalId: telefono, localId });
const conversacion = await obtenerOCrearConversacion({ clienteId: cliente.id, canal: 'whatsapp', localId });
await guardarMensaje({ conversacionId: conversacion.id, canal: 'whatsapp', direccion: 'entrada', texto });

// 3. Cargar SesionPedido activa
const sesion = await obtenerSesionPedido(conversacion.id);
const sesionCtx = sesion ? mapearSesionACtx(sesion) : null;

// 4. Evaluar guards (timeout, cancelación, max intentos)
const { evaluarGuards } = await import('@/lib/modulos/guards');
const guardResult = evaluarGuards(texto, sesionCtx);

if (guardResult.accion === 'cancelar') {
  // Cerrar sesión y enviar mensaje de cancelación
  if (sesion) await cerrarSesionPedido(conversacion.id, 'cancelada');
  const msg = MENSAJES_CANCELACION[guardResult.motivo];
  await enviarWhatsAppTexto({ telefono, texto: msg });
  await guardarMensaje({ conversacionId: conversacion.id, canal: 'whatsapp', direccion: 'saliente', texto: msg });
  return Response.json({ ok: true });
}

// 5. Preparar MensajeEntrante para el dispatcher
const mensajeAgente: MensajeEntrante = {
  canal: 'whatsapp',
  cliente: telefono,
  texto,
  localId,
  conversacionId: conversacion.id,
  historial: await obtenerHistorial(conversacion.id),
};

// 6. Despachar al módulo correspondiente
const { despacharModulo } = await import('@/lib/modulos/dispatcher');
const resultado = await despacharModulo(mensajeAgente, sesionCtx);

// 7. Aplicar actualizaciones de sesión
if (resultado.actualizarSesion || resultado.moduloSiguiente) {
  await upsertSesionPedido(conversacion.id, {
    ...resultado.actualizarSesion,
    ...(resultado.moduloSiguiente ? { moduloActual: resultado.moduloSiguiente } : {}),
  });
}

// 8. Cerrar sesión si el módulo lo indica
if (resultado.actualizarSesion?.estadoSesion === 'cancelada') {
  await cerrarSesionPedido(conversacion.id, 'cancelada');
} else if (resultado.actualizarSesion?.estadoSesion === 'completada') {
  await cerrarSesionPedido(conversacion.id, 'completada');
}

// 9. Enviar respuesta al cliente
if (resultado.respuesta) {
  await enviarWhatsAppTexto({ telefono, texto: resultado.respuesta });
  await guardarMensaje({ conversacionId: conversacion.id, canal: 'whatsapp', direccion: 'saliente', texto: resultado.respuesta });
}

// 10. Enviar catálogo visual si aplica (lógica existente)
if (resultado.catalogoVisual) {
  // ... código existente de envío de imagen
}

// 11. Actualizar conversacion con intencion y requiereHumano
await guardarDecision({
  conversacionId: conversacion.id,
  agente: `MODULO_${sesionCtx?.moduloActual ?? 'BIENVENIDA'}`,
  intencion: sesionCtx?.moduloActual?.toLowerCase() ?? 'consulta',
  entrada: texto,
  salida: resultado.respuesta,
  decisionSeguridad: 'aprobado',
  requiereHumano: resultado.requiereHumano ?? false,
});
```

## Función auxiliar `mapearSesionACtx`

```typescript
function mapearSesionACtx(sesion: SesionPedido): SesionPedidoCtx {
  return {
    id: sesion.id,
    conversacionId: sesion.conversacionId,
    moduloActual: sesion.moduloActual as ModuloAgente,
    estadoSesion: sesion.estadoSesion as any,
    items: sesion.items as ItemCarritoWA[],
    modalidad: sesion.modalidad as any,
    nombreCliente: sesion.nombreCliente ?? undefined,
    telefonoCliente: sesion.telefonoCliente ?? undefined,
    direccion: sesion.direccion as DireccionCliente ?? undefined,
    costoDespacho: sesion.costoDespacho ?? undefined,
    metodoPago: sesion.metodoPago as any,
    externalOrderId: sesion.externalOrderId ?? undefined,
    externalOrderNumber: sesion.externalOrderNumber ?? undefined,
    intentosConfirmacion: sesion.intentosConfirmacion,
    ultimaActividadEn: sesion.ultimaActividadEn,
  };
}
```

## Entregables

- `app/api/webhooks/whatsapp/route.ts` refactorizado
- Los webhooks de Instagram y Facebook NO cambian (no toman pedidos, redirigen a WA)
- Prueba manual: enviar "hola" → debe responder desde M01_BIENVENIDA
