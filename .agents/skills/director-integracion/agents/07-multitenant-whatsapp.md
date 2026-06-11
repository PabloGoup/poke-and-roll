---
name: especialista-multitenant-whatsapp
role: Oleada 1 — fix tokens por local para envío de WhatsApp
---

# Especialista Multi-tenant WhatsApp

## Propósito

Resolver BLOQUEO 4: `enviarWhatsAppTexto()` usa tokens globales de env vars.
El sistema es multi-tenant — cada `Local` tiene su propio `waToken` y `waPhoneId`.
El webhook `pedido-listo` necesita enviar usando el token del local correcto.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a modificar:** `lib/meta.ts`
- **Archivo a crear:** `app/api/webhooks/pedido-listo/route.ts`
- **Bloqueante resuelto:** BLOQUEO 4

## Tarea 1 — Actualizar `enviarWhatsAppTexto()` en `lib/meta.ts`

La función actual solo acepta `{ telefono, texto }`. Extender para tokens opcionales:

```typescript
export async function enviarWhatsAppTexto(params: {
  telefono: string;
  texto: string;
  waToken?: string;    // si se pasa, usa este; sino, env var
  waPhoneId?: string;  // si se pasa, usa este; sino, env var
}) {
  const accessToken = params.waToken ?? process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = params.waPhoneId ?? process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { ok: false, modo: 'simulado', detalle: 'Faltan credenciales WhatsApp' };
  }
  // ... resto del código igual
}
```

**Importante:** Los llamados existentes (desde webhook whatsapp) no pasan `waToken`/`waPhoneId`,
así que el fallback a env vars mantiene la compatibilidad.

## Tarea 2 — Crear `app/api/webhooks/pedido-listo/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enviarWhatsAppTexto } from '@/lib/meta';

export async function POST(req: NextRequest) {
  // Validar secret
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.SUPABASE_PEDIDOS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { record, old_record } = body;

  // Solo procesar cuando status cambia a 'listo'
  if (record?.status !== 'listo' || old_record?.status === 'listo') {
    return Response.json({ ok: true, skipped: true });
  }

  // Solo pedidos de WhatsApp
  if (record?.source !== 'whatsapp') {
    return Response.json({ ok: true, skipped: 'not-whatsapp' });
  }

  const telefono = record?.customer_phone_snapshot;
  if (!telefono) {
    return Response.json({ ok: true, skipped: 'no-phone' });
  }

  // Idempotencia: buscar si ya notificamos esta orden
  const sesion = await prisma.sesionPedido.findFirst({
    where: { externalOrderId: record.id, estadoSesion: { not: 'completada' } },
    include: { conversacion: { include: { local: true } } },
  });

  const local = sesion?.conversacion?.local;
  const numero = record?.number ?? 'tu pedido';
  const tipo = record?.type ?? 'retiro_local';

  const mensaje = tipo === 'despacho'
    ? `Tu pedido ${numero} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato.`
    : `Tu pedido ${numero} está listo. Puedes pasar a retirarlo cuando quieras.`;

  await enviarWhatsAppTexto({
    telefono,
    texto: mensaje,
    waToken: local?.waToken ?? undefined,
    waPhoneId: local?.waPhoneId ?? undefined,
  });

  // Transicionar sesión a ENTREGA
  if (sesion) {
    await prisma.sesionPedido.update({
      where: { id: sesion.id },
      data: { moduloActual: 'ENTREGA', estadoSesion: 'completada' },
    });
  }

  return Response.json({ ok: true });
}
```

## Entregables

- `lib/meta.ts` actualizado con firma extendida (compatible hacia atrás)
- `app/api/webhooks/pedido-listo/route.ts` creado
- Confirmar a Agente 20 (Notificaciones) que la base está lista
