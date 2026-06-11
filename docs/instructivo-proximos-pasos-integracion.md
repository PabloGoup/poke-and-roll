# Instructivo — próximos pasos para cerrar la integración

Fecha: 2026-06-11

Este instructivo indica qué debes hacer ahora para pasar del estado local compilable a una integración operativa con Supabase, Vercel, WhatsApp y POS/cocina.

## Estado de partida

Ya está implementado localmente:

- Agente modular WhatsApp.
- Webhook WhatsApp con sesiones de pedido.
- Webhook `pedido-listo`.
- Conexión preparada a Supabase/Pizza_and_roll.
- SQL preparado para `source = "whatsapp"`, `cashier_id` y catálogo activo.
- Skill `director-integracion` normalizado.
- Builds locales OK en ambos proyectos.

Falta configurar servicios reales y validar end-to-end.

## Avance actual

Actualizado durante la ejecución guiada:

| Paso | Estado | Nota |
|---|---|---|
| Rotar `SUPABASE_PEDIDOS_WEBHOOK_SECRET` | ✅ Hecho | Secret nuevo generado y guardado en `.env.local`. No se documentó el valor. |
| Subir variables a Vercel | ✅ Hecho | `SUPABASE_PEDIDOS_URL`, `SUPABASE_PEDIDOS_ANON_KEY`, `SUPABASE_PEDIDOS_WEBHOOK_SECRET` y `WHATSAPP_BOT_CASHIER_ID` están en Production/Preview. |
| Revisar Supabase CLI | ✅ Hecho | CLI autenticado y vinculado al proyecto `Pizza and roll` (`aefneixnrlkbhfyplkid`). |
| Aplicar SQL principal | ✅ Hecho | Existen `buscar_productos_activos()` y `create_storefront_order(payload jsonb)`. |
| Validar catálogo/RPC | ✅ Hecho | `jsonb_array_length(public.buscar_productos_activos())` devolvió `78` productos activos. |
| Perfil técnico Bot WhatsApp | ✅ Hecho | Se usó un perfil real existente de `public.profiles` y se actualizó `WHATSAPP_BOT_CASHIER_ID` en `.env.local` y Vercel Production/Preview. |
| Prueba transaccional de pedido | ✅ Hecho | `create_storefront_order` respondió con JSON dentro de `begin ... rollback` y la verificación posterior devolvió `0/0`. |
| Configurar credenciales WhatsApp por local | ✅ Hecho | `Local.waPhoneId = 1208160645712794` y `waToken` del número sandbox de Meta configurados en Neon. |
| Webhook WhatsApp Meta configurado | ✅ Hecho | URL `https://goupsoluciones.cl/api/webhooks/whatsapp` + token `poke-roll-webhook` verificados y guardados. Campo `messages` suscrito al WABA. |
| Número personal como destinatario | ✅ Hecho | Número personal verificado en Meta Developer Console como destinatario del sandbox. |
| Configurar Database Webhook Supabase | ✅ Hecho | `notify-whatsapp-pedido-listo` en tabla `orders` UPDATE → `https://goupsoluciones.cl/api/webhooks/pedido-listo` con header `x-webhook-secret`. |
| Deploy nuevo | ✅ Hecho | Redeploy productivo realizado y alias confirmado en `https://goupsoluciones.cl`. |
| Prueba webhook `pedido-listo` | ✅ Hecho | La ruta responde con secret válido y salta correctamente cuando no hay transición a `listo`. |
| Prueba E2E | ⬜ Pendiente | WhatsApp → orden → POS/cocina → pedido listo → notificación. |

Nota: se intentó revisar aplicación por Supabase CLI, pero el acceso remoto de Postgres requiere la contraseña de base de datos. Para evitar riesgo, el SQL se está aplicando manualmente desde Supabase SQL Editor.

## Orden recomendado

Ejecuta los pasos en este orden:

1. Rotar secretos.
2. Revisar variables de entorno.
3. Aplicar SQL en Supabase.
4. Crear o confirmar perfil técnico del bot.
5. Configurar locales WhatsApp.
6. Configurar webhook Supabase.
7. Hacer deploy.
8. Probar flujo completo.

## 1. Rotar `SUPABASE_PEDIDOS_WEBHOOK_SECRET`

El secret anterior debe considerarse expuesto.

Genera uno nuevo:

```bash
openssl rand -hex 32
```

Guárdalo temporalmente en un lugar seguro mientras configuras todo.

No lo pegues en documentación, capturas ni chats.

## 2. Actualizar variables en local

En `Poke and roll`, revisa `.env.local` y asegúrate de tener:

```env
SUPABASE_PEDIDOS_URL=https://<project-ref>.supabase.co
SUPABASE_PEDIDOS_ANON_KEY=<anon-or-publishable-key>
SUPABASE_PEDIDOS_WEBHOOK_SECRET=<secret-rotado>
WHATSAPP_BOT_CASHIER_ID=<uuid-perfil-cajero-bot>
GOOGLE_MAPS_API_KEY=<opcional>
```

Reglas:

- `SUPABASE_PEDIDOS_ANON_KEY` debe ser anon/publishable key, no service role.
- `SUPABASE_PEDIDOS_WEBHOOK_SECRET` debe ser el nuevo.
- `WHATSAPP_BOT_CASHIER_ID` debe existir en Supabase `public.profiles`.
- No uses una anon key como si fuera service role.

## 3. Revisar variables en Vercel

En Vercel, entra al proyecto de `goupsoluciones.cl` o `Poke and roll`:

```text
Project -> Settings -> Environment Variables
```

Actualiza/agrega:

- `SUPABASE_PEDIDOS_URL`
- `SUPABASE_PEDIDOS_ANON_KEY`
- `SUPABASE_PEDIDOS_WEBHOOK_SECRET`
- `WHATSAPP_BOT_CASHIER_ID`
- `GOOGLE_MAPS_API_KEY`, si usarás geocodificación
- Variables WhatsApp globales solo como fallback de desarrollo:
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`

Si el sistema ya trabajará multi-local, lo correcto es usar `Local.waToken` y `Local.waPhoneId` por local.

## 4. Aplicar SQL en Supabase

Proyecto:

```text
/Users/ptoledos/Pizza_and_roll
```

Archivo principal:

```text
supabase/add_storefront_checkout_profiles.sql
```

Qué contiene:

- `create_storefront_order(payload jsonb)`
- soporte para `checkout.source`
- soporte para `checkout.cashier_id`
- soporte para `paymentMethod = "mixto"` si el enum lo permite
- creación de ticket de cocina
- creación de despacho si corresponde
- RPC `buscar_productos_activos()`

Acción:

1. Abre Supabase.
2. Entra al proyecto de Pizza_and_roll.
3. Ve a SQL Editor.
4. Revisa el SQL antes de ejecutar.
5. Ejecútalo primero en staging si existe.
6. Si pasa, ejecútalo en producción.

Estado actual:

- Se aplicó parcialmente el SQL: el `ALTER TABLE` ya fue ejecutado.
- El bloque `create or replace function public.buscar_productos_activos()` ya fue ejecutado por el usuario.
- La validación `jsonb_array_length(public.buscar_productos_activos())` devolvió `78`, por lo que la RPC de catálogo está operativa.
- Si Supabase muestra `ERROR: 42P13: no language specified`, significa que se pegó/ejecutó solo la primera línea de la función. Debe pegarse el bloque completo, incluyendo `returns jsonb`, `language plpgsql`, `as $$`, `end; $$;` y los `grant execute`.
- La consulta de funciones ya muestra `buscar_productos_activos` y `create_storefront_order(payload jsonb)`.
- El SQL principal queda aplicado para la integración.
- La primera prueba transaccional de `create_storefront_order` falló por ambigüedad entre columnas de `store_settings` y variables PL/pgSQL (`pickup_base_minutes`, `delivery_base_minutes`, `per_pending_order_minutes`).
- Se corrigió el archivo local usando alias `settings.*` y se reemplazó la función corregida en Supabase.
- La prueba transaccional `begin ... rollback` respondió con JSON de pedido, confirmando que `create_storefront_order` funciona.
- La verificación posterior devolvió `pedidos_prueba = 0` y `clientes_prueba = 0`.
- Verificación recomendada para confirmar que el rollback no dejó datos:

```sql
select
  (select count(*) from public.orders where customer_phone_snapshot = '56900000000' or notes ilike '%Prueba rollback%') as pedidos_prueba,
  (select count(*) from public.customers where phone = '56900000000') as clientes_prueba;
```

El resultado esperado es `0` y `0`.
- Si al ejecutar aparece `type public.order_source does not exist`, falta aplicar antes el SQL base `/Users/ptoledos/Pizza_and_roll/supabase/add_storefront_web_channel.sql`.
- Si aparece un error, detener el proceso y revisar el mensaje exacto antes de continuar.
- Si `select public.buscar_productos_activos();` devuelve `function does not exist`, significa que se ejecutó la validación antes de crear la función. Vuelve a pegar y ejecutar el SQL completo.

Validación rápida:

```sql
select public.buscar_productos_activos();
```

Debe devolver un arreglo JSON, aunque sea vacío si no hay productos activos.

## 5. Crear o confirmar perfil técnico `Bot WhatsApp`

El bot necesita un `cashier_id` para que las órdenes tengan trazabilidad.

Archivo preparado:

```text
/Users/ptoledos/Pizza_and_roll/supabase/seed-bot-profile.sql
```

Opción recomendada:

- Usar un perfil técnico/cajero existente si ya lo tienes.
- Copiar su UUID.
- Usarlo como `WHATSAPP_BOT_CASHIER_ID`.

Opción alternativa:

- Ejecutar `seed-bot-profile.sql`.
- Verificar que el registro exista en `public.profiles`.
- Usar ese UUID como `WHATSAPP_BOT_CASHIER_ID`.

Importante:

- Si `public.profiles` referencia `auth.users(id)`, no fuerces el insert rompiendo la FK.
- En ese caso, crea primero un usuario/perfil técnico válido o usa un cajero existente dedicado al bot.
- Estado validado: `profiles_id_fkey` referencia `auth.users`, por lo que el UUID fijo `00000000-0000-0000-0000-000000000001` no debe usarse si no existe también en Auth.
- Recomendación práctica: usar un perfil de cajero/admin existente dedicado al bot y actualizar `WHATSAPP_BOT_CASHIER_ID` en local y Vercel con ese UUID.
- Estado actual: se eligió un perfil real existente y se actualizó `WHATSAPP_BOT_CASHIER_ID` en `.env.local`, Vercel Production y Vercel Preview.
- Mejora recomendada después de validar el flujo: crear un usuario técnico separado para el bot y reemplazar el UUID del administrador.

Consulta para listar candidatos:

```sql
select
  id,
  coalesce(full_name, '') as full_name,
  coalesce(role::text, '') as role,
  coalesce(email, '') as email
from public.profiles
order by role, full_name, email
limit 50;
```

## 6. Configurar locales WhatsApp

En la base de datos de `Poke and roll`, cada local debe tener:

- `Local.waPhoneId`
- `Local.waToken`, idealmente

El webhook WhatsApp identifica el local así:

```text
Meta value.metadata.phone_number_id -> Local.waPhoneId
```

Si `waPhoneId` está vacío o mal escrito:

- El mensaje puede caer al fallback global.
- No habrá multi-local real.
- Las conversaciones podrían asociarse sin local.

Checklist por local:

- Nombre del local correcto.
- Slug correcto.
- `waPhoneId` del número WhatsApp Business correcto.
- Token válido para enviar mensajes desde ese número.
- Usuario admin vinculado al local si corresponde.

Estado actual verificado en Neon/Prisma:

```text
Local: Sushi Poke & Roll
slug: poke-and-roll
waPhoneId: pendiente
waToken: pendiente
```

Esto explica por qué `https://goupsoluciones.cl/api/health` aún muestra `whatsapp: false`: las variables globales de WhatsApp también están vacías. Para producción multi-local, lo correcto es cargar `waPhoneId` y `waToken` en el registro `Local`; las variables globales quedan solo como fallback de desarrollo.

También se revisó el token Meta disponible en `.env`: corresponde a un contexto de Página/Meta y no permite descubrir activos WhatsApp Business para esta app, por lo que no debe reutilizarse como `waToken` del local.

Siguiente acción recomendada:

1. Obtener en Meta el `phone_number_id` del número WhatsApp Business.
2. Obtener un token válido para enviar mensajes por ese número.
3. Guardarlos en el local correspondiente de Poke and roll sin documentar el valor del token.

Script preparado para cargar las credenciales en el local:

```bash
LOCAL_SLUG="poke-and-roll" \
WA_PHONE_ID="<phone_number_id>" \
WA_TOKEN="<whatsapp_access_token>" \
npm run config:whatsapp-local
```

El script actualiza `Local.waPhoneId` y `Local.waToken`, pero solo imprime si quedaron configurados; no muestra el token.

Consulta segura para verificar después de cargarlo, sin exponer valores:

```bash
node <<'NODE'
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.local.findMany({
  select: { nombre: true, slug: true, waPhoneId: true, waToken: true },
})
  .then((rows) => console.log(rows.map((local) => ({
    nombre: local.nombre,
    slug: local.slug,
    waPhoneId: Boolean(local.waPhoneId),
    waToken: Boolean(local.waToken),
  }))))
  .finally(() => prisma.$disconnect());
NODE
```

## 7. Configurar webhook `pedido-listo` en Supabase

En Supabase:

```text
Database -> Webhooks -> Create webhook
```

Configuración:

```text
Nombre: notify-whatsapp-pedido-listo
Tabla: public.orders
Evento: UPDATE
URL: https://goupsoluciones.cl/api/webhooks/pedido-listo
```

Headers:

```text
Content-Type: application/json
x-webhook-secret: <SUPABASE_PEDIDOS_WEBHOOK_SECRET_ROTADO>
```

Verifica `pg_net`:

```sql
select * from pg_extension where extname = 'pg_net';
```

Si no aparece:

```sql
create extension if not exists pg_net;
```

## 8. Hacer deploy

Estado actual:

- Deploy productivo realizado.
- `.vercelignore` creado para evitar subir `.env` y `.env.local`.
- Dominio `https://goupsoluciones.cl` apuntando al deployment productivo.
- `https://goupsoluciones.cl/api/webhooks/pedido-listo` responde correctamente con el secret válido.

Para futuros cambios:

1. Haz nuevo deploy.
2. Espera que termine sin errores.
3. Confirma que el dominio apunta al deployment correcto.
4. Verifica que estas rutas existan:

```text
https://goupsoluciones.cl/api/webhooks/whatsapp
https://goupsoluciones.cl/api/webhooks/pedido-listo
https://goupsoluciones.cl/privacidad
https://goupsoluciones.cl/eliminacion-datos
```

## 9. Prueba local antes de producción real

En `Poke and roll`:

```bash
npm run build
npm run dev
```

En `Pizza_and_roll`:

```bash
npm run build
npm run dev
```

Validar:

- Dashboard carga.
- POS carga.
- Cocina carga.
- No aparecen errores de variables faltantes.

## 10. Prueba manual del webhook `pedido-listo`

Usa una orden real de prueba si ya existe.

Ejemplo genérico:

```bash
curl -X POST https://goupsoluciones.cl/api/webhooks/pedido-listo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <SUPABASE_PEDIDOS_WEBHOOK_SECRET_ROTADO>" \
  -d '{"type":"UPDATE","table":"orders","schema":"public","record":{"id":"00000000-0000-0000-0000-000000000000","number":"PR-TEST","status":"listo","source":"whatsapp","customer_phone_snapshot":"56912345678","customer_name_snapshot":"Cliente Test","type":"retiro_local"},"old_record":{"status":"en_preparacion"}}'
```

Resultados esperados:

- `401`: secret incorrecto.
- `skipped`: payload válido, pero no corresponde notificar.
- `ok: true`: webhook procesado.

Estado actual:

- La prueba contra producción con payload sin transición a `listo` respondió `{"ok":true,"skipped":"not-listo-transition"}`.
- Esto valida que la ruta existe, que el dominio funciona y que el header `x-webhook-secret` está siendo aceptado.
- Falta probar una transición real `en_preparacion -> listo` desde Supabase cuando el local ya tenga credenciales WhatsApp.

## 11. Prueba E2E WhatsApp

Haz una prueba con un número controlado.

Secuencia mínima:

1. Cliente escribe `hola`.
2. Agente responde bienvenida.
3. Cliente pide una promoción.
4. Agente arma pedido.
5. Cliente confirma.
6. Agente pregunta retiro o delivery.
7. Cliente elige modalidad.
8. Agente pide datos faltantes.
9. Agente crea orden en Supabase.
10. Orden aparece en POS con badge WhatsApp.
11. Orden aparece en cocina.
12. Cocina marca `listo`.
13. Cliente recibe mensaje de pedido listo.

Validar en base de datos:

- `conversaciones.localId` correcto.
- `sesiones_pedido.externalOrderId` existe.
- `logs_modulo` registra módulos.
- `orders.source = whatsapp`.
- `orders.cashier_id` corresponde al bot o perfil técnico.
- `kitchen_tickets` tiene ticket asociado.

## 12. Prueba de no duplicación

Marca la misma orden como `listo` más de una vez.

Resultado esperado:

- El cliente no debe recibir múltiples notificaciones.
- El webhook debe responder `already-notified` o equivalente.

## 13. Prueba de delivery

Crear pedido delivery.

Validar:

- El agente no dice "va en camino" cuando cocina marca `listo`.
- El mensaje correcto debe ser que el pedido está listo y se coordinará despacho.
- El costo de despacho debe venir de la zona configurada.
- La dirección debe quedar registrada.

## 14. Prueba de Instagram/Facebook

Validar que Instagram/Facebook no gestionen pedidos completos.

Casos:

- "Quiero pedir" -> derivar a WhatsApp o sitio web.
- "Tienen promociones?" -> responder duda general y derivar.
- "Me mandas el menú?" -> responder con información permitida y derivar, sin cerrar pedido.
- "Quiero comprar 30 piezas" -> derivar a WhatsApp/sitio, no tomar pedido por Instagram/Facebook.

## 15. Criterio para pasar a producción

No pasar a producción hasta que se cumpla:

- Build OK en ambos proyectos.
- SQL aplicado.
- Secret rotado.
- Vercel con variables actualizadas.
- Webhook Supabase configurado.
- `Local.waPhoneId` correcto.
- Orden WhatsApp visible en POS.
- Orden visible en cocina.
- Notificación `pedido-listo` funcionando.
- No duplicación validada.
- Instagram/Facebook derivan y no toman pedidos.

## 16. Qué hacer si algo falla

### Falla creación de orden

Revisar:

- `SUPABASE_PEDIDOS_URL`
- `SUPABASE_PEDIDOS_ANON_KEY`
- RPC `create_storefront_order`
- UUIDs de productos
- `WHATSAPP_BOT_CASHIER_ID`
- cobertura de comuna

### Falla envío WhatsApp

Revisar:

- `Local.waToken`
- `Local.waPhoneId`
- fallback `WHATSAPP_ACCESS_TOKEN`
- ventana de 24 horas de Meta
- logs del endpoint WhatsApp

### Falla webhook `pedido-listo`

Revisar:

- header `x-webhook-secret`
- URL configurada en Supabase
- que `record.source = whatsapp`
- que `old_record.status !== listo`
- que exista teléfono del cliente
- que exista sesión asociada si se espera activar M12

### Pedido no aparece en POS

Revisar:

- `orders.source`
- filtros del POS
- tablas `orders`, `order_items`, `kitchen_tickets`
- permisos/RLS en Supabase

## 17. Archivos de referencia

- `docs/resumen-cambios-claude-codex.md`
- `docs/implementaciones-agente.md`
- `.agents/skills/director-integracion/SKILL.md`
- `.agents/skills/director-integracion/references/progress.md`
- `.agents/skills/director-integracion/references/bloqueantes.md`
- `.agents/skills/director-integracion/references/infrastructure.md`
- `.agents/skills/director-integracion/references/api-contracts.md`
- `.agents/skills/director-integracion/references/module-flow.md`
