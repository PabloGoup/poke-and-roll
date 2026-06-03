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

## 25. Conexion oficial de Instagram profesional con Meta OAuth

Fecha: 2026-06-03

Objetivo:

- Permitir conectar una cuenta profesional de Instagram desde la app usando el flujo oficial de Meta.
- Evitar depender solo de variables globales en `.env`.
- Guardar la integracion por local para que el webhook use el token correcto del negocio.

Cambios realizados:

- Se agrego `GET /api/meta/connect` para iniciar OAuth con Meta.
- Se agrego `GET /api/meta/callback` para recibir el `code`, intercambiarlo por token, leer paginas de Meta y detectar la cuenta profesional de Instagram conectada.
- Se guarda en `Local`:
  - `fbPageId`
  - `fbToken`
  - `igPageId`
  - `igToken`
- Se agrego `GET /api/meta/instagram/status` para mostrar el estado real de la cuenta conectada.
- Se agrego `POST /api/meta/instagram/status` para desconectar la integracion del local.
- La pantalla de Instagram ahora muestra:
  - Boton `Conectar Instagram`.
  - Estado de conexion.
  - Usuario/foto de perfil si Meta los entrega.
  - Boton de reconexion o desconexion.
- Se agregaron variables de configuracion:
  - `APP_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `META_REDIRECT_URI`
  - `META_GRAPH_VERSION`
  - `META_OAUTH_SCOPES`

Uso:

1. En Meta Developers, configurar como OAuth Redirect URI: `https://goupsoluciones.cl/api/meta/callback` para produccion o `http://localhost:3000/api/meta/callback` para pruebas locales.
2. En `.env` local, usar `APP_URL=http://localhost:3000` y `META_REDIRECT_URI=http://localhost:3000/api/meta/callback`.
3. En Vercel, usar `APP_URL=https://goupsoluciones.cl`, `NEXT_PUBLIC_APP_URL=https://goupsoluciones.cl` y `META_REDIRECT_URI=https://goupsoluciones.cl/api/meta/callback`.
4. Entrar al dashboard, ir a Instagram y presionar `Conectar Instagram`.
5. Autorizar una cuenta profesional de Instagram vinculada a una pagina de Facebook.
6. Al volver al dashboard, revisar que aparezca como conectada.

Pendiente recomendado:

- Si un negocio tiene varias paginas de Facebook con Instagram conectado, agregar una pantalla para elegir pagina antes de guardar.
- Rotar tokens sensibles si fueron compartidos en capturas o archivos fuera del entorno local.

## 18. Dominio Goup Soluciones en Vercel

Fecha: 2026-06-02

Cambios realizados:

- Se agrego `goupsoluciones.cl` al proyecto Vercel `poke-and-roll`.
- Se agrego `www.goupsoluciones.cl` al mismo proyecto.

Estado:

- Vercel acepto ambos dominios.
- La configuracion DNS aun queda pendiente en el proveedor del dominio.

Registros DNS indicados por Vercel:

```text
A     goupsoluciones.cl      76.76.21.21
A     www.goupsoluciones.cl  76.76.21.21
```

Alternativa:

- Cambiar nameservers del dominio a:

```text
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Nota:

- Vercel ejecutara la verificacion automaticamente cuando el DNS propague.

## 19. Casos de exito en landing Goup

Fecha: 2026-06-02

Cambios realizados:

- Se agrego una seccion `Casos de exito` al landing, rediseñada como muro de logos.
- Se incorporaron cinco locales reales con logos/wordmarks:
  - Sushi Poke & Roll.
  - EntreAmigos Gourmet.
  - A la Romana Pizzeria.
  - Fu-zion Restobar.
  - ChorriBurgers.
- Se creo `app/_components_goup/success-cases.tsx` como componente separado.
- Se conecto la seccion desde `app/page.tsx`, entre el hero y las features.
- Se agrego enlace `Casos` en la navegacion principal del landing.
- Se eliminaron las tarjetas grandes y el destacado individual para que todos los logos tengan la misma jerarquia visual.
- Se usan imagenes reales desde `public/casos-exito` y `public/images/Poke_n_Roll.png`.
- Se ajusto visibilidad de logos: mayor tamaño, más brillo/opacidad y menor espacio vertical para que sean legibles sobre fondo oscuro.
- Se agregaron animaciones GSAP con `ScrollTrigger` para entrada de texto y logos.
- Se agregaron estilos responsive en `app/globals.css`.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes.
- `npm run build`: OK. Aparecen warnings de Edge Runtime en `jose/next-auth` y warnings lint preexistentes.
- `GET /`: OK, devuelve HTML 200 y contiene los cuatro casos.
- `npm run build`: OK con los mismos warnings preexistentes.
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

## 14. Catalogo fallback real desde piezas visuales

Fecha: 2026-06-02

Cambios realizados:

- Se reemplazo el catalogo fallback generico de `lib/catalogo.ts` por productos reales del catalogo visual.
- Se agregaron categorias: sushi premium, rolls tradicionales, futomaki, california, avocado, rolls calientes, aperitivos, hand roll, sushi sin arroz, sushiburger, poke bowl y extras.
- Se agregaron promociones reales: combos premium, promociones rolls 1, promociones rolls 2 y promociones de pokes.
- Cuando el cliente pide menu, carta, catalogo, precios o productos, el fallback devuelve el catalogo completo disponible en vez de limitarse a 8 resultados relevantes.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes en componentes no relacionados.
- `npm run build`: OK.

## 15. Catalogo visual solo en solicitudes explicitas

Fecha: 2026-06-02

Cambios realizados:

- Se separo la deteccion de solicitud de catalogo visual de la deteccion general de venta.
- El agente ya no adjunta PDF/imagen cuando el cliente pide una recomendacion especifica, por ejemplo `recomiendame rolls en palta`.
- El catalogo visual/PDF se adjunta solo cuando el cliente pide explicitamente menu, carta, catalogo, promociones, precios o vista general de opciones.
- Se cambio el texto interno `como primera opcion` por una frase mas natural para cliente: `Te adjunto el catalogo completo en PDF`.
- Se limpio texto duplicado como `te lo enviare enseguida` cuando el catalogo ya fue adjuntado.

Validacion:

- Caso `recomiendame rolls en palta`: `catalogoVisual=null`, respuesta con opciones concretas.
- Caso `mandame el catalogo completo`: adjunta `menú2026.pdf`.

## 16. Bateria interna de pruebas del agente

Fecha: 2026-06-02

Casos probados:

- Recomendaciones: rolls en palta, spicy, vegetariano, sushi para 10 personas.
- Productos especificos: Poke de Salmon, Hand Roll Ebi, aperitivos, sushi sin arroz, Sushi Burger Salmon, Sake Roll.
- Promociones: promociones vigentes, 30 piezas mixtas, combos para 4 personas.
- Operacion: horario, delivery, retiro en local, medios de pago.
- Seguridad: alergia a palta, quitar ingrediente, reclamo por atraso, cancelacion.
- Productos no disponibles: ramen.

Ajustes realizados:

- `recomiendame rolls en palta` ya no adjunta PDF y responde con opciones concretas.
- `cuanto cuesta el sake roll` ya no adjunta PDF y entrega variantes con precios.
- `que tienen con spicy` ya no adjunta PDF y recomienda Ebi Spicy.
- `tienen sushi sin arroz` ya no se interpreta como quitar ingrediente.
- `puedo retirar en local` ya no se interpreta como quitar producto y no escala a humano.
- Consultas con alergia ahora escalan a humano por seguridad alimentaria.
- Solicitudes de catalogo completo tienen respuesta controlada: adjunta PDF y pregunta si desea ayuda para elegir.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes.
- `npm run build`: OK.
- Pruebas por `POST /api/agente/procesar-mensaje`: OK en casos corregidos.

## 20. Rediseño completo del landing Goup Soluciones

Fecha: 2026-06-03

Archivos principales:

- `app/_components_goup/success-cases.tsx`
- `app/_components_goup/landing-hero.tsx`
- `app/_components_goup/landing-features.tsx`
- `app/_components_goup/landing-pricing.tsx` (creado, actualmente oculto)
- `app/page.tsx`
- `app/globals.css`

Cambios realizados:

- **Success cases rediseñado**: se pasó de un muro de logos planos a un grid de cards con métricas por local. Cada card tiene: área hero con logo a tamaño real (altura fija 152px), métrica destacada en naranja (+42%, 3×, -65%, 0, +38%), resultado en 2 líneas y nombre del local como footer.
- **Logos reales en channel pills del hero**: se reemplazó el ícono genérico `Sparkles` por logos oficiales de WhatsApp, Instagram y Facebook vía simpleicons CDN. Cada pill tiene su color de borde y fondo de canal.
- **Sección de integraciones rediseñada**: se eliminó el sistema de órbitas 3D CSS (ilegible en producción) y se reemplazó por un layout 2 columnas con hub de integraciones. La columna izquierda es el copy con bullets, la derecha es una card con 3 grupos claramente diferenciados: Canales Meta, Modelos IA y Stack técnico. Cada logo tiene 28px con nombre siempre visible.
- **Sección Pricing creada**: 3 planes (Starter $49/mes, Pro $149/mes destacado, Enterprise a consultar) con CTA banner inferior. Actualmente ocultada en `page.tsx` porque la app no está activa con Meta para todos los locales todavía.
- **Responsive móvil**: success cases usa scroll horizontal snap en móvil (flex row, overflow-x auto). Feature cards pasan a 2 columnas compactas en móvil sin min-height excesivo.

Para activar pricing cuando esté listo:
- Descomentar import y componente en `app/page.tsx`.
- Agregar enlace `Precios` al nav en `landing-hero.tsx`.

## 21. Páginas legales alineadas con políticas de Meta

Fecha: 2026-06-03

Archivos:

- `app/privacidad/page.tsx`
- `app/eliminacion-datos/page.tsx`
- `app/globals.css` (clases `goup-legal-*`)

Cambios realizados:

- Ambas páginas rediseñadas con el tema oscuro cosmos de Goup (mismo fondo que el landing).
- **Política de privacidad**: 11 secciones completas con acentos. Incluye: rol de Goup como encargado del tratamiento (no responsable — los negocios son responsables), uso de Plataforma Meta, procesamiento con modelos de IA de terceros (Gemini, Claude, OpenAI), derechos bajo Ley 19.628 y RGPD, datos de menores, contacto a `privacidad@goup.cl`.
- **Eliminación de datos**: cumple el requisito de Meta de tener una URL de instrucciones de eliminación (`https://goupsoluciones.cl/eliminacion-datos`). Incluye: flujo de 3 pasos visuales con íconos (envío → revisión 72h → eliminación 30 días), qué datos se eliminan, datos retenidos transitoriamente, instrucciones específicas para revocar acceso desde configuración de Facebook.
- Nuevo sistema de clases CSS `goup-legal-*`: shell, card, back, kicker, content, section, link, alert. Deletion steps con ícono y descripción.
- Ambas páginas enlazan entre sí y tienen metadata SEO correcta apuntando a Goup Soluciones.

Nota importante para Meta App Review:
- La URL de política de privacidad configurada en la app de Meta debe ser `https://goupsoluciones.cl/privacidad`.
- La URL de eliminación de datos debe ser `https://goupsoluciones.cl/eliminacion-datos`.

## 22. Arquitectura multi-tenant: modelo Local y routing de webhooks

Fecha: 2026-06-03

Archivos:

- `prisma/schema.prisma`
- `app/api/webhooks/instagram/route.ts`
- `lib/meta.ts`
- `lib/agente.ts`
- `lib/db-helpers.ts`

Cambios realizados:

- **Modelo `Local`**: representa cada negocio cliente de Goup. Campos: `nombre`, `slug`, `igPageId`, `fbPageId`, `waPhoneId`, `igToken`, `fbToken`, `waToken`. Tokens por canal guardados en DB, no en `.env`.
- **Enum `RolUsuario`**: `super_admin`, `admin_local`, `operador`.
- **Relaciones**: `Cliente` y `Conversacion` tienen `localId` opcional (retrocompatible).
- **Webhook Instagram multi-tenant**: el handler ahora busca el local por `payload.entry[0].id` (Instagram Page ID) → carga el token de ese local → genera respuesta con el agente de ese local. Fallback al `META_ACCESS_TOKEN` del `.env` si no hay local en DB (compatibilidad Poke & Roll existente).
- **`enviarInstagramTextoConToken`**: nueva función que acepta token explícito por local.
- **`MensajeEntrante`**: campo `localId` agregado (opcional) para que el agente pueda en el futuro cargar configuración específica del local.
- **Seed inicial**: Poke & Roll registrado en tabla `locales` con `igPageId=17841407392641200`.

Para agregar un segundo local:
```ts
await prisma.local.create({
  data: {
    nombre: "EntreAmigos Gourmet",
    slug: "entreamigos",
    igPageId: "<page_id_de_meta>",
    igToken: "<access_token>",
  }
});
```

El webhook rutea automáticamente por `igPageId` sin cambios en la URL.

## 23. Sistema de usuarios y autenticación multi-tenant

Fecha: 2026-06-03

Archivos:

- `prisma/schema.prisma` (modelo `Usuario`)
- `auth.ts`
- `middleware.ts`
- `types/next-auth.d.ts`
- `scripts/seed-usuarios.ts`

Cambios realizados:

- **Modelo `Usuario`**: email único, `passwordHash` (bcrypt), `nombre`, `rol` (super_admin / admin_local / operador), `localId` nullable. Un `super_admin` no tiene local; un `admin_local` está vinculado a un `Local` específico.
- **`auth.ts` reescrito**: credenciales verificadas contra DB con `bcryptjs.compare`. La sesión JWT incluye `rol`, `localId`, `localSlug` y `localNombre`.
- **Tipos NextAuth extendidos** en `types/next-auth.d.ts`: session.user incluye `id`, `rol`, `localId`, `localSlug`, `localNombre`.
- **Middleware actualizado**: protege `/dashboard` y `/admin`. Redirige `super_admin` a `/admin`, `admin_local` a `/dashboard`. Bloquea acceso a `/admin` para usuarios sin rol `super_admin`. Si ya está logueado e intenta entrar al login, redirige a su plataforma.
- **Script seed**: `scripts/seed-usuarios.ts` crea usuarios con bcrypt. Ejecutar con `npx tsx scripts/seed-usuarios.ts`.
- **bcryptjs** instalado como dependencia de producción.

Usuarios iniciales en producción:

| Email | Rol | Local |
|---|---|---|
| admin@goup.cl | super_admin | Todos |
| admin@pokeyroll.cl | admin_local | Sushi Poke & Roll |

**Importante**: cambiar contraseñas antes de ir a producción editando `scripts/seed-usuarios.ts` y volviendo a ejecutar.

## 24. Webhook Instagram activo en producción

Fecha: 2026-06-03

Configuración aplicada:

- **URL de devolución**: `https://goupsoluciones.cl/api/webhooks/instagram`
- **Verify token**: `poke-roll-webhook`
- `META_VERIFY_TOKEN` actualizado en Vercel (el valor anterior era diferente y causaba 403).
- Fix en `getVerifyToken()`: se cambió `??` por `||` para cubrir el caso de string vacío en Vercel.

Estado:
- Verificación del webhook: OK (devuelve challenge correctamente).
- Cuentas conectadas en Meta: `pizza_and_roll` (ID 17841407392641200) y `goup_app` (ID 17841474753785429).
- La cuenta `pizza_and_roll` corresponde a Poke & Roll (el nombre en Meta fue creado como pizza_and_roll).
- Pendiente: suscribir campo `messages` en Meta Developer Console para empezar a recibir mensajes.
- Pendiente: completar revisión de app en Meta (paso 5) para usar la API en producción con cuentas reales.

## 17. Laboratorio con conversacion simulada

Fecha: 2026-06-02

Problema detectado:

- El laboratorio del agente simulaba solo un mensaje aislado.
- Al enviar una prueba, el texto se limpiaba y la respuesta anterior quedaba reemplazada, por lo que no era posible probar una conversacion fluida.

Cambios realizados:

- Se agrego `MensajeLaboratorio` en `app/types.ts` para representar mensajes de cliente y agente dentro del laboratorio.
- `app/dashboard-client.tsx` ahora mantiene `historialLab` con los mensajes enviados y respuestas generadas.
- El formulario limpia el textarea despues de enviar, pero conserva el mensaje en el hilo visible.
- `app/components/agent-lab.tsx` muestra una conversacion simulada tipo chat, con mensajes de cliente, respuestas del agente, adjuntos visuales y estado de seguridad de la ultima decision.
- Se agrego un boton para limpiar la conversacion simulada sin afectar configuracion ni catalogo.
- `lib/agente.ts` acepta `historial` opcional y lo incorpora al prompt para que la siguiente respuesta tenga contexto reciente.

Validacion:

- `npm run lint`: OK con 8 warnings preexistentes en componentes no relacionados.
