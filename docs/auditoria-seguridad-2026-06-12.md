# Auditoría de seguridad — 2026-06-12

## Alcance

- Autenticación y autorización.
- Aislamiento entre locales.
- Webhooks y OAuth de Meta.
- Secretos, tokens y variables de entorno.
- Storage, archivos y service role de Supabase.
- Datos personales de clientes.
- Dependencias de producción.

## Corregido

### Crítico

- Las conversaciones y métricas ahora se filtran por `localId` para usuarios de local.
- Carga de catálogos, tarifas, health y alertas requieren autenticación.
- El laboratorio usa el `localId` de la sesión y restringe órdenes POS reales a administradores.
- Instagram, Facebook y WhatsApp ignoran eventos de cuentas o números no asociados a un local.
- El OAuth `state` de Meta ahora está firmado con HMAC y expira en 15 minutos.
- Se eliminó el verify token Meta predeterminado.
- Los callbacks n8n y pedido-listo validan secretos.

### Alto

- Se eliminaron contraseñas seed hardcodeadas.
- Los archivos se limitan a 10 MB y tipos permitidos.
- Las URLs de catálogos registradas por JSON deben usar HTTPS.
- Se eliminó la dependencia `go`, que introducía vulnerabilidades críticas transitivas.

### Medio

- Se agregaron cabeceras HSTS, anti-clickjacking, `nosniff`, referrer y permissions policy.
- Health ya no devuelve mensajes internos de conexión.
- Los errores de Storage ya no exponen nombres de secretos requeridos al cliente.
- Los payloads JSON inválidos de Meta se rechazan de forma controlada.

## Riesgos pendientes

### Alto

1. Los tokens `igToken`, `fbToken` y `waToken` están almacenados en texto plano en Neon.
   - Recomendación: cifrado AES-GCM con una clave KMS/variable separada, versionado de claves y migración con rotación de tokens.

2. Los payloads completos de Meta y mensajes contienen datos personales.
   - Definir retención máxima, borrado programado y minimización de `EventoMeta.payload`/`Mensaje.payloadMeta`.
   - Documentar finalidad y retención en política de privacidad.

3. No existe rate limiting explícito para login y endpoints públicos.
   - Configurar Vercel Firewall/rate limits para `/api/auth/*`, webhooks y OAuth.

### Medio

1. `npm audit` conserva dos avisos moderados de PostCSS asociados a Next.
   - No usar `npm audit fix --force`, porque propone un downgrade incompatible.
   - Actualizar Next/PostCSS cuando exista una versión estable compatible que resuelva el aviso.

2. La configuración comercial todavía usa tablas globales sin `localId`.
   - Antes de sumar otros restaurantes, migrar reglas, catálogos, items y tarifas a propiedad por local.

3. Falta una Content Security Policy completa.
   - Diseñarla después de inventariar dominios de Supabase, Meta, imágenes y scripts utilizados.

## Acciones operativas obligatorias

- Configurar `META_VERIFY_TOKEN` con valor largo, aleatorio y distinto de otros secretos.
- Configurar `N8N_CALLBACK_SECRET`.
- Confirmar `SUPABASE_PEDIDOS_WEBHOOK_SECRET`.
- Configurar `AUTH_SECRET` y `META_APP_SECRET`; cualquiera de ellos permite firmar OAuth state.
- Rotar cualquier contraseña que haya usado históricamente `goup2024` o `poke2024`.
- Para ejecutar seeds usar:
  - `SEED_SUPER_ADMIN_PASSWORD`
  - `SEED_LOCAL_ADMIN_PASSWORD`
  - Ambas con mínimo 14 caracteres.
- Revisar en Meta Business que solo estén concedidos los permisos necesarios.
- Mantener URLs de privacidad y eliminación de datos activas y públicas.
- Rotar tokens Meta si fueron compartidos por chat, logs, capturas o archivos fuera de Vercel.

## Validación

- Búsqueda de secretos versionados: sin `.env`, claves privadas o certificados detectados.
- `npm audit --omit=dev`: 2 moderadas; 0 críticas y 0 altas.
- `npm run build`: OK.
