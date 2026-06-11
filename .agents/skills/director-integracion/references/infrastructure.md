# Infraestructura — Integración WhatsApp ↔ Supabase

## Variables Requeridas En Poke and roll

Configurar en `.env.local` y en Vercel Environment Variables:

| Variable | Uso |
|---|---|
| `SUPABASE_PEDIDOS_URL` | URL del proyecto Supabase de Pizza_and_roll. |
| `SUPABASE_PEDIDOS_ANON_KEY` | Anon/publishable key del proyecto Pizza_and_roll. No usar service role aquí. |
| `SUPABASE_PEDIDOS_WEBHOOK_SECRET` | Secret privado del webhook `pedido-listo`. Debe estar rotado. |
| `WHATSAPP_BOT_CASHIER_ID` | UUID de perfil técnico/cajero para órdenes creadas por WhatsApp. |
| `GOOGLE_MAPS_API_KEY` | Opcional para geocodificación y cálculo de zonas. |

Ejemplo sin secretos reales:

```env
SUPABASE_PEDIDOS_URL=https://<project-ref>.supabase.co
SUPABASE_PEDIDOS_ANON_KEY=<supabase-anon-or-publishable-key>
SUPABASE_PEDIDOS_WEBHOOK_SECRET=<rotated-random-secret>
WHATSAPP_BOT_CASHIER_ID=<uuid-existing-profile>
GOOGLE_MAPS_API_KEY=<optional-google-key>
```

## Rotación de Secret

`SUPABASE_PEDIDOS_WEBHOOK_SECRET` debe rotarse porque fue expuesto durante el rescate.

```bash
openssl rand -hex 32
```

Actualizar el nuevo valor en:

- `.env.local`
- Vercel
- Supabase Database Webhook header `x-webhook-secret`

## Service Role

No usar anon/publishable keys como service role. Si una variable llamada `SUPABASE_VENTAS_SERVICE_ROLE_KEY` contiene una key pública, reemplazarla por una service role real solo en un entorno seguro y nunca documentar el valor.

## Database Webhook En Supabase

Panel: Supabase → proyecto Pizza_and_roll → Database → Webhooks

- Nombre: `notify-whatsapp-pedido-listo`
- Tabla: `public.orders`
- Evento: `UPDATE`
- URL: `https://goupsoluciones.cl/api/webhooks/pedido-listo`
- Headers:
  - `Content-Type: application/json`
  - `x-webhook-secret: <SUPABASE_PEDIDOS_WEBHOOK_SECRET_ROTADO>`

## pg_net

Verificar en SQL Editor:

```sql
select * from pg_extension where extname = 'pg_net';
```

Si no está habilitado:

```sql
create extension if not exists pg_net;
```

## Perfil Bot WhatsApp

Usar un perfil cajero técnico existente o ejecutar el seed idempotente:

```sql
-- Revisar antes en producción si public.profiles referencia auth.users(id).
-- Ver /Users/ptoledos/Pizza_and_roll/supabase/seed-bot-profile.sql
```

El UUID final debe coincidir con `WHATSAPP_BOT_CASHIER_ID`.

## Prueba Manual Del Webhook

```bash
curl -X POST https://goupsoluciones.cl/api/webhooks/pedido-listo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <SUPABASE_PEDIDOS_WEBHOOK_SECRET_ROTADO>" \
  -d '{"type":"UPDATE","table":"orders","schema":"public","record":{"id":"00000000-0000-0000-0000-000000000000","number":"PR-TEST","status":"listo","source":"whatsapp","customer_phone_snapshot":"56912345678","customer_name_snapshot":"Cliente Test","type":"retiro_local"},"old_record":{"status":"en_preparacion"}}'
```

Respuesta esperada para contrato válido: `{"ok":true}` o `skipped` si no existe una sesión local asociada.
