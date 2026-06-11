# Bloqueantes y Riesgos de Integración

Actualizado: 2026-06-10

## Bloqueantes Actuales

### B1 — SQL preparado, pero no aplicado en Supabase

**Proyecto:** `/Users/ptoledos/Pizza_and_roll`

Los archivos SQL locales ya están reconciliados para `source = 'whatsapp'`, `cashier_id`, productos por UUID y pagos mixtos. Falta revisar y ejecutar los cambios en Supabase producción/staging antes de validar E2E.

**Acción:** aplicar con cuidado:

- `supabase/add_storefront_checkout_profiles.sql`
- `supabase/seed-bot-profile.sql` o usar un perfil cajero técnico existente

### B2 — Rotar `SUPABASE_PEDIDOS_WEBHOOK_SECRET`

El secret apareció en material pegado durante el rescate. Debe rotarse antes de producción.

**Acción:** generar uno nuevo y actualizarlo en:

- `.env.local` local
- Vercel Environment Variables
- Supabase Database Webhook header `x-webhook-secret`

### B3 — Configurar `Local.waPhoneId` por local

El webhook WhatsApp ya resuelve el local por `value.metadata.phone_number_id` contra `Local.waPhoneId`. Si ese campo está vacío o incorrecto, el sistema caerá al fallback global y no quedará multi-local real.

**Acción:** registrar `waPhoneId` para cada local conectado.

### B4 — Validar credenciales WhatsApp por local

`Local.waToken` se usa cuando existe. Si no existe, el envío cae a `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` globales, válido solo para desarrollo.

**Acción:** completar `Local.waToken` o definir una estrategia segura de tokens por tenant.

### B5 — `WHATSAPP_BOT_CASHIER_ID` debe apuntar a un perfil válido

La orden WhatsApp debe tener trazabilidad de sistema. El UUID debe existir en `public.profiles` con rol operacional compatible, o usarse un perfil cajero técnico ya existente.

**Acción:** ejecutar seed o configurar UUID real en Poke and roll/Vercel.

### B6 — Validación E2E pendiente

Los builds locales pasan, pero falta probar el circuito completo con servicios vivos:

1. Webhook WhatsApp real.
2. Creación de orden en Supabase.
3. Visibilidad en POS/cocina.
4. Cambio a `listo`.
5. Notificación WhatsApp idempotente.

## Riesgos No Bloqueantes

### R1 — Ventana de 24 horas de Meta

Si el cliente no ha escrito dentro de la ventana permitida por WhatsApp, el aviso de pedido listo puede fallar. El webhook debe registrar el error sin romper el flujo.

### R2 — Service role vs anon key

Si una variable llamada `SUPABASE_VENTAS_SERVICE_ROLE_KEY` contiene una anon/publishable key, no servirá para operaciones con bypass RLS. No documentar valores reales y reemplazar solo en entornos seguros.

### R3 — Normalización de comunas

La cobertura depende de `delivery_zones.district`. Errores de escritura del cliente pueden requerir fallback humano o normalización adicional.

## Bloqueos Resueltos En Código Local

- `source` ya no debe quedar hardcodeado como `web` en la RPC preparada.
- `cashier_id` se acepta desde checkout en la RPC preparada.
- `product_variants.is_active` fue eliminado del contrato de catálogo porque esa columna no existe.
- `product_variants.price` se trata como precio absoluto.
- `despacharModulo()` quedó como API pública del dispatcher.
- `pedido-listo` para delivery ya no promete que el pedido está en camino.
