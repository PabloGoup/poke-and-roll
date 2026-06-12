# Resumen de cambios — rescate Claude Code + Codex

Fecha: 2026-06-10

Este documento resume, de forma descriptiva, los cambios incorporados durante el rescate del trabajo generado con Claude Code y las correcciones posteriores realizadas con Codex.

No incluye claves, tokens, service role keys ni secretos reales.

Instructivo operativo complementario:

- `docs/instructivo-proximos-pasos-integracion.md`

## 1. Objetivo del rescate

El objetivo fue conservar el trabajo generado previamente, ordenarlo y llevarlo a un estado coherente, compilable y alineado con el flujo operativo real:

```text
WhatsApp -> agente modular -> orden en Supabase -> POS/cocina -> pedido listo -> notificación WhatsApp
```

También se alineó el criterio comercial:

- WhatsApp queda como canal principal de pedidos.
- Sitio web y venta presencial también gestionan pedidos.
- Instagram y Facebook quedan para derivación, consultas, campañas, noticias, contenido y marketing.
- Instagram/Facebook no gestionan pedidos completos.

## 2. Cambios rescatados desde Claude Code

### 2.1 Skill `director-integracion`

Se creó el skill local:

- `.agents/skills/director-integracion/SKILL.md`
- `.agents/skills/director-integracion/agents/00-auditor-brechas.md`
- `.agents/skills/director-integracion/agents/01-arquitecto-integracion.md`
- `.agents/skills/director-integracion/agents/02-experto-restaurante.md`
- `.agents/skills/director-integracion/agents/03-prisma-neon.md`
- `.agents/skills/director-integracion/agents/04-rpc-supabase.md`
- `.agents/skills/director-integracion/agents/05-resolucion-productos.md`
- `.agents/skills/director-integracion/agents/06-reconciliacion-zonas.md`
- `.agents/skills/director-integracion/agents/07-multitenant-whatsapp.md`
- `.agents/skills/director-integracion/agents/08-seguridad.md`
- `.agents/skills/director-integracion/agents/09-devops.md`
- `.agents/skills/director-integracion/agents/10-arquitecto-modulos.md`
- `.agents/skills/director-integracion/agents/11-prompts-por-modulo.md`
- `.agents/skills/director-integracion/agents/12-estado-pedidos.md`
- `.agents/skills/director-integracion/agents/13-modulos-m01-m05.md`
- `.agents/skills/director-integracion/agents/14-modulos-m06-m10.md`
- `.agents/skills/director-integracion/agents/15-modulos-m11-m13.md`
- `.agents/skills/director-integracion/agents/16-horarios-disponibilidad.md`
- `.agents/skills/director-integracion/agents/17-api-nextjs.md`
- `.agents/skills/director-integracion/agents/18-notificaciones.md`
- `.agents/skills/director-integracion/agents/19-errores-resiliencia.md`
- `.agents/skills/director-integracion/agents/20-cocina-display.md`
- `.agents/skills/director-integracion/agents/21-realtime-ui.md`
- `.agents/skills/director-integracion/agents/22-pos-caja.md`
- `.agents/skills/director-integracion/agents/23-cliente-frecuente.md`
- `.agents/skills/director-integracion/agents/24-pruebas-e2e.md`

El propósito del skill es guiar la integración entre:

- `Poke and roll`: agente, WhatsApp, Prisma, Neon y Meta.
- `Pizza_and_roll`: Supabase, POS, cocina y pedidos.

### 2.2 Referencias del skill

Se incorporaron documentos de apoyo:

- `references/progress.md`
- `references/bloqueantes.md`
- `references/infrastructure.md`
- `references/module-flow.md`
- `references/api-contracts.md`
- `references/shared-types.md`

Estos documentos sirven para entender:

- Estado de avance.
- Contratos entre proyectos.
- Flujo modular del agente.
- Variables requeridas.
- Bloqueantes técnicos.
- Tipos compartidos.

### 2.3 Modelo de sesión de pedido en Prisma

Se agregaron modelos para soportar el flujo conversacional de pedidos:

- `SesionPedido`
- `LogModulo`

Esto permite:

- Mantener estado entre mensajes del cliente.
- Saber en qué módulo del flujo está una conversación.
- Guardar carrito, tipo de entrega, dirección, pago y orden externa.
- Registrar logs por módulo para auditoría y debugging.

También se agregó la relación entre `Conversacion` y `SesionPedido`.

### 2.4 Helpers de base de datos

Se agregaron funciones de apoyo en `lib/db-helpers.ts` para:

- Obtener una sesión de pedido activa.
- Crear o actualizar una sesión de pedido.
- Transicionar entre módulos.
- Guardar logs de módulos.
- Cerrar una sesión como completada o cancelada.

### 2.5 Agente modular M01-M13

Se creó la carpeta `lib/modulos/` con la estructura del agente de pedidos:

- `dispatcher.ts`
- `types.ts`
- `guards.ts`
- `cliente-frecuente.ts`
- `horarios.ts`
- `m01-bienvenida.ts`
- `m02-consultas.ts`
- `m03-atencion.ts`
- `m04-pedidos.ts`
- `m05-orden-compra.ts`
- `m06-orden-cancelacion.ts`
- `m07-confirmacion.ts`
- `m08-tipo-entrega.ts`
- `m09-direccion.ts`
- `m10-formas-pago.ts`
- `m11-dar-gracias.ts`
- `m12-entrega.ts`
- `m13-despedida.ts`

El flujo quedó dividido por responsabilidades:

- Bienvenida.
- Consultas generales.
- Atención humana.
- Toma de pedidos.
- Resumen de orden.
- Cancelación.
- Confirmación.
- Tipo de entrega.
- Dirección.
- Forma de pago.
- Confirmación final.
- Pedido listo.
- Despedida.

### 2.6 Prompts por módulo

Se creó `lib/modulos/prompts/` con prompts separados para cada módulo:

- `m01.ts` a `m13.ts`

Esto permite ajustar instrucciones por etapa sin tocar todo el agente.

### 2.7 Guards del flujo

Se incorporaron validaciones globales para:

- Cancelación del pedido.
- Timeouts.
- Intentos fallidos de confirmación.
- Transiciones inválidas.
- Escalamiento humano cuando falta información o existe riesgo operativo.

### 2.8 Integración con Supabase/Pizza_and_roll

Se agregó `lib/supabase-pedidos.ts` para conectar el agente de WhatsApp con el catálogo y órdenes de Supabase.

Funciones principales:

- Obtener catálogo activo.
- Resolver productos escritos por el cliente contra UUIDs reales.
- Crear órdenes con `source = "whatsapp"`.
- Consultar perfil de cliente frecuente.
- Consultar estado de una orden.
- Cancelar una orden pendiente.

También se agregó `@supabase/supabase-js` como dependencia.

### 2.9 Zonas de despacho y geocodificación

Se agregaron o ampliaron:

- `lib/zonas-despacho.ts`
- `lib/geocodificacion.ts`
- `lib/horarios.ts`

Objetivo:

- Validar cobertura de delivery.
- Obtener comuna desde dirección.
- Cruzar zona con `delivery_zones` de Supabase.
- Evitar prometer despacho fuera de cobertura.

### 2.10 Webhook `pedido-listo`

Se creó:

- `app/api/webhooks/pedido-listo/route.ts`

Objetivo:

- Recibir webhook desde Supabase cuando una orden cambia a `listo`.
- Validar `x-webhook-secret`.
- Procesar solo órdenes `source = "whatsapp"`.
- Evitar notificaciones duplicadas.
- Enviar aviso al cliente por WhatsApp.
- Activar el módulo `M12_ENTREGA` para registrar el evento.

### 2.11 Webhook WhatsApp modular

Se modificó:

- `app/api/webhooks/whatsapp/route.ts`

El webhook dejó de ser una respuesta aislada y pasó a usar el pipeline modular:

- Guarda mensaje entrante.
- Obtiene o crea cliente.
- Obtiene o crea conversación.
- Carga sesión de pedido.
- Evalúa guards.
- Despacha al módulo correspondiente.
- Guarda estado actualizado.
- Envía respuesta por WhatsApp.

### 2.12 Función WhatsApp multi-token

Se modificó:

- `lib/meta.ts`

`enviarWhatsAppTexto()` ahora acepta opcionalmente:

- `waToken`
- `waPhoneId`

Esto permite usar credenciales por local, manteniendo fallback global para desarrollo.

### 2.13 Ajustes en `Pizza_and_roll`

En el proyecto `/Users/ptoledos/Pizza_and_roll` se prepararon cambios para conectar pedidos WhatsApp con POS/cocina.

Cambios principales:

- `supabase/add_storefront_checkout_profiles.sql`
- `supabase/seed-bot-profile.sql`
- `src/app/router.tsx`
- `src/features/sales/pages/pos-page.tsx`
- `src/features/kitchen/pages/kitchen-display-page.tsx`
- `src/features/kitchen/hooks/use-kitchen-tickets.ts`
- `src/features/kitchen/components/ticket-card.tsx`

Objetivos:

- Aceptar `source = "whatsapp"` en órdenes.
- Aceptar `cashier_id` técnico para órdenes del bot.
- Agregar RPC `buscar_productos_activos()`.
- Mostrar pedidos WhatsApp en POS con badge.
- Agregar filtro por canal.
- Preparar vista de cocina.
- Preparar seed para perfil técnico `Bot WhatsApp`.

## 3. Correcciones y normalización realizadas con Codex

### 3.1 Corrección de build en `Poke and roll`

Se corrigieron errores que impedían compilar:

- `app/api/webhooks/pedido-listo/route.ts`
- `lib/supabase-pedidos.ts`
- `app/api/webhooks/whatsapp/route.ts`
- `lib/modulos/types.ts`

Se redujo el uso inseguro de tipos y se reemplazaron estructuras ambiguas por tipos explícitos.

### 3.2 API pública del dispatcher

Se dejó `despacharModulo()` como API pública canónica en:

- `lib/modulos/dispatcher.ts`

Se mantuvo `despachar` como alias compatible para no romper llamadas existentes.

### 3.3 Tipos compartidos ampliados

Se ajustó `MensajeDespacho` para incluir datos que ya necesitaban los webhooks:

- `telefonoCliente`
- `idMensajeMeta`

También se agregó soporte para `mixto` en `metodoPago`, cuando la RPC/enum de Supabase lo soporte.

### 3.4 WhatsApp multi-local real

El webhook WhatsApp ahora resuelve el local usando:

```text
value.metadata.phone_number_id -> Local.waPhoneId
```

Esto permite:

- Identificar qué local recibió el mensaje.
- Asociar cliente y conversación al local correcto.
- Usar token y phone number id propios del local al responder.

### 3.5 Mensaje de delivery corregido

Se corrigió la lógica de `pedido-listo`.

Antes, el sistema podía decir que un delivery iba "en camino" solo porque cocina marcó la orden como `listo`.

Ahora el mensaje indica que el pedido está listo y que el despacho se está coordinando, sin prometer salida a ruta.

### 3.6 `next.config.ts`

Se agregó `outputFileTracingRoot` para evitar que Next.js tome `/Users/ptoledos` como workspace root.

Esto reduce riesgo de trazas incorrectas y problemas de build/despliegue.

### 3.7 SQL de Supabase reconciliado

En `Pizza_and_roll` se ajustó la RPC preparada para:

- Leer `checkout.source`.
- Insertar `source` real en `orders`.
- Leer `checkout.cashier_id`.
- Insertar `cashier_id` si es UUID válido.
- Mantener soporte de pago mixto.
- Agregar `buscar_productos_activos()`.
- No usar `product_variants.is_active`, porque esa columna no existe.
- Tratar `product_variants.price` como precio absoluto.

### 3.8 Seed de perfil técnico

Se ajustó `seed-bot-profile.sql` para que sea idempotente y seguro.

También se eliminó la recomendación riesgosa de eliminar una FK en producción solo para insertar el perfil técnico.

### 3.9 Skill `director-integracion` normalizado

Se reescribió `SKILL.md` para que sea corto y operativo.

Se corrigió la contradicción de "26 agentes": el skill ahora reconoce 25 specs, numerados `00` a `24`.

Se agregó:

- `.agents/skills/director-integracion/agents/openai.yaml`

### 3.10 Referencias del skill actualizadas

Se normalizaron:

- `references/progress.md`
- `references/bloqueantes.md`
- `references/infrastructure.md`
- `references/module-flow.md`
- `references/api-contracts.md`
- `references/shared-types.md`

Correcciones principales:

- Sin secretos reales.
- Sin claves literales.
- Sin instrucciones contradictorias.
- Instagram/Facebook limitados a derivación, consultas y marketing.
- WhatsApp como canal operativo de pedidos.
- Delivery no promete "va en camino" al cambiar a `listo`.
- `cashier_id` documentado como perfil técnico.
- Variables sensibles descritas con placeholders.

### 3.11 Documentación de implementación

Se actualizó:

- `docs/implementaciones-agente.md`

Se agregó una sección de rescate con:

- Objetivo.
- Cambios realizados.
- Validaciones.
- Pendientes manuales.

## 4. Estado de validación

Se ejecutaron builds en ambos proyectos.

### Poke and roll

Comando:

```bash
npm run build
```

Resultado:

- Build OK.
- Type check OK.
- Persisten warnings no bloqueantes de lint en componentes y módulos no críticos.

### Pizza_and_roll

Comando:

```bash
npm run build
```

Resultado:

- Build OK.
- Persiste warning no bloqueante de chunk grande en Vite.

## 5. Pendientes importantes

### 5.1 Seguridad

- Rotar `SUPABASE_PEDIDOS_WEBHOOK_SECRET`.
- Actualizar el secret rotado en `.env.local`.
- Actualizar el secret rotado en Vercel.
- Actualizar el secret rotado en Supabase Database Webhook.
- Revisar variables `.env` y `.env.local` antes de deploy.
- No subir service role keys ni tokens reales a documentación.

### 5.2 Supabase/Pizza_and_roll

- Revisar y aplicar SQL en Supabase staging o producción.
- Confirmar que `WHATSAPP_BOT_CASHIER_ID` apunte a un perfil válido.
- Confirmar que la RPC `create_storefront_order` acepte el enum `mixto` si se usará pago mixto.
- Verificar que `buscar_productos_activos()` funcione con el schema real.

### 5.3 Multi-local

- Completar `Local.waPhoneId` para cada local.
- Completar `Local.waToken` o definir estrategia segura de tokens por tenant.
- Confirmar que cada número de WhatsApp rutee al local correcto.

### 5.4 Pruebas E2E

Pendientes de ejecutar con servicios reales:

- Mensaje WhatsApp `hola`.
- Pedido completo por WhatsApp.
- Creación de orden en Supabase.
- Pedido visible en POS.
- Pedido visible en cocina.
- Cambio de estado a `listo`.
- Notificación WhatsApp una sola vez.
- Revisión de fallback cuando Meta no permite enviar por ventana de 24 horas.

## 6. Riesgos conocidos

- El flujo depende de que Supabase tenga aplicado el SQL correcto.
- El webhook `pedido-listo` requiere secret rotado y configurado de forma idéntica en Supabase y Poke and roll.
- Si `Local.waPhoneId` no está configurado, el sistema no podrá identificar correctamente el local.
- Si `WHATSAPP_BOT_CASHIER_ID` no existe en Supabase, la orden puede quedar sin trazabilidad de cajero técnico.
- Si el cliente está fuera de la ventana de 24 horas de Meta, la notificación puede fallar y debe quedar registrada sin romper el webhook.

## 7. Archivos principales tocados

### Poke and roll

- `.agents/skills/director-integracion/`
- `app/api/webhooks/whatsapp/route.ts`
- `app/api/webhooks/pedido-listo/route.ts`
- `docs/implementaciones-agente.md`
- `docs/resumen-cambios-claude-codex.md`
- `lib/db-helpers.ts`
- `lib/geocodificacion.ts`
- `lib/meta.ts`
- `lib/horarios.ts`
- `lib/zonas-despacho.ts`
- `lib/supabase-pedidos.ts`
- `lib/modulos/`
- `next.config.ts`
- `package.json`
- `package-lock.json`
- `prisma/schema.prisma`

### Pizza_and_roll

- `supabase/add_storefront_checkout_profiles.sql`
- `supabase/seed-bot-profile.sql`
- `src/app/router.tsx`
- `src/features/sales/pages/pos-page.tsx`
- `src/features/kitchen/`

## 8. Criterio de cierre

El rescate queda cerrado a nivel de código local cuando:

- Ambos builds pasan.
- El skill no contiene secretos ni contradicciones críticas.
- El flujo modular compila.
- El webhook WhatsApp usa local real cuando Meta entrega `phone_number_id`.
- El webhook `pedido-listo` es idempotente.

Queda pendiente cierre operativo cuando:

- Se apliquen los SQL en Supabase.
- Se roten secrets.
- Se configuren variables en Vercel.
- Se ejecute prueba E2E completa con WhatsApp, POS y cocina.

## 9. Actualización 2026-06-11 — Orquestador WhatsApp y configuración operativa

### 9.1 Problema detectado

Las conversaciones de WhatsApp seguían fallando porque los módulos M01-M13 actuaban como cerebros independientes:

- `BIENVENIDA` podía responder solicitudes de carta sin enviar media.
- `CONSULTAS` podía perder contexto de carrito.
- `PEDIDOS` podía agregar un item y luego una consulta como "qué trae" volvía a preguntar "¿cuál?".
- Mensajes como "no", "solo eso" o "no, solo eso" podían cortar el flujo en vez de cerrar el carrito.
- Después de crear una orden, el bot podía volver a comportamiento de pedido normal.

### 9.2 Cambio arquitectónico

Se reforzó `lib/modulos/dispatcher.ts` para que funcione como orquestador determinístico antes de ejecutar handlers:

- Reclamos pasan siempre a `ATENCION`.
- Carta/promociones pasan a `CONSULTAS + media`, sin pasar por bienvenida.
- Orden creada (`externalOrderId`) bloquea pedidos normales; cambios/cancelaciones escalan.
- Carrito activo + "no / solo eso" muestra resumen y pasa a confirmación.
- Carrito activo + "qué trae / incluye / ingredientes" responde sobre el último item anotado.
- Si falta entrega, fuerza `TIPO_ENTREGA`.
- Si falta dirección para delivery, fuerza `DIRECCION`.
- Si falta pago o nombre, fuerza `FORMAS_PAGO`.
- Sin sesión activa, recién ahí usa bienvenida/consulta/pedido.

### 9.3 Ajustes relacionados

- `lib/modulos/types.ts`: se permitieron consultas informativas desde `PEDIDOS`, `ORDEN_COMPRA` y `CONFIRMACION` sin romper carrito.
- `lib/modulos/m02-consultas.ts`: se quitó el link normal junto al PDF; el link queda como fallback solo si falla media.
- `docs/matriz-regresion-whatsapp.md`: se creó una matriz de escenarios mínimos de no regresión para WhatsApp.
- `lib/configuracion-comercial.ts`: se ajustó guardado de tarifas para Prisma en modo HTTP, evitando transacciones/`createMany`.
- `app/api/configuracion-comercial/tarifas/route.ts`: ahora retorna el error real del backend cuando falla.

### 9.4 Validaciones ejecutadas

- `npm run build`: OK.
- Prueba local de `PUT /api/configuracion-comercial/tarifas`: OK con dirección `recoleta 5758, huechuraba`.
- Prueba local de upload a Supabase Storage: OK con bucket `catalogo-visual`, service role corregida y lectura pública del PDF.

### 9.5 Pendiente crítico

Convertir `docs/matriz-regresion-whatsapp.md` en pruebas automáticas reales para evitar volver a reparar conversación por conversación.

## 10. Actualización 2026-06-11 — Motor determinístico de pedidos

### 10.1 Problema detectado

El flujo seguía fallando en conversaciones con aclaraciones y modificaciones:

- "Promo de 30" abría opciones, pero "la de 30 friyas" no se convertía confiablemente en pedido.
- "Sí" después de una aclaración como "¿te refieres a la Promo 30 piezas fritas?" podía volver a bienvenida.
- Con un único item en carrito, "cambiar kanikama x pollo" preguntaba innecesariamente en qué producto aplicar el cambio.
- El LLM seguía tomando decisiones de carrito que deberían ser operaciones determinísticas.

### 10.2 Cambio implementado

Se agregó `lib/modulos/intenciones-pedido.ts` como motor determinístico de intención de pedido:

- Detecta promos comunes por texto tolerante a errores: `30 fritas`, `30 friyas`, `30 mixtas`, `30 premium`.
- Detecta afirmaciones sobre la última aclaración del agente.
- Detecta pokes/gohan comunes por proteína.
- Detecta modificaciones tipo `cambiar X por Y` o `cambiar X x Y`.
- Aplica modificaciones directamente al único item del carrito con recargo correspondiente.
- Evita duplicar items cuando el cliente vuelve a pedir el mismo producto sin decir "otra/otro".

### 10.3 Archivos modificados

- `lib/modulos/intenciones-pedido.ts`
- `lib/modulos/m04-pedidos.ts`

### 10.4 Validación

- `npm run build`: OK.

### 10.5 Pendiente

Ampliar el motor determinístico con más productos frecuentes del menú y convertir esta lógica en tests automáticos de conversación.

## 11. Actualización 2026-06-11 — Experiencia de agente único con handlers internos

### 11.1 Decisión arquitectónica

No se volvió a un agente único monolítico. Se implementó una experiencia equivalente para el cliente: un solo orquestador interpreta el estado conversacional y usa los módulos como handlers de tarea.

Objetivo:

- Evitar que `BIENVENIDA`, `CONSULTAS`, `PEDIDOS` o `CONFIRMACION` reinicien la conversación.
- Resolver "sí", "no", "esa", "a la de 30 fritas" y cambios de ingredientes contra el carrito y la última pregunta del agente.
- Mantener validación contra catálogo, media y creación de orden en los módulos existentes.

### 11.2 Cambios implementados

- `lib/modulos/dispatcher.ts`
  - Interpreta afirmaciones cortas según la última pregunta del agente.
  - Si el agente preguntó "¿cerramos el pedido?", un "sí" se convierte en cierre de carrito.
  - Si el agente preguntó "¿confirmas el pedido?", un "sí" se convierte en confirmación explícita.
  - Con carrito activo, las modificaciones y referencias al producto activo vuelven siempre a `PEDIDOS`.
  - `CONFIRMACION` queda protegida para que un "no" no se interprete como cierre del carrito.

- `lib/modulos/intenciones-pedido.ts`
  - Detecta "todas con pollo", "todos con pollo" y "todo completo con pollo".
  - Detecta modificaciones sin verbo: "el kanikama y el camarón por pollo".
  - Calcula recargos múltiples cuando hay más de un ingrediente/proteína reemplazada.
  - Evita aplicar dos veces la misma modificación al mismo item.

- `lib/modulos/m04-pedidos.ts`
  - Permite agregar un producto y aplicar una modificación en la misma frase:
    - "Quiero la promo de 30 fritas pero todas con pollo".
  - El item entra al carrito ya con nota y recargo.

### 11.3 Casos cubiertos

- "Quiero la promo de 30 fritas pero todas con pollo" → agrega promo y aplica cambio por pollo.
- "Quiero todos con pollo" con un item activo → aplica cambio al item activo.
- "El kanikama y el camarón por pollo" → cambio doble con recargo total.
- "A la de 30 fritas" después de una modificación pendiente → vuelve a `PEDIDOS`, no deriva a humano.
- "Sí" después de "¿cerramos el pedido?" → resumen y confirmación.

### 11.4 Validación

- `npm run build`: OK.
- Verificación local de detección determinística para:
  - "Quiero la promo de 30 fritas pero todas con pollo"
  - "Quiero todos con pollo"
  - "El kanikama y el camarón por pollo"
  - "cambiar kanikama x pollo"

## 12. Actualización 2026-06-11 — WhatsApp vuelve a agente único

### 12.1 Cambio estructural

WhatsApp dejó de usar `despacharModulo()` como entrada principal. Se agregó `procesarWhatsAppAgenteUnico()` para que una sola capa conversacional maneje atención, ventas, carrito, entrega, pago, reclamos y postventa.

Los módulos M01-M13 se mantienen en el código como compatibilidad y rollback, pero ya no son el cerebro del webhook WhatsApp.

### 12.2 Implementación

- `lib/whatsapp/agente-unico-atencion.ts`
  - Nuevo motor único de atención.
  - Resuelve carta/promociones con media.
  - Agrega productos contra catálogo Supabase.
  - Aplica modificaciones en la misma frase o contra el producto activo.
  - Cierra carrito con resumen.
  - Avanza a entrega, dirección, pago y creación de orden.
  - Escala reclamos y cambios sobre órdenes ya creadas.

- `app/api/webhooks/whatsapp/route.ts`
  - Cambió la llamada desde `despacharModulo()` a `procesarWhatsAppAgenteUnico()`.
  - Mantiene guardado de mensajes, media, sesión, reclamos y estado de conversación.

- `prisma/schema.prisma`
  - `SesionPedido` ahora incluye `estadoConversacional Json @default("{}")`.

- `prisma/migrations/20260611180000_add_estado_conversacional_sesion/migration.sql`
  - Agrega la columna `estado_conversacional` a `sesiones_pedido`.

- `scripts/regresion-agente-unico-whatsapp.ts`
  - Harness dry-run para validar comportamiento conversacional sin crear órdenes reales.

### 12.3 Casos que cubre

- "Me puede enviar el menú" → responde y adjunta catálogo.
- "Quiero la promo de 30 fritas pero todas con pollo" → agrega item con recargo.
- "Solo eso" → muestra resumen y pide confirmación.
- "Sí, por favor" → avanza a retiro/delivery.
- "Retiro" → pide nombre y pago.
- "Transferencia, Pablo" → crea orden.
- "El kanikama y el camarón por pollo" → aplica cambio doble al item activo.
- Orden creada + cambio/cancelación → humano.
- Reclamo → humano.

### 12.4 Validación

- `npm run build`: OK.
- `npx prisma db push`: OK. Se aplicó `estado_conversacional` porque la base existente no tenía historial de migraciones Prisma y `migrate deploy` devolvió `P3005`.
- `npx tsx scripts/regresion-agente-unico-whatsapp.ts`: OK.

## 13. Actualización 2026-06-11 — Enriquecimiento del agente único con comportamiento histórico

### 13.1 Objetivo

Traer al nuevo agente único lo mejor de `lib/agente.ts`: tono único, reglas amplias de atención, historial, consultas generales, tolerancia conversacional y fallback LLM, sin perder el control determinístico sobre carrito y orden.

### 13.2 Cambios implementados

- `lib/whatsapp/agente-unico-atencion.ts`
  - Inyecta `TONO_Y_ESTILO` y `REGLAS_COMERCIALES`.
  - Agrega prompt único "Roly" para fallback conversacional.
  - Responde consultas de horario, medios de pago, despacho, retiro y recomendaciones con contexto real.
  - Escala alergias, pedidos grandes/eventos y solicitud de humano.
  - Maneja quitar ingredientes sin costo cuando aún no hay carrito.
  - Maneja cambio de envoltura y rechaza envuelto en salmón.
  - Usa LLM solo como respaldo para atención general; no decide carrito, confirmación, pago ni creación de orden.

- `scripts/regresion-agente-unico-whatsapp.ts`
  - Se agregaron casos para alergia, pedido grande, retiro sin carrito y envoltura en salmón.

### 13.3 Validación

- `npx tsx scripts/regresion-agente-unico-whatsapp.ts`: OK.
- `npm run build`: OK.

## 14. Actualización 2026-06-11 — Entrenamiento con errores, abreviaciones y lenguaje real

### 14.1 Objetivo

Robustecer el agente único ante mensajes reales de WhatsApp: faltas de ortografía, abreviaciones, chilenismos, falta de conectores y frases incompletas.

### 14.2 Cambios implementados

- `lib/modulos/intenciones-pedido.ts`
  - Normaliza variantes como `qro`, `kiero`, `qero`, `xfa`, `prmo`, `promo30`.
  - Reconoce errores fuertes de promos: `frtaz`, `fritaas`, `friyas`, `mxtas`, `premiun`.
  - Reconoce errores de pokes/proteínas: `pke`, `poque`, `salmn`, `salman`, `cmrn`, `poyo`.
  - Reconoce ingredientes abreviados: `kani`, `kanikma`, `cibulet`, `plta`, `qeso`.
  - Detecta cambios informales: `kani y cmrn x poyo`, `toos pollo`, `full pollo`.
  - Amplía afirmaciones: `sipo`, `yapo`, `oka`, `esa misma`.

- `lib/modulos/flujo-utils.ts`
  - Amplía cierres de pedido: `eso nomas`, `era eso`, `sería eso`, `sl eso`, `nada más por ahora`.

- `lib/whatsapp/agente-unico-atencion.ts`
  - Alinea afirmaciones del agente único con las variantes anteriores.

- `scripts/regresion-agente-unico-whatsapp.ts`
  - Agrega pruebas directas del parser para errores grotescos y abreviaciones.

### 14.3 Validación

- `npx tsx scripts/regresion-agente-unico-whatsapp.ts`: OK.
- `npm run build`: OK.

## 15. Actualización 2026-06-11 — Corrección checkout modalidad/pago

### 15.1 Problema detectado

En una conversación real el agente:

- Cerró el carrito y luego asumió delivery sin preguntar retiro/despacho.
- Interpretó "no te he dicho si la quiero con retiro o despacho" como consulta de retiro.
- Después de fuera de cobertura, al aceptar retiro volvió a confirmar/agregar el producto.
- Al recibir "efectivo" respondió como consulta general de medios de pago en vez de pedir nombre.

### 15.2 Cambios implementados

- `lib/whatsapp/agente-unico-atencion.ts`
  - Frases como "no te he dicho si retiro o despacho" vuelven a `TIPO_ENTREGA`.
  - "no, la quiero con despacho" se interpreta como despacho.
  - Fuera de cobertura ofrece retiro sin escalar de inmediato y guarda aclaración pendiente.
  - "sí" a la oferta de retiro pasa directo a pedir pago/nombre.
  - En fase de confirmación, la confirmación se resuelve antes que entrega/dirección/fallback.
  - En fase de pago, "efectivo" guarda método y pregunta nombre.

- `scripts/regresion-agente-unico-whatsapp.ts`
  - Nuevos casos para corrección de modalidad, aceptación de retiro tras fuera de cobertura y pago efectivo sin nombre.

### 15.3 Validación

- `npx tsx scripts/regresion-agente-unico-whatsapp.ts`: OK.
- `npm run build`: OK.

## 16. Actualización 2026-06-11 — Prioridad de tarifas de despacho del panel

### 16.1 Problema detectado

El panel tenía dirección base y rangos por distancia configurados para el local, pero el agente respondía zonas antiguas de Supabase/POS como Santiago Centro y Providencia.

Causa: `resolverCoberturaDespacho()` y algunas consultas de despacho priorizaban `delivery_zones` de Supabase antes que la configuración visible del agente (`configuracionRestaurante` + `zonaDespacho`).

### 16.2 Cambios implementados

- `lib/zonas-despacho.ts`
  - La cobertura WhatsApp ahora prioriza rangos por distancia del panel.
  - Supabase `delivery_zones` queda como fallback si no hay rangos locales configurados.
  - Se agregaron helpers para formatear tarifas del agente.

- `lib/whatsapp/agente-unico-atencion.ts`
  - Las consultas de despacho responden con tarifas por distancia configuradas en el panel.
  - Ya no lista zonas antiguas de Supabase cuando el local tiene rangos activos.

- `scripts/regresion-agente-unico-whatsapp.ts`
  - Se agregó regresión para evitar respuestas con `Zona Centro` o `Providencia` cuando se consulta despacho.

### 16.3 Validación

- `npx tsx scripts/regresion-agente-unico-whatsapp.ts`: OK.
- `npm run build`: OK.
