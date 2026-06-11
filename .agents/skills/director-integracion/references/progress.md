# Progress Tracker — Integración Poke and roll + Pizza_and_roll

Actualizado: 2026-06-11

## Estado General

La base técnica del rescate quedó implementada localmente. El flujo objetivo es:

```text
WhatsApp -> agente modular -> orden Supabase -> POS/cocina -> pedido listo -> notificación WhatsApp
```

Hay 25 specs operativas en `agents/`, numeradas `00` a `24`. La validación final sigue pendiente hasta probar con webhooks y Supabase/Vercel configurados.

| Área | Estado | Nota |
|---|---|---|
| Skill `director-integracion` | ✅ Normalizado | `SKILL.md` corto, referencias separadas y metadata UI. |
| Dispatcher modular | ✅ Implementado | API canónica: `despacharModulo()`. Alias compatible: `despachar`. |
| Build Poke and roll | ✅ Pasa localmente | Quedan warnings no bloqueantes de lint. |
| Build Pizza_and_roll | ✅ Pasa localmente | Quedan warnings/chunks no bloqueantes. |
| WhatsApp multi-local | ⚠️ Implementado en código | El local `Sushi Poke & Roll` existe, pero `Local.waPhoneId` y `Local.waToken` están pendientes. |
| Pedido listo | ✅ Implementado en código | Mensaje de delivery no promete "va en camino" al pasar a `listo`. |
| RPC Supabase | ✅ Validado en producción | `buscar_productos_activos()` devuelve 78 productos y `create_storefront_order(payload jsonb)` pasó prueba con rollback. |
| Webhook Supabase | ⚠️ Pendiente externo | Falta configurar URL, header y secret rotado. |
| Deploy Vercel | ✅ Validado | Redeploy productivo hecho y `pedido-listo` responde en `https://goupsoluciones.cl`. |
| Validación E2E | ⬜ Pendiente | Requiere ambiente con Meta/Supabase activos. |

## Estado Por Spec

| # | Spec | Estado |
|---|---|---|
| 00 | Auditor de Brechas | ✅ Reconciliado |
| 01 | Arquitecto de Integración | ✅ Reconciliado |
| 02 | Experto Restaurante | ✅ Reconciliado |
| 03 | Prisma/Neon | ✅ Implementado local |
| 04 | RPC Supabase | ⚠️ SQL preparado, pendiente aplicar |
| 05 | Resolución de Productos | ✅ Implementado local |
| 06 | Reconciliación de Zonas | ✅ Implementado local |
| 07 | Multi-tenant WhatsApp | ✅ Implementado local |
| 08 | Seguridad | ⚠️ Requiere rotar secret |
| 09 | DevOps | ⚠️ Requiere configurar Vercel/Supabase |
| 10 | Arquitecto de Módulos | ✅ Implementado local |
| 11 | Prompts por Módulo | ✅ Implementado local |
| 12 | Estado de Pedidos | ✅ Implementado local |
| 13 | Módulos M01-M05 | ✅ Implementado local |
| 14 | Módulos M06-M10 | ✅ Implementado local |
| 15 | Módulos M11-M13 | ✅ Implementado local |
| 16 | Horarios y Disponibilidad | ✅ Implementado local |
| 17 | API Next.js | ✅ Implementado local |
| 18 | Notificaciones | ✅ Implementado local |
| 19 | Errores y Resiliencia | ✅ Implementado local |
| 20 | Cocina Display | ⚠️ Vive en Pizza_and_roll |
| 21 | Realtime UI | ⚠️ Vive en Pizza_and_roll |
| 22 | POS + Caja | ⚠️ Vive en Pizza_and_roll |
| 23 | Cliente Frecuente | ✅ Implementado local |
| 24 | Pruebas E2E | ⬜ Pendiente |

## Últimas Decisiones

- WhatsApp es el único canal que gestiona pedidos.
- Instagram/Facebook se limitan a derivación, dudas, campañas, noticias y marketing.
- `pedido-listo` significa que cocina terminó; no significa automáticamente que el delivery salió.
- Las órdenes WhatsApp deben crearse con `source = 'whatsapp'` y `cashier_id` de perfil técnico si está disponible.
- No se deben dejar tokens, service role keys ni webhook secrets reales en documentación.
- El bloqueo inmediato para notificación real es cargar credenciales WhatsApp en `Local.waPhoneId` y `Local.waToken` o configurar fallback global válido.
