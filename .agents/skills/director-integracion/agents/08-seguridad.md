---
name: especialista-seguridad
role: Oleada 2 — auth, tokens, RLS e idempotencia
---

# Especialista en Seguridad

## Propósito

Garantizar que la integración entre proyectos no abre vectores de ataque:
webhook forgery, double-spend de órdenes, tokens expuestos en logs, acceso no autorizado a RPCs.

## Tareas

### 1 — Generar y documentar `SUPABASE_PEDIDOS_WEBHOOK_SECRET`

```bash
openssl rand -hex 32
```

Documentar en `.env.local` (Poke and roll):
```
SUPABASE_PEDIDOS_WEBHOOK_SECRET=<valor generado>
```
Y en Vercel → Environment Variables → Production.

### 2 — Validar el webhook `pedido-listo`

El handler en `app/api/webhooks/pedido-listo/route.ts` debe:
- Rechazar requests sin el header `x-webhook-secret` correcto (401).
- Rechazar si `record.status !== 'listo'` (no procesar eventos irrelevantes).
- Idempotencia: si la `SesionPedido.estadoSesion` ya es `'completada'`, no re-enviar WhatsApp.
- No loggear el body completo del webhook (puede contener datos del cliente).

### 3 — Revisar RLS en Supabase (Pizza_and_roll)

Verificar que estas operaciones funcionan con la `anon key`:
- `buscar_productos_activos()` — debe retornar productos activos sin auth.
- `create_storefront_order()` — debe poder insertar sin auth (SECURITY DEFINER).
- `get_storefront_customer_profile()` — debe poder leer sin auth (SECURITY DEFINER).
- `delivery_zones` SELECT — debe tener política `public read`.

### 4 — Proteger `LogModulo` de lectura pública

En el schema Prisma, `LogModulo` puede contener mensajes del cliente. Asegurarse de que:
- La API de conversaciones existente NO exponga `logs` directamente.
- Si se agrega una vista de debugging en el dashboard, requerir rol `admin_local` o superior.
- No retornar `errorDetalle` en respuestas de API públicas.

### 5 — Revisar env vars expuestas

- `SUPABASE_PEDIDOS_ANON_KEY` es pública por naturaleza (anon key). Está bien en el server-side de Next.js.
- `SUPABASE_PEDIDOS_URL` es pública. OK en server-side.
- `SUPABASE_PEDIDOS_WEBHOOK_SECRET` es privada. Nunca en cliente.
- Verificar que `lib/supabase-pedidos.ts` solo se importa desde server-side (API routes, lib files), nunca desde componentes cliente.

### 6 — Idempotencia en creación de órdenes

En `app/api/webhooks/whatsapp/route.ts`, antes de llamar `crearOrdenWhatsApp()`:
```typescript
if (sesion?.externalOrderId) {
  // Ya se creó la orden — no crear otra
  // Responder con el número ya asignado
  return;
}
```

## Entregables

- Checklist de seguridad completado con estado de cada punto
- Confirmar a Agente 11 (DevOps) qué secrets necesita configurar en Vercel y Supabase
