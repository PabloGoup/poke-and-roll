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

## Log del Director — 2026-06-11 (Oleada 5 + fix pérdida de contexto)

- Oleadas 0-6 completadas. Los 3 subagentes de Oleada 5 fallaron por límite de sesión; el Director completó el trabajo directamente.
- **Bug crítico de producción corregido** (conversación real reportada por el usuario): afirmaciones cortas ("si", "ok", "dale") perdían contexto y el agente volvía a saludar.
  - `dispatcher.ts`: nueva `resolverAfirmacionConContexto()` — reescribe afirmaciones cortas usando la última pregunta del agente del historial. Si la pregunta era aclaración de producto ("¿Te refieres a la Promo 30 Fritas?") y el carrito está vacío → se convierte en pedido directo.
  - `dispatcher.ts`: `RespuestaModulo.moduloEjecutado` — el dispatcher reporta qué módulo ejecutó.
  - `webhooks/whatsapp/route.ts`: persiste SIEMPRE el módulo donde quedó la conversación (crea sesión al salir de BIENVENIDA) y refresca `ultimaActividadEn` en cada mensaje.
  - `contexto-comercial.ts`: regla CRÍTICA en TONO_Y_ESTILO — nunca re-saludar con historial previo; "sí" continúa desde donde quedó.
- `webhooks/pedido-listo/route.ts`: ahora cierra la sesión (`completada`) tras notificar.
- Documento de flujo canónico del usuario guardado en `references/flujo-atencion-whatsapp.md` (30 flujos + matriz de decisiones).
- Build de producción Next.js: ✅ pasa. TypeScript: ✅ limpio.
- Pendiente: Oleada 7 (pruebas E2E) + acciones del usuario (service role key, SQL en Supabase dashboard, Database Webhook, GOOGLE_MAPS_API_KEY).

## Log del Director — 2026-06-11 (Oleada 7 — Pruebas E2E)

Resultados contra entorno real de Supabase:
- A Catálogo: ✅ 78 productos reales vía buscar_productos_activos
- B Fuzzy match: ✅ 4/4 (exacto, sin tildes, parcial, inexistente→noEncontrados)
- C Zonas: ⚠️ delivery_zones VACÍA — sin zonas, ningún delivery podrá crearse (acción usuario)
- D Crear orden: ✅ PR-001050 con source='whatsapp', cashier_id correcto, kitchen_ticket creado
- E Webhook pedido-listo: ✅ 401 sin secret, ok con secret, skipped para source web
- F Guards: ✅ cancelación/timeout/continuar
- G Cancelación: ❌→CORREGIDO — anon key no puede UPDATE/SELECT orders (RLS silencioso)

Correcciones derivadas de E2E:
- REGRESIÓN BLOQUEO 3 detectada y corregida: zonas-despacho.ts había sido reescrito para usar
  solo Neon/km; ahora es Supabase-first (delivery_zones autoritativo) con fallback km.
- m09: usa el district exacto de delivery_zones para garantizar match en la RPC.
- Nueva RPC cancel_storefront_order + get_storefront_order_status
  (Pizza_and_roll/supabase/add_cancel_storefront_order.sql) — PENDIENTE ejecutar en dashboard.
- cancelarOrdenSupabase y consultarEstadoOrden migrados a las RPC; m06 usa el helper central.
- Orden de prueba PR-001050 cancelada (limpieza).

ACCIONES PENDIENTES DEL USUARIO:
1. Ejecutar add_cancel_storefront_order.sql en el SQL Editor de Supabase.
2. Poblar delivery_zones con las comunas de cobertura (district, fee, base_minutes, is_active).

## Log del Director — 2026-06-11 (Re-test E2E tras configuración del usuario)

Usuario completó: RPCs aplicadas en Supabase + delivery_zones poblada (Santiago $2.000, Providencia $2.500).

Resultados del re-test:
- C Zonas: ✅ "Santiago" → cubierto $2.000 (Zona Centro); "Arica" → fuera_cobertura. Supabase-first operativo.
- D Crear orden: ✅ PR-001051 creada (la marca ❌ del script es solo la verificación SELECT con anon key, bloqueada por RLS por diseño; verificada OK con service role).
- G Cancelación: ❌ → BUG SQL encontrado: "column reference order_id is ambiguous" — el parámetro
  de la RPC colisionaba con la columna kitchen_tickets.order_id en PL/pgSQL.

Corrección aplicada (v2 de add_cancel_storefront_order.sql):
- Parámetros renombrados con prefijo p_ (p_order_id, p_customer_phone, p_reason) y variables v_.
- Incluye DROP FUNCTION previos (CREATE OR REPLACE no permite renombrar argumentos).
- Callers TS actualizados: lib/supabase-pedidos.ts (cancelarOrdenSupabase, consultarEstadoOrden)
  y scripts/test-e2e.ts usan los nombres p_*.
- Orden de prueba PR-001051 cancelada con service role (limpieza).

PENDIENTE USUARIO: re-ejecutar /Users/ptoledos/Pizza_and_roll/supabase/add_cancel_storefront_order.sql
(v2 completo, incluye los DROP) en el SQL Editor. Luego `npx tsx scripts/test-e2e.ts` con
NODE_OPTIONS="--experimental-websocket" debe dar G ✅.

## Log del Director — 2026-06-11 (CIERRE — E2E 7/7 ✅)

Usuario aplicó el SQL v2. Suite final completa:
- A Catálogo ✅ | B Fuzzy 4/4 ✅ | C Zonas ✅ (Santiago cubierto $2.000 / Arica rechazada)
- D Crear orden ✅ (verificación migrada a RPC get_storefront_order_status — el SELECT anon
  está bloqueado por RLS por diseño, era un falso negativo del script)
- E Webhook pedido-listo ✅ (validado en corrida anterior: 401 sin secret / ok / skipped no-whatsapp)
- F Guards ✅ | G Cancelación ✅ (RPC v2 con params p_*)

El script scripts/test-e2e.ts es auto-limpiante: la Prueba G cancela la orden que crea la Prueba D.
Comando: NODE_OPTIONS="--experimental-websocket" npx tsx scripts/test-e2e.ts

INTEGRACIÓN COMPLETA — las 8 oleadas (0-7) cerradas. Pendientes de producción (fuera del alcance
de la integración): tokens WABA reales, env vars SUPABASE_PEDIDOS_* en Vercel, suscripción del
campo messages en Meta Developer Console.
