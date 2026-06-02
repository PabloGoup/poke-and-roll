# Implementaciones del agente omnicanal

Ultima actualizacion: 2026-06-01 17:07:06 -04

Este documento registra mejoras implementadas, decisiones tecnicas y pendientes relevantes para no perder contexto entre iteraciones.

## 1. Separacion de fuentes de datos

Se definio que el agente usa dos fuentes distintas:

- Prisma / Neon Postgres: datos propios del agente, conversaciones, mensajes, decisiones, reclamos, alertas y auditoria.
- Supabase ventas / POS: catalogo real de venta, productos, variantes, modificadores, promociones, zonas de despacho y configuracion operativa.

Decision importante:

- No se deben consultar tablas POS desde Prisma, porque esas tablas viven en Supabase.
- Prisma queda como persistencia operacional del agente.
- Supabase ventas queda como fuente de verdad para catalogo y datos comerciales.

Variables agregadas:

```env
SUPABASE_VENTAS_URL=""
SUPABASE_VENTAS_SERVICE_ROLE_KEY=""
```

## 2. Integracion de catalogo real con Supabase ventas

Archivo principal:

- `lib/catalogo.ts`

Implementacion actual:

- Usa REST API de Supabase con `fetch`, sin agregar dependencia nueva.
- Lee productos activos desde `products`.
- Lee categorias desde `product_categories`.
- Lee variantes desde `product_variants`.
- Lee modificadores desde `product_modifier_groups` y `product_modifiers`.
- Lee promociones activas desde `promotions`.
- Lee zonas activas desde `delivery_zones`.
- Lee configuracion desde `store_settings`.
- Si Supabase no responde o no hay datos, cae al catalogo simplificado del agente y luego a fallback local.

Notas de interpretacion:

- `promotions.value` no siempre es precio. En el caso probado, `Promo almuerzo` usa `value = 10` como 10% de descuento.
- Por eso las promociones solo se serializan como precio final si el tipo indica precio fijo (`precio_fijo` o `fixed_price`).
- Las promociones de tipo horario/descuento se describen como condicion o descuento, no como precio final.

## 3. Mejoras de respuesta IA

Archivo principal:

- `lib/agente.ts`

Cambios realizados:

- El agente ahora obtiene `ContextoNegocio` antes de responder.
- El prompt recibe catalogo real serializado.
- La regla de seguridad cambio: puede mencionar precios, promociones, horarios o despacho solo si vienen del catalogo.
- Si no existe un combo/producto exacto, no debe inventarlo.
- Para ventas, recomienda 1 a 3 alternativas concretas y hace pregunta de cierre.
- Para reclamos, mantiene escalamiento humano.

Pruebas realizadas:

```text
Cuanto vale el combo para 4 personas con bebidas?
```

Respuesta esperada actual:

```text
No veo un combo cerrado con ese nombre en catalogo, asi que te paso alternativas disponibles. Para 4 personas, te recomiendo 2 Pokes a Eleccion a $12.990 o 3 Pokes a Eleccion a $18.990 o 5 Pokes a Eleccion a $29.990. ¿Lo quieres para delivery o retiro?
```

```text
Tienen sushi burger de pollo? cuanto sale?
```

Respuesta validada:

```text
Te recomiendo Sushi Burger Pollo a $6.490 ...
```

## 4. Mejoras visuales recientes

Archivos principales:

- `app/components/app-shell.tsx`
- `app/dashboard-client.tsx`
- `app/globals.css`

Cambios:

- Header/topbar mas imponente.
- Logo del header sin fondo, caja ni borde.
- Hero del dashboard simplificado con logo central y nombre del local.
- Logo central sin caja, fondo ni borde.
- Titulo del hero reducido para mejor proporcion.
- Fondo del hero limpiado para evitar textura pixelada.

## 5. Verificacion

Comandos ejecutados:

```bash
npm run lint
npm run build
```

Estado:

- Build OK.
- Lint OK sin errores.
- Persisten 8 warnings preexistentes en:
  - `app/components/chat-view.tsx`
  - `app/components/content-calendar.tsx`
  - `app/components/integration-status.tsx`

## 6. Pendientes recomendados

- Crear endpoint interno `/api/catalogo/ventas` para inspeccionar productos/promos que ve el agente.
- Agregar indicador en UI de laboratorio: fuente de catalogo (`supabase_ventas`, `prisma_agente`, `fallback`).
- Mejorar ranking comercial por cantidad de personas, presupuesto, categoria y disponibilidad.
- Definir reglas especificas para promociones del POS segun `type` y `rules`.
- Revisar warnings de lint preexistentes.
- Evaluar cache corta para catalogo Supabase, por ejemplo 30 a 60 segundos, para reducir latencia.
- Crear tests unitarios para:
  - interpretacion de promociones.
  - ranking de productos.
  - fallback cuando Supabase no responde.

## 7. Panel de configuracion comercial

Fecha: 2026-06-01

Archivos:

- `app/components/commercial-config.tsx`
- `app/dashboard-client.tsx`
- `app/globals.css`

Se agrego una nueva seccion dentro de **Config**: `Menu, promociones y catalogo visual`.

Objetivo:

- Dar control operativo sobre como el agente responde consultas comerciales.
- Separar reglas comerciales del laboratorio de pruebas.
- Preparar el flujo para que el agente pueda enviar una imagen de catalogo como primera opcion cuando el cliente pregunte por menu, promociones o precios.

Funciones visibles agregadas:

- Acciones del agente:
  - Enviar catalogo visual primero.
  - Promocion del dia.
  - Roll del dia.
  - Combos por cantidad de personas.
  - Sugerir extras.
  - Menu del dia.
  - Alergias y sin palta.
  - Respuesta breve vendedora.
- Catalogo visual:
  - Subida local de imagenes.
  - Marcado de imagen prioritaria para responder primero.
  - Clasificacion de imagen: catalogo completo, promocion, roll del dia, menu del dia.
- Edicion rapida:
  - Agregar item de menu o promocion destacada.
  - Definir precio/descuento y detalle para la IA.
  - Activar/desactivar items.

Estado actual:

- La UI carga y guarda reglas comerciales en Prisma.
- La UI carga y guarda items destacados en Prisma.
- Se crearon endpoints para configuracion y subida de imagenes.
- El agente lee la configuracion comercial y puede adjuntar catalogo visual prioritario a la decision.
- La subida a Supabase Storage esta implementada.
- Si Supabase Storage falla por bucket/permisos, el endpoint guarda la imagen localmente en `public/uploads/catalogo-visual` y registra la URL en Prisma.

Siguiente paso tecnico recomendado:

- Crear/verificar bucket `catalogo-visual` en Supabase Storage para produccion.
- Usar una service role key real o configurar politicas de Storage que permitan escritura desde el backend.
- Reemplazar fallback local por Storage remoto antes de despliegue productivo si se requiere persistencia multi-entorno.
- Conectar envio real de media en WhatsApp/Instagram cuando `catalogoVisual` venga en la decision.

## 8. Persistencia de configuracion comercial

Fecha: 2026-06-01

Modelos Prisma agregados:

- `ReglaComercialAgente`
- `ItemComercialDestacado`
- `CatalogoVisualAgente`

Enums agregados:

- `PrioridadComercial`
- `CanalComercial`
- `TipoItemComercial`
- `TipoCatalogoVisual`

Endpoints agregados:

- `GET /api/configuracion-comercial`
- `PUT /api/configuracion-comercial`
- `POST /api/configuracion-comercial/imagenes`

Validaciones realizadas:

- `npx prisma db push`: OK, tablas sincronizadas en Neon.
- `GET /api/configuracion-comercial`: OK, devuelve reglas default.
- `PUT /api/configuracion-comercial`: OK, guarda reglas e items.
- `POST /api/configuracion-comercial/imagenes`: OK con fallback local. Supabase Storage sigue fallando si el bucket `catalogo-visual` no existe o la key no tiene permisos para crearlo/subir.

Nota importante:

- La variable `SUPABASE_VENTAS_SERVICE_ROLE_KEY` debe contener una key con permisos suficientes para Storage. Si se usa una publishable/anon key, normalmente no podra crear bucket ni subir archivos sin politicas explicitas.
- Mientras Storage no este listo, las imagenes se guardan localmente bajo `public/uploads/catalogo-visual`.

## 9. Skill de atencion y ventas

Fecha: 2026-06-01

Se creo una skill local del proyecto para guiar trabajo futuro sobre el agente de atencion al cliente y ventas:

- `.agents/skills/sushi-poke-roll-customer-agent/SKILL.md`
- `.agents/skills/sushi-poke-roll-customer-agent/references/operational-playbook.md`
- `.agents/skills/sushi-poke-roll-customer-agent/agents/openai.yaml`

Objetivo:

- Estandarizar como Codex debe mejorar, revisar, probar u operar el agente omnicanal.
- Mantener reglas de atencion, ventas, toma de pedidos, catalogo visual, extras, despacho, estimaciones y escalamiento humano.
- Evitar respuestas inventadas o no respaldadas por Supabase/Prisma.

Disparadores esperados:

- Mejorar respuestas del agente.
- Revisar prompts o reglas comerciales.
- Probar atencion WhatsApp/Instagram/Facebook.
- Diseñar flujos de pedido, reclamo, delivery o retiro.
- Ajustar uso de catalogo visual.

Validacion:

- Estructura creada con `skill-creator`.
- Revision manual OK.
- `quick_validate.py` no pudo ejecutarse porque falta `PyYAML` en el entorno local.

## 10. Ajuste de tono y visibilidad del catalogo visual

Fecha: 2026-06-02

Cambios realizados:

- Se ajusto el prompt runtime del agente para usar tono profesional, cercano y respetuoso.
- Se bloquearon modismos y muletillas demasiado informales como `pucha`, `cachai`, `bacan`, `te tinca`, `pa'`, `altiro`, `compa`, `amigo` y `amiga`.
- Se agrego sanitizacion defensiva de respuesta para limpiar esos terminos si el modelo los genera de todas formas.
- El agente ya no debe decir que puede enviar catalogo visual si no existe una imagen prioritaria configurada.
- Se actualizo la skill local `sushi-poke-roll-customer-agent` para que futuras mejoras mantengan el mismo tono profesional.
- En el laboratorio del agente se agrego un acceso directo a configuracion de catalogo visual.
- En configuracion comercial, el estado vacio del catalogo ahora muestra explicitamente que no hay imagenes cargadas y ofrece un boton visible para subir catalogo visual.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes en componentes no relacionados.
- `npm run build`: OK.

Pendiente:

- Subir una imagen real desde `Config > Menu, promociones y catalogo visual`.
- Definir una imagen como prioritaria para que el agente la adjunte como primera opcion cuando el cliente pregunte por menu, carta, promociones o precios.

## 11. Catalogo completo en PDF y regla de quitar productos

Fecha: 2026-06-02

Cambios realizados:

- Se agrego soporte para usar un PDF de `docs/` como catalogo completo.
- Se creo `GET /api/catalogo/pdf`, que sirve el primer PDF encontrado en `docs/`, priorizando nombres relacionados con menu/catalogo.
- El catalogo PDF local se agrega automaticamente como primera opcion cuando existe, usando URL interna `/api/catalogo/pdf`.
- La UI de configuracion y laboratorio ahora puede mostrar PDF como archivo clickeable en vez de intentar renderizarlo como imagen.
- La subida de catalogo visual ahora acepta `image/png`, `image/jpeg`, `image/webp` y `application/pdf`.
- Se agrego regla de negocio: quitar/sacar/omitir ingredientes o productos del armado no tiene costo adicional.
- El agente no debe escalar a humano solo porque el cliente quiere sacar palta u otro ingrediente.
- La modificacion debe quedar detallada como observacion de la orden para cocina.

Validacion:

- `GET /api/catalogo/pdf`: OK, devuelve `menú2026.pdf` como PDF.
- Caso probado: `quiero ver el menú completo para ver si a algún roll le puedo sacar la palta`.
- Resultado esperado validado: `requiereHumano=false`, `decisionSeguridad=aprobado`, catalogo `menú2026.pdf`, respuesta indica sin costo y observacion de orden.

## 12. Landing SaaS interactivo con GSAP

Fecha: 2026-06-02

Cambios realizados:

- Se rediseño el landing de `/` con estilo visual inspirado en la referencia `merlin.jpg`.
- Se instalo `gsap` para animaciones client-side.
- Se agrego hero SaaS con fondo fotografico remoto, nav, CTA, metricas de prueba y panel visual de consola IA.
- Se agregaron animaciones GSAP:
  - Entrada escalonada del hero.
  - Entrada de mensajes simulados.
  - Orbita decorativa continua.
  - Movimiento sutil del panel con mouse.
  - Aparicion de secciones al hacer scroll con `ScrollTrigger`.
- Se reemplazo la seccion de funciones por bloques informativos de producto, flujo operativo y control comercial.
- Se definio metadata especifica del landing: `Goup Soluciones — Agentes IA para negocios`.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes en componentes no relacionados.
- `npm run build`: OK.
- `GET /`: OK, devuelve HTML 200 con el nuevo landing.

## 13. Ecosistema tecnologico orbital en landing

Fecha: 2026-06-02

Cambios realizados:

- Se reemplazo la franja de logos por un sistema orbital dentro del hero.
- El logo de Goup queda como nucleo central y las herramientas orbitan alrededor como un sistema solar.
- Se incorporaron iconos de marca para Vercel, Prisma, Supabase, Meta, Instagram, Facebook, WhatsApp, GitHub, Gemini, Anthropic y OpenAI.
- Se agregaron animaciones GSAP para entrada de planetas, rotacion continua de orbitas y pulso sutil del nucleo Goup.
- Se elimino el borde, titulo y fondo tipo card del sistema orbital para integrarlo visualmente al fondo del hero.
- Se ubico el sistema orbital debajo de las metricas `3 canales`, `24/7` y `Auditable`.
- La consola IA queda como visual de producto independiente en la columna derecha.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes en componentes no relacionados.
- `npm run build`: OK.
- `GET /`: OK, devuelve HTML 200 con el nuevo bloque de stack tecnologico.
- Revision visual en Safari: OK, el sistema orbital queda debajo de las metricas, sin borde, sin titulo visible y sin aspecto de tarjeta.
