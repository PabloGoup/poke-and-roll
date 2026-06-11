---
name: ingeniero-devops
role: Oleada 2 — variables de entorno, webhook Supabase, infraestructura
---

# Ingeniero DevOps

## Propósito

Configurar toda la infraestructura necesaria para que la integración funcione en producción:
variables de entorno en Vercel, Database Webhook en Supabase, verificación de extensiones.

## Tareas

### 1 — Variables de entorno (Poke and roll)

Agregar en `/Users/ptoledos/Documents/Poke and roll/.env.local`:
```
SUPABASE_PEDIDOS_URL=https://aefneixnrlkbhfyplkid.supabase.co
SUPABASE_PEDIDOS_ANON_KEY=<anon key del proyecto Pizza_and_roll>
SUPABASE_PEDIDOS_WEBHOOK_SECRET=<generado por Agente 10>
WHATSAPP_BOT_CASHIER_ID=<uuid de perfil cajero técnico>
```

Y en Vercel (proyecto `poke-and-roll`):
- Settings → Environment Variables → agregar las 3 variables para Production + Preview.

### 2 — Database Webhook en Supabase (Pizza_and_roll)

En el panel de Supabase del proyecto Pizza_and_roll:
`Database → Webhooks → Create a new hook`

Configuración:
```
Name: notify-whatsapp-pedido-listo
Table: public.orders
Events: ✅ UPDATE
Webhook URL: https://goupsoluciones.cl/api/webhooks/pedido-listo
HTTP Headers:
  Content-Type: application/json
  x-webhook-secret: <SUPABASE_PEDIDOS_WEBHOOK_SECRET>
```

**Importante:** Supabase Database Webhooks usan `pg_net`. Verificar que está activo.

### 3 — Verificar `pg_net` en Supabase

En el SQL Editor de Supabase:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

Si no está instalada:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Nota: En proyectos Supabase nuevos, `pg_net` está disponible pero puede necesitar
habilitarse manualmente.

### 4 — Verificar la anon key de Pizza_and_roll

La anon key está en `/Users/ptoledos/Pizza_and_roll/.env.local`:
```
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

Usar este valor como `SUPABASE_PEDIDOS_ANON_KEY` en Poke and roll.
No copiar service role keys a documentación.

### 5 — Probar el webhook manualmente

Una vez configurado, enviar un request de prueba:
```bash
curl -X POST https://goupsoluciones.cl/api/webhooks/pedido-listo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <secret>" \
  -d '{"type":"UPDATE","table":"orders","record":{"id":"test","number":"PR-TEST","status":"listo","source":"whatsapp","customer_phone_snapshot":"56912345678","type":"retiro_local"},"old_record":{"status":"en_preparacion"}}'
```

Esperado: `{"ok":true}` o `{"ok":true,"skipped":true}` si no hay sesión activa para ese orderId.

## Entregables

- Variables de entorno configuradas en `.env.local` y Vercel
- Database Webhook configurado en Supabase
- `pg_net` verificado activo
- Prueba manual del webhook exitosa
