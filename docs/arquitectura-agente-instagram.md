# Arquitectura del agente automatico omnicanal

## Objetivo

Construir un sistema automatico para Sushi Poke and Roll que atienda mensajes de WhatsApp e Instagram, apoye ventas, gestione reclamos simples y publique contenido diario en Instagram mediante publicaciones, historias y carruseles usando integraciones oficiales.

WhatsApp Business sera el primer canal operativo porque concentra el mayor flujo de atencion. Instagram queda desde el inicio como segundo canal de mensajeria y como canal principal de contenido.

## Alcance realista

El sistema puede automatizar:

- Respuestas a mensajes recibidos por WhatsApp Business.
- Respuestas a mensajes directos recibidos por Instagram.
- Deteccion de intencion: consulta, compra, reclamo, horario, menu, despacho, retiro o pago.
- Recomendaciones comerciales basadas en menu, promociones y contexto.
- Creacion de copies, captions, historias y carruseles.
- Programacion y publicacion de contenido mediante la API oficial cuando la cuenta y la app tengan permisos.
- Registro de conversaciones, clientes, pedidos potenciales, reclamos y publicaciones.
- Escalamiento a humano cuando el caso sea riesgoso o incompleto.
- Alertas internas por WhatsApp cuando exista un problema, reclamo o conversacion que requiera atencion humana.

El sistema no debe:

- Usar usuario y contrasena de Instagram para operar como bot.
- Simular clicks en Instagram Web.
- Prometer tiempos de entrega, descuentos o stock sin fuente confirmada.
- Publicar contenido sin reglas de seguridad, calendario y aprobaciones configurables.
- Automatizar WhatsApp Web con navegador o QR como base productiva. Para WhatsApp se debe usar WhatsApp Business Platform/API oficial.

## Requisitos de Meta/WhatsApp Business

Para operar WhatsApp de forma oficial se necesita:

- Cuenta de Meta Business.
- WhatsApp Business Account.
- Numero telefonico conectado a WhatsApp Business Platform.
- App en Meta for Developers.
- Webhooks configurados para mensajes de WhatsApp.
- Token de acceso seguro.
- `PHONE_NUMBER_ID` del numero de WhatsApp.
- Plantillas aprobadas para iniciar conversaciones fuera de la ventana permitida por Meta.
- Endpoint publico HTTPS para recibir webhooks.

## Requisitos de Meta/Instagram

Para operar de forma oficial se necesita:

- Cuenta de Instagram profesional o business.
- Pagina de Facebook vinculada cuando el flujo de Meta lo requiera.
- App en Meta for Developers.
- Webhooks configurados para mensajes/eventos soportados.
- Permisos de mensajeria y publicacion revisados/aprobados por Meta segun el caso.
- Token de acceso long-lived guardado de forma segura.
- Endpoint publico HTTPS para recibir webhooks.

Nota: la disponibilidad exacta de permisos y endpoints puede cambiar. Antes de implementar produccion hay que validar en la documentacion oficial de Meta el flujo vigente de Instagram Messaging API, Instagram Graph API y Content Publishing API.

## Canales de atencion

### WhatsApp

Canal principal desde la primera version. Debe implementarse con WhatsApp Business Platform/API oficial y reutilizar el mismo orquestador de agentes, clientes, conversaciones, reclamos y reglas de seguridad.

Usos iniciales:

- Recibir mensajes de clientes por WhatsApp.
- Responder automaticamente consultas frecuentes.
- Recomendar productos, combos y promociones.
- Tomar datos basicos para pedidos.
- Escalar reclamos a un numero de atencion humano.
- Enviar alertas internas cuando Instagram o WhatsApp detecten problemas.

### Instagram

Canal activo desde la primera version para contenido y segunda prioridad para mensajes. Recibe mensajes por webhooks de Meta, responde por API oficial y publica contenido cuando la app tenga permisos aprobados.

Usos iniciales:

- Responder DMs de Instagram.
- Crear y programar publicaciones, historias y carruseles.
- Detectar oportunidades de venta desde mensajes.
- Enviar alertas internas por WhatsApp cuando un DM requiera humano.

### Unificacion de clientes

El sistema debe intentar unificar historial del cliente entre WhatsApp e Instagram cuando exista telefono, nombre, pedido o identificador confiable. Si no hay evidencia suficiente, debe mantener clientes separados para evitar mezclar conversaciones.

### n8n

n8n se usara como capa auxiliar de automatizaciones e integraciones, no como cerebro principal del agente.

Casos recomendados:

- Enviar alerta al WhatsApp de atencion cuando haya reclamo, cliente molesto, error de publicacion o conversacion marcada como `requiere_humano`.
- Reenviar un resumen de la conversacion al equipo.
- Enviar resumen diario de reclamos, ventas potenciales y mensajes sin responder.
- Conectar herramientas externas como Google Sheets, correo, Slack o paneles simples.

El cerebro principal queda en la app propia para mantener control de reglas, datos, auditoria, seguridad y permisos.

## Modulos principales

### 1. Ingesta de WhatsApp

Responsable de recibir webhooks de WhatsApp Business Platform.

Endpoints:

- `GET /api/webhooks/whatsapp`: verificacion del webhook.
- `POST /api/webhooks/whatsapp`: recepcion de mensajes y estados de entrega.

Funciones:

- Validar firma del webhook.
- Normalizar payload de WhatsApp.
- Guardar evento crudo y evento normalizado.
- Evitar duplicados por `id_mensaje_whatsapp`.
- Encolar procesamiento asincrono.
- Responder por WhatsApp Business API si la respuesta queda aprobada por seguridad.

### 2. Ingesta de Instagram

Responsable de recibir webhooks de Instagram/Meta.

Endpoints:

- `GET /api/webhooks/instagram`: verificacion del webhook.
- `POST /api/webhooks/instagram`: recepcion de mensajes, postbacks, menciones y eventos soportados.

Funciones:

- Validar firma del webhook.
- Normalizar payload de Meta.
- Guardar evento crudo y evento normalizado.
- Evitar duplicados por `id_evento_meta`.
- Encolar procesamiento asincrono.

### 3. Orquestador de agentes

Responsable de decidir que agente interno responde.

Flujo:

1. Recibe mensaje normalizado.
2. Busca historial de conversacion.
3. Consulta datos del negocio: menu, horarios, zonas, promociones, medios de pago.
4. Clasifica intencion.
5. Ejecuta agente especializado.
6. Pasa respuesta por Agente Seguridad.
7. Responde por el canal original, WhatsApp o Instagram, usando API oficial o escala a humano.

### 4. Agente Atencion al Cliente

Casos:

- Menu y precios.
- Horarios.
- Direccion/retiro.
- Zonas de despacho.
- Medios de pago.
- Estado general de pedidos si existe integracion.

Regla: si falta informacion confirmada, debe decir que lo revisara o escalar, no inventar.

### 5. Agente Ventas

Casos:

- Recomendar rolls, bowls, promos y combos.
- Aumentar ticket con extras, bebidas o agregados.
- Guiar al cliente a confirmar pedido.
- Entregar llamada a la accion clara.

Ejemplo de respuesta:

> Si quieres algo para 2 personas, te recomiendo un combo mixto con rolls frios y calientes. Tambien puedes agregar gyosas o bebida. Te puedo ayudar a armarlo segun presupuesto.

### 6. Agente Reclamos

Casos:

- Atraso de pedido.
- Producto equivocado.
- Mala experiencia.
- Falta de item.

Datos minimos:

- Nombre.
- Telefono o identificador de pedido.
- Canal de compra.
- Problema.

Regla: empatizar, pedir datos y escalar a humano. No prometer devoluciones ni compensaciones sin politica configurada.

### 7. Agente Contenido

Responsable de generar y programar contenido diario.

Funciones:

- Calendario semanal.
- Historias diarias.
- Publicaciones de productos.
- Carruseles de venta.
- Copies con CTA.
- Promociones por dia.
- Versiones para aprobacion humana opcional.

Flujo recomendado:

1. Generar plan de contenido semanal.
2. Crear piezas del dia.
3. Validar contra reglas de marca, promociones vigentes y disponibilidad.
4. Guardar como borrador o publicar automaticamente si esta autorizado.
5. Registrar URL/id de publicacion.

### 8. Agente Seguridad

Debe revisar todas las respuestas y contenidos antes de enviarlos/publicarlos.

Bloquea o escala cuando:

- Hay informacion no confirmada.
- Cliente esta muy molesto.
- Hay insultos o amenaza legal.
- Se solicita dato personal sensible innecesario.
- Se promete precio, stock o tiempo no registrado.
- Se intenta publicar promocion vencida.

## Base de datos propuesta

Usar Neon Postgres como base de datos principal y Prisma como ORM/migrador. Mantener nombres de tablas, campos y conceptos de negocio en espanol.

Variable de conexion principal:

- `DATABASE_URL`

### `clientes`

- `id`
- `instagram_id`
- `whatsapp_id`
- `nombre`
- `telefono`
- `etiquetas`
- `creado_en`
- `actualizado_en`

### `conversaciones`

- `id`
- `cliente_id`
- `canal` (`instagram` o `whatsapp`)
- `instagram_thread_id`
- `whatsapp_thread_id`
- `estado`
- `ultima_intencion`
- `requiere_humano`
- `creado_en`
- `actualizado_en`

### `mensajes`

- `id`
- `conversacion_id`
- `canal`
- `direccion` (`entrante` o `saliente`)
- `texto`
- `payload_meta`
- `id_mensaje_meta`
- `id_mensaje_whatsapp`
- `creado_en`

### `menu_productos`

- `id`
- `nombre`
- `categoria`
- `descripcion`
- `precio`
- `disponible`
- `imagen_url`
- `creado_en`
- `actualizado_en`

### `promociones`

- `id`
- `nombre`
- `descripcion`
- `precio`
- `fecha_inicio`
- `fecha_fin`
- `activa`
- `condiciones`

### `zonas_despacho`

- `id`
- `nombre`
- `costo`
- `tiempo_estimado_min`
- `tiempo_estimado_max`
- `activa`

### `horarios_atencion`

- `id`
- `dia_semana`
- `hora_apertura`
- `hora_cierre`
- `activo`

### `medios_pago`

- `id`
- `nombre`
- `activo`
- `instrucciones`

### `reclamos`

- `id`
- `cliente_id`
- `conversacion_id`
- `tipo`
- `descripcion`
- `estado`
- `prioridad`
- `asignado_a`
- `creado_en`
- `actualizado_en`

### `contenidos`

- `id`
- `tipo` (`historia`, `post`, `carrusel`, `reel`)
- `titulo`
- `copy`
- `cta`
- `estado` (`borrador`, `aprobado`, `programado`, `publicado`, `fallido`)
- `fecha_programada`
- `id_publicacion_meta`
- `creado_en`
- `actualizado_en`

### `contenido_piezas`

- `id`
- `contenido_id`
- `orden`
- `tipo_media`
- `media_url`
- `texto`

### `eventos_meta`

- `id`
- `id_evento_meta`
- `tipo`
- `payload`
- `procesado`
- `error`
- `creado_en`

### `alertas`

- `id`
- `conversacion_id`
- `reclamo_id`
- `canal_destino` (`whatsapp`, `email`, `slack`, `n8n`)
- `tipo`
- `mensaje`
- `estado` (`pendiente`, `enviada`, `fallida`)
- `payload`
- `creado_en`
- `enviado_en`

### `decisiones_agente`

- `id`
- `conversacion_id`
- `agente`
- `intencion`
- `entrada`
- `salida`
- `decision_seguridad`
- `creado_en`

## Endpoints internos

- `GET /api/webhooks/whatsapp`
- `POST /api/webhooks/whatsapp`
- `GET /api/webhooks/instagram`
- `POST /api/webhooks/instagram`
- `POST /api/agente/procesar-mensaje`
- `POST /api/agente/enviar-respuesta`
- `POST /api/contenido/generar-plan`
- `POST /api/contenido/generar-pieza`
- `POST /api/contenido/publicar`
- `GET /api/contenido/calendario`
- `POST /api/reclamos/escalar`
- `POST /api/alertas/enviar`
- `POST /api/webhooks/n8n/alertas`
- `GET /api/admin/conversaciones`
- `GET /api/admin/contenidos`
- `PUT /api/admin/contenidos/:id/aprobar`

## Automatizaciones diarias

### Manana

- Revisar promociones activas.
- Generar historias del dia.
- Generar una publicacion o carrusel si corresponde.
- Publicar automaticamente si el modo automatico esta activo.

### Durante el dia

- Responder WhatsApp en tiempo real como prioridad.
- Responder DMs de Instagram en tiempo real.
- Detectar oportunidades de venta.
- Escalar reclamos.
- Enviar alertas por n8n/WhatsApp cuando una conversacion requiera humano.
- Registrar preguntas frecuentes nuevas.

### Noche

- Generar resumen de ventas potenciales, reclamos y preguntas frecuentes.
- Proponer contenido para el dia siguiente.

## Modo de operacion recomendado

Fase 1:

- Automatizar respuestas de WhatsApp con aprobacion humana para casos sensibles.
- Activar alertas internas por WhatsApp/n8n para reclamos y mensajes marcados como `requiere_humano`.
- Crear borradores de contenido diario.

Fase 2:

- Automatizar respuestas de DMs de Instagram con las mismas reglas de seguridad.
- Activar publicacion automatica de historias/posts de bajo riesgo.
- Mantener aprobacion humana para promociones especiales.

Fase 3:

- Automatizar calendario completo con monitoreo, metricas y reglas de pausa.

## Variables de entorno esperadas

- `OPENAI_API_KEY`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_VERIFY_TOKEN`
- `META_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `DATABASE_URL`
- `N8N_WEBHOOK_ALERTAS_URL`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`

## Riesgos y controles

- Meta puede rechazar permisos: preparar video de app review y explicar uso real.
- Publicacion automatica puede fallar por formato de media: validar dimensiones, peso y tipo antes de publicar.
- Respuestas incorrectas pueden afectar ventas: usar datos estructurados y Agente Seguridad.
- Reclamos complejos requieren humano: nunca cerrar automaticamente casos delicados.
- Tokens vencidos o revocados: monitorear expiracion y alertar.
- Alertas duplicadas pueden molestar al equipo: usar reglas de deduplicacion y estados en la tabla `alertas`.
- WhatsApp requiere plantillas aprobadas para iniciar conversaciones fuera de ventana permitida: disenar alertas internas con numeros autorizados y revisar politicas antes de produccion.

## Siguiente implementacion sugerida

1. Crear proyecto Next.js con TypeScript.
2. Configurar Neon Postgres, Prisma y migraciones.
3. Implementar webhook de WhatsApp Business.
4. Implementar tablas base.
5. Implementar orquestador de agentes con OpenAI.
6. Implementar envio de respuestas por WhatsApp Business API.
7. Crear panel admin para conversaciones, menu, promociones y contenido.
8. Implementar alertas por n8n hacia WhatsApp de atencion.
9. Implementar webhook de Instagram y respuestas de DMs.
10. Implementar publicacion de contenido cuando Meta apruebe permisos.
