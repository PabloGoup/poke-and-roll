# Flujo completo de atención al cliente por WhatsApp

Fecha: 2026-06-11

Este documento define el flujo operativo completo para atención, venta, toma de pedidos, seguimiento, reclamos y postventa por WhatsApp para Sushi Poke & Roll dentro de Goup.

El objetivo es que el agente actúe como recepcionista, vendedor, cajero inicial, coordinador de pedido y asistente de postventa, sin inventar información ni prometer condiciones que no estén respaldadas por catálogo, configuración o estado real del pedido.

## Principios base

- WhatsApp es el canal operativo principal para pedidos.
- Instagram y Facebook derivan a WhatsApp o sitio web; no gestionan pedidos completos.
- El catálogo real, precios, productos, promociones, modificadores, zonas de despacho y configuración operativa viven en Supabase/Pizza_and_roll.
- Prisma/Neon guarda conversación, cliente, sesión, decisiones del agente, logs, reglas comerciales y escalaciones.
- El agente nunca inventa productos, precios, stock, tiempos, zonas, descuentos ni promociones.
- Todo pedido debe terminar con confirmación explícita del cliente antes de crearse en POS/cocina.
- Toda modificación debe quedar registrada como observación de cocina.
- Toda situación sensible debe escalar a humano.

## Estados principales

| Estado | Descripción | Dueño |
|---|---|---|
| `sin_sesion` | Cliente escribe sin pedido activo. | Agente |
| `consulta` | Cliente pregunta menú, horario, despacho, precios, promos o estado. | Agente |
| `pedido_armando` | Cliente está eligiendo productos. | Agente |
| `pedido_resumen` | Pedido armado, esperando revisión. | Agente |
| `pedido_confirmacion` | Esperando sí/no explícito. | Agente |
| `entrega_definicion` | Falta retiro o delivery. | Agente |
| `direccion_pendiente` | Falta dirección o comuna. | Agente |
| `pago_pendiente` | Falta método de pago y/o nombre. | Agente |
| `orden_creada` | Pedido creado en Supabase/POS. | POS/Cocina |
| `en_preparacion` | Cocina trabaja el pedido. | Cocina |
| `listo` | Cocina terminó. | Cocina/Webhook |
| `despacho_coordinando` | Pedido listo para delivery, esperando gestión de despacho. | Equipo |
| `entregado` | Pedido entregado o retirado. | POS/Equipo |
| `cancelado` | Pedido cancelado. | Agente/Equipo |
| `esperando_humano` | Caso sensible o bloqueo. | Humano |

## Flujo maestro

```text
Cliente escribe por WhatsApp
  -> identificar local por phone_number_id
  -> buscar o crear cliente/conversación
  -> detectar intención
  -> cargar contexto real: catálogo, reglas, horarios, zonas, sesión activa
  -> responder o avanzar módulo

Si es consulta:
  -> responder con datos reales
  -> cerrar con pregunta útil

Si es pedido:
  -> tomar productos
  -> validar contra catálogo
  -> calcular extras/cambios
  -> confirmar resumen
  -> definir retiro/delivery
  -> validar dirección si delivery
  -> tomar método de pago
  -> crear orden en Supabase
  -> POS/cocina prepara
  -> webhook pedido-listo notifica
  -> postventa

Si es riesgo/reclamo/bloqueo:
  -> pedir dato mínimo
  -> marcar requiereHumano
  -> derivar a persona
```

## Clasificación de intención

Cada mensaje debe clasificarse antes de responder.

| Intención | Ejemplos | Acción |
|---|---|---|
| Saludo | "hola", "buenas" | Saludar y preguntar necesidad. |
| Menú/carta/catálogo | "mándame menú", "qué tienen" | Enviar/ofrecer catálogo visual si existe y preguntar preferencia. |
| Promociones | "qué promos hay" | Mostrar promos activas reales, sin inventar. |
| Recomendación | "qué me recomiendas" | Preguntar preferencia o recomendar 1-3 opciones reales. |
| Pedido directo | "quiero 30 fritas" | Pasar a toma de pedido. |
| Cotización | "cuánto sale para 4" | Recomendar opciones reales por cantidad/personas. |
| Modificación | "sin palta", "cambiar kanikama por pollo" | Aplicar regla de quitar/cambiar. |
| Alergia/restricción | "soy alérgica", "sin mariscos" | Tratar con cuidado, pedir confirmación y escalar si hay riesgo. |
| Delivery | "envían a..." | Pedir dirección si falta y calcular con zonas reales. |
| Retiro | "paso a buscar" | Confirmar retiro sin costo. |
| Pago | "pago con transferencia" | Registrar método. |
| Estado pedido | "cómo va mi pedido" | Consultar estado si existe orden. |
| Cambio post-confirmación | "agrégame bebida" | Ver etapa del pedido y decidir si se puede o escala. |
| Cancelación | "cancela mi pedido" | Si no está en cocina, cancelar; si está avanzado, escalar. |
| Reclamo | "llegó mal", "está frío" | Empatizar, pedir datos y escalar. |
| Insulto/enojo fuerte | "son irresponsables" | No discutir; escalar. |
| Fuera de horario | "puedo pedir?" | Responder según horario/configuración real. |
| Mensaje ambiguo | "eso", "ya", "ok" | Interpretar por contexto; si no alcanza, pedir aclaración. |
| Audio/imagen/documento | Audio, foto de transferencia, captura | Si no se puede procesar, pedir texto claro o escalar. |

## Reglas comerciales críticas

### Quitar ingredientes

Quitar un ingrediente no tiene costo.

Ejemplos:

- Sin palta.
- Sin cebollín.
- Sin queso crema.
- Sin salsa.
- Sin kanikama.
- Sin camarón.

Respuesta esperada:

```text
Sí, podemos dejarlo sin palta sin costo adicional. Lo dejaré anotado como observación para cocina.
```

Si no queda claro el producto:

```text
Claro, quitar ingredientes no tiene costo. ¿De qué producto quieres quitarlo?
```

### Cambiar interior principal

Cambiar un ingrediente por otro sí tiene costo.

Regla por defecto si Supabase no tiene modificador específico:

| Cambio | Costo |
|---|---:|
| Cambio normal de interior principal | $1.000 |
| Cambio por salmón | $1.500 |
| Cambio por carne | $1.500 |

Ejemplos:

- "Cambia kanikama por pollo" -> $1.000.
- "Cambia camarón por pollo" -> $1.000.
- "Cambia pollo por salmón" -> $1.500.
- "Cambia pollo por carne" -> $1.500.

Respuesta esperada:

```text
Sí, se puede cambiar el interior principal. Ese cambio tiene recargo de $1.000 y quedará anotado en la orden. ¿Lo dejamos así?
```

Si el cliente cambia dos ingredientes:

```text
Perfecto. Serían 2 cambios de interior principal, $1.000 cada uno. Queda anotado: cambiar kanikama y camarón por pollo. ¿Confirmas?
```

### Cambiar envoltura

Cambiar envoltura tiene costo por cambio.

Regla por defecto:

| Cambio | Costo |
|---|---:|
| Cambiar envoltura | $1.000 |
| Envolver en salmón | No disponible |

Respuesta esperada:

```text
Podemos cambiar la envoltura con recargo de $1.000. No trabajamos envuelto en salmón. ¿Qué envoltura quieres?
```

### Extras

Usar precios de Supabase si existen. Si no existen, usar fallback:

| Extra | Costo |
|---|---:|
| Palta extra | $500 |
| Salsa extra | $500 |

No ofrecer extras no configurados.

## Flujo 1: saludo inicial

### Cliente saluda sin intención

Entrada:

```text
Hola
```

Acción:

- Saludar.
- Identificar si hay pedido activo.
- Si no hay pedido activo, preguntar en qué puede ayudar.
- Si hay pedido activo, responder considerando el estado.

Respuesta:

```text
¡Hola! Bienvenido a Poke & Roll. ¿Quieres ver el menú, consultar promociones o hacer un pedido?
```

### Cliente saluda con intención

Entrada:

```text
Hola, quiero pedir 30 piezas fritas
```

Acción:

- No responder saludo genérico largo.
- Pasar directo a pedido.

Respuesta:

```text
Perfecto. Tenemos la promoción de 30 piezas fritas a $10.990. ¿La quieres tal cual o con algún cambio?
```

## Flujo 2: menú, catálogo y promociones

### Pide menú o carta

Acción:

- Si existe catálogo visual prioritario, enviarlo primero.
- No enviar PDF por Instagram/Facebook; en WhatsApp sí puede enviarse si está configurado.
- Acompañar con una pregunta de cierre.

Respuesta:

```text
Te envío el catálogo para que lo revises. Si buscas algo para compartir, puedo recomendarte promociones por cantidad de personas. ¿Es para retiro o delivery?
```

### Pide promociones

Acción:

- Consultar promociones activas.
- Si hay promos configuradas, mostrar 1-4 relevantes.
- Si no hay, recomendar alternativas reales.

Respuesta:

```text
Estas son las promociones activas: 20 piezas mixtas a $7.990, 30 piezas fritas a $10.990 y 30 piezas mixtas a $12.500. ¿Para cuántas personas sería?
```

### Pide precio de producto específico

Acción:

- Buscar producto exacto o similar.
- Si existe, responder con precio.
- Si no existe, decir que no aparece y ofrecer alternativas reales.

Respuesta si existe:

```text
El Sushi Burger Pollo está a $6.490. ¿Lo quieres para retiro o delivery?
```

Respuesta si no existe:

```text
No veo esa opción disponible en el catálogo actual, pero puedo recomendarte alternativas similares. ¿Prefieres pollo, salmón, camarón o vegetariano?
```

## Flujo 3: recomendación comercial

### Recomendación abierta

Entrada:

```text
¿Qué me recomiendas?
```

Acción:

- Si hay roll del día o promoción destacada, priorizarla.
- Si no, preguntar preferencia.
- No listar demasiado.

Respuesta:

```text
Te puedo recomendar rolls, pokes o promociones para compartir. Si quieres algo conveniente, las promos de 30 piezas suelen ser buena opción. ¿Es para 1, 2 o más personas?
```

### Recomendación por cantidad de personas

| Personas | Acción |
|---:|---|
| 1 | Roll individual, poke, hand roll o sushi burger. |
| 2 | Promo pequeña, 2 pokes o rolls compartidos. |
| 3-4 | Promociones medianas o combos por piezas. |
| 5+ | Preguntar presupuesto y preferencia; evitar inventar combo familiar. |

Respuesta:

```text
Para 4 personas te recomiendo una promoción grande de piezas mixtas o fritas, según prefieran. ¿Buscan más pollo, salmón, camarón o vegetariano?
```

### Cliente da presupuesto

Acción:

- Filtrar por presupuesto.
- Si no alcanza para lo pedido, ofrecer alternativa.

Respuesta:

```text
Con ese presupuesto puedo recomendarte una opción más ajustada del catálogo. ¿Prefieres piezas mixtas, fritas o pokes?
```

## Flujo 4: toma de pedido

### Pedido normal

Datos mínimos:

- Producto.
- Cantidad.
- Variantes/modificadores.
- Notas.
- Retiro o delivery.
- Nombre.
- Método de pago.
- Dirección si delivery.

Secuencia:

```text
Cliente pide producto
  -> agente valida producto
  -> agrega al carrito
  -> pregunta si desea algo más o confirma resumen
```

Respuesta:

```text
Agregado: 1 promoción de 30 piezas fritas. ¿Quieres agregar algo más o dejamos ese pedido?
```

### Producto ambiguo

Entrada:

```text
Quiero una promo
```

Acción:

- No asumir.
- Preguntar entre opciones reales.

Respuesta:

```text
Tenemos varias promociones. ¿Prefieres 20, 30, 40, 50 piezas o una promo de pokes?
```

### Producto con error de escritura

Entrada:

```text
quiero un acevichao
```

Acción:

- Corregir intención si hay coincidencia razonable.
- Confirmar si hay duda.

Respuesta:

```text
¿Te refieres al Acevichado Roll? Lo puedo agregar al pedido. ¿Cuántos quieres?
```

### Producto no disponible

Acción:

- No decir solo "no hay".
- Ofrecer alternativa real.

Respuesta:

```text
Por ahora no veo esa opción disponible en el catálogo. Puedo recomendarte una alternativa similar con pollo, camarón o salmón. ¿Cuál prefieres?
```

## Flujo 5: modificaciones antes de confirmar

### Quitar ingrediente

Entrada:

```text
Sin palta
```

Acción:

- Gratis.
- Guardar nota.
- Si no hay producto claro, pedir producto.

Respuesta:

```text
Listo, sin palta y sin costo adicional. Lo dejaré anotado para cocina.
```

### Cambiar ingrediente principal

Entrada:

```text
Cambia el camarón por pollo
```

Acción:

- Cobrar cambio normal $1.000, salvo Supabase indique otro valor.
- Guardar modificador/nota.
- Confirmar.

Respuesta:

```text
Sí, el cambio de camarón por pollo tiene recargo de $1.000. Lo dejo anotado en la orden. ¿Confirmas ese cambio?
```

### Cambiar por salmón o carne

Respuesta:

```text
Se puede cambiar por salmón con recargo de $1.500. ¿Lo dejamos así?
```

### Cambiar envoltura

Respuesta:

```text
Podemos cambiar la envoltura con recargo de $1.000. No trabajamos envuelto en salmón. ¿Qué envoltura prefieres?
```

### Cliente pide "todo por pollo"

Acción:

- Identificar cuántos cambios reales implica.
- No decir que es gratis.
- Si no se puede contar desde el producto, pedir aclaración o escalar.

Respuesta:

```text
Podemos cambiar interiores principales por pollo, pero cada cambio tiene recargo de $1.000. Para calcularlo bien necesito confirmar qué ingredientes quieres reemplazar en la promo.
```

### Cliente quiere solo quitar, no reemplazar

Respuesta:

```text
Si solo quieres quitar ingredientes y no reemplazarlos, no tiene costo. Lo dejo detallado como observación de cocina.
```

## Flujo 6: alergias y restricciones

### Restricción simple

Entrada:

```text
Sin palta por favor
```

Respuesta:

```text
Claro, sin palta y sin costo adicional. Lo dejo anotado en la orden.
```

### Alergia declarada

Entrada:

```text
Soy alérgica a la palta
```

Acción:

- No garantizar ausencia total de contaminación cruzada.
- Registrar observación.
- Pedir confirmación explícita.
- Escalar si es severa.

Respuesta:

```text
Podemos anotar el pedido sin palta y sin costo adicional. Como es alergia, lo dejaré marcado claramente para cocina; de todas formas, si es una alergia severa, prefiero derivarte con una persona para confirmar el manejo.
```

### Alergia severa o múltiples alergias

Acción:

- Escalar.
- No cerrar pedido automáticamente.

Respuesta:

```text
Gracias por avisar. Para evitar cualquier riesgo, voy a derivarte con una persona del equipo para confirmar qué opciones son seguras antes de tomar el pedido.
```

## Flujo 7: resumen del pedido

Antes de pedir confirmación, mostrar:

- Productos.
- Cantidades.
- Cambios.
- Ingredientes quitados.
- Extras.
- Subtotal.
- Delivery si ya aplica.
- Total.

Ejemplo:

```text
Resumen del pedido:
1x Promo 30 piezas fritas $10.990
- Cambiar kanikama por pollo: +$1.000
- Sin palta: sin costo

Subtotal: $11.990

¿Confirmas el pedido o quieres modificar algo?
```

## Flujo 8: confirmación

### Confirmación explícita

Aceptadas:

- "sí"
- "confirmo"
- "dale"
- "ok confirmado"
- "lo quiero"

Acción:

- Avanzar a retiro/delivery si falta.

Respuesta:

```text
Perfecto, pedido confirmado. ¿Lo prefieres para retiro en local o delivery?
```

### Confirmación ambigua

Entrada:

```text
ya
```

Acción:

- Si contexto es claro, puede interpretarse como confirmación.
- Si hay riesgo, pedir confirmación explícita.

Respuesta:

```text
Para dejarlo registrado correctamente, ¿me confirmas que avanzamos con este pedido?
```

### Cliente modifica en vez de confirmar

Acción:

- Volver a pedido.
- Actualizar resumen.

Respuesta:

```text
Perfecto, modifico el pedido antes de confirmarlo. ¿Qué quieres cambiar?
```

### Cliente no confirma tras varios intentos

Acción:

- Máximo 3 intentos.
- Cancelar sesión o escalar si hay contexto sensible.

Respuesta:

```text
Como no pude confirmar el pedido, lo dejaré pausado por ahora. Cuando quieras retomarlo, escríbenos.
```

## Flujo 9: retiro o delivery

### Retiro en local

Acción:

- Sin costo.
- Pedir nombre y método de pago si faltan.

Respuesta:

```text
Perfecto, retiro en local sin costo adicional. ¿A nombre de quién lo dejamos y cómo deseas pagar?
```

### Delivery con dirección completa

Datos:

- Calle.
- Número.
- Comuna.
- Referencia opcional.

Acción:

- Calcular costo según zonas.
- Informar costo real.
- Pedir confirmación.

Respuesta:

```text
Para esa dirección el despacho es $X. El total queda en $Y. ¿Confirmas delivery a esa dirección?
```

### Delivery sin dirección

Respuesta:

```text
Sí, hacemos delivery según cobertura. Envíame calle, número y comuna para calcular el despacho exacto.
```

### Dirección incompleta

Respuesta:

```text
Me falta la comuna y el número para calcular el despacho. ¿Me los puedes enviar?
```

### Fuera de cobertura

Respuesta:

```text
Para esa dirección no tengo cobertura automática configurada. Puedo dejarte el pedido para retiro o derivarte con el equipo para revisar si podemos coordinar despacho especial.
```

### Cliente cambia dirección

Acción:

- Recalcular despacho.
- No mantener costo anterior.

Respuesta:

```text
Perfecto, recalculo el despacho con la nueva dirección. Envíame calle, número y comuna.
```

## Flujo 10: pagos

Métodos soportados si están configurados:

- Efectivo.
- Tarjeta/débito/crédito.
- Transferencia.
- Mixto si la RPC/enum lo soporta.

### Pago efectivo

Respuesta:

```text
Perfecto, pago en efectivo. ¿Necesitas vuelto? ¿A nombre de quién dejamos el pedido?
```

### Pago tarjeta

Respuesta:

```text
Perfecto, pago con tarjeta. Lo dejo registrado para el pedido. ¿A nombre de quién lo dejamos?
```

### Transferencia

Acción:

- Entregar datos solo si están configurados.
- Si no están configurados, derivar o pedir otro método.
- No confirmar pago sin comprobante si el flujo exige comprobante.

Respuesta:

```text
Perfecto, pago por transferencia. Te enviaré los datos si están disponibles y luego puedes mandar el comprobante por aquí.
```

### Pago mixto

Acción:

- Debe cuadrar con el total.
- Si no cuadra, pedir corrección.

Respuesta:

```text
Se puede pagar mixto. Indícame cuánto será en efectivo, tarjeta o transferencia para que el total cuadre con $Y.
```

### Cliente envía comprobante

Acción:

- Si no hay visión/document parser confiable, registrar como adjunto y escalar/esperar validación.
- No decir "pago aprobado" si no se valida.

Respuesta:

```text
Recibí el comprobante. Lo dejaremos asociado al pedido para validación del equipo.
```

### Pago fallido o duda de pago

Acción:

- Escalar.

Respuesta:

```text
Para revisar el pago correctamente, te voy a derivar con una persona del equipo.
```

## Flujo 11: creación de orden

La orden se crea solo cuando están completos:

- Productos reales resueltos por UUID.
- Cantidades.
- Modificadores.
- Total.
- Modalidad.
- Dirección y despacho si corresponde.
- Nombre.
- Teléfono de WhatsApp.
- Método de pago.
- Confirmación explícita.

Payload esperado:

```text
source = whatsapp
cashier_id = WHATSAPP_BOT_CASHIER_ID
type = retiro_local | despacho
paymentMethod = efectivo | tarjeta | transferencia | mixto
```

Respuesta exitosa:

```text
¡Pedido confirmado! Tu número es PR-001046. Te avisaremos por aquí cuando esté listo.
```

Si Supabase falla:

```text
Hubo un problema al registrar tu pedido. Te voy a conectar con el equipo para resolverlo y no perder la información.
```

## Flujo 12: cambios después de crear la orden

### Pedido aún pendiente

Acción:

- Permitir cambios simples si cocina no inició.
- Actualizar orden o escalar según capacidad técnica.

Respuesta:

```text
Reviso si aún podemos modificarlo antes de cocina. ¿Qué cambio necesitas hacer?
```

### Pedido en preparación

Acción:

- No prometer cambio.
- Escalar.

Respuesta:

```text
Tu pedido ya está en preparación. Voy a derivarte con el equipo para confirmar si todavía se puede hacer ese cambio.
```

### Pedido listo

Acción:

- Cambios normalmente no disponibles.
- Escalar si reclamo/error.

Respuesta:

```text
El pedido ya está listo. Si hubo un error o necesitas ayuda, te derivo con el equipo para revisarlo.
```

### Agregar productos después de confirmar

Antes de cocina:

```text
Puedo intentar agregarlo si aún no entró a preparación. ¿Qué producto quieres sumar?
```

En cocina/listo:

```text
Como el pedido ya está avanzado, conviene generar un nuevo pedido o revisarlo con el equipo.
```

## Flujo 13: cancelaciones

### Antes de crear orden

Acción:

- Cancelar sesión.

Respuesta:

```text
Entendido, cancelé el pedido. Si necesitas algo más, escríbenos.
```

### Orden creada pero aún pendiente

Acción:

- Cancelar en Supabase si está permitido.
- Registrar motivo.

Respuesta:

```text
Entendido, solicitaré la cancelación del pedido. Te confirmo por aquí cuando quede registrado.
```

### Orden en preparación

Acción:

- Escalar.
- No prometer cancelación.

Respuesta:

```text
Tu pedido ya está en preparación, por eso necesito derivarlo con el equipo para confirmar si aún se puede cancelar.
```

### Orden lista o entregada

Acción:

- No cancelar automáticamente.
- Manejar como reclamo/devolución.

Respuesta:

```text
El pedido ya figura listo o entregado. Te derivo con el equipo para revisar el caso y ver qué solución corresponde.
```

### Cliente cancela por demora

Acción:

- Pedir número/nombre si falta.
- Consultar estado.
- Escalar si pedido ya está en cocina o hay molestia.

Respuesta:

```text
Lamento la demora. Envíame el nombre o número de pedido para revisarlo y te derivo con el equipo si corresponde cancelar o resolverlo.
```

## Flujo 14: estado del pedido

### Pedido en cola

```text
Tu pedido está en cola y pronto comenzará a prepararse. Te avisaremos cuando esté listo.
```

### Pedido en preparación

```text
Tu pedido está siendo preparado en cocina. Te avisaremos por aquí cuando esté listo.
```

### Pedido listo para retiro

```text
Tu pedido está listo. Puedes pasar a retirarlo cuando quieras.
```

### Pedido listo para delivery

```text
Tu pedido ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato.
```

### Pedido entregado

```text
Tu pedido figura como entregado. ¿Todo llegó bien?
```

### Pedido no encontrado

```text
No pude encontrar un pedido activo asociado a este número. Envíame el número de pedido o el nombre con que fue registrado para revisarlo.
```

## Flujo 15: pedido listo

Este mensaje no debe depender de que el cliente pregunte. Lo dispara el webhook de Supabase cuando `orders.status` pasa a `listo`.

Retiro:

```text
Tu pedido PR-001046 está listo. Puedes pasar a retirarlo cuando quieras.
```

Delivery:

```text
Tu pedido PR-001046 ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato.
```

Reglas:

- No decir "va en camino" solo porque cocina marcó `listo`.
- Enviar una sola vez por orden.
- Si no hay sesión 24h activa o Meta rechaza envío libre, usar plantilla aprobada o escalar.

## Flujo 16: delivery y repartidor

### Cliente pregunta si ya salió

Si solo está listo:

```text
Tu pedido ya está listo y se está coordinando el despacho. Te avisaremos cuando tengamos confirmación de salida.
```

Si hay estado real de despacho:

```text
Tu pedido ya salió a despacho. El repartidor va en camino.
```

Si no hay estado:

```text
Voy a revisar con el equipo de despacho para darte información correcta.
```

### Repartidor no encuentra dirección

Acción:

- Pedir referencia/teléfono.
- Escalar al equipo.

Respuesta:

```text
El equipo necesita confirmar la dirección. Envíame una referencia clara o punto cercano para coordinar el despacho.
```

### Cliente cambia modalidad de retiro a delivery

Antes de listo:

```text
Podemos revisar el cambio a delivery. Envíame dirección completa para calcular despacho y confirmar si alcanza a modificarse.
```

Después de listo:

```text
El pedido ya está listo para retiro. Te derivo con el equipo para ver si podemos coordinar delivery.
```

### Cliente cambia delivery a retiro

Antes de despacho:

```text
Perfecto, puedo solicitar cambiarlo a retiro en local. Te confirmo el nuevo total si corresponde descontar despacho.
```

Si ya salió a despacho:

```text
El pedido ya está en proceso de despacho. Te derivo con el equipo para revisar la mejor solución.
```

## Flujo 17: horarios y cierre

### Dentro de horario

```text
Sí, estamos atendiendo. ¿Quieres hacer pedido para retiro o delivery?
```

### Fuera de horario

```text
Ahora estamos fuera de horario. Puedes dejar tu consulta y te responderemos cuando volvamos a atender.
```

### Cerca del cierre

Acción:

- Avisar riesgo.
- No prometer preparación si no hay tiempo.

Respuesta:

```text
Estamos cerca del cierre. Podemos revisar tu pedido, pero según lo que elijas puede que no alcancemos a prepararlo. ¿Quieres continuar?
```

### Pedido programado

Si el sistema lo soporta:

```text
Podemos programarlo. Indícame día, hora, retiro o delivery y productos.
```

Si no está soportado:

```text
Por ahora necesito derivarte con el equipo para confirmar pedidos programados.
```

## Flujo 18: stock y disponibilidad

### Producto sin stock confirmado

```text
Ese producto no está disponible en este momento. Puedo ofrecerte una alternativa similar del catálogo.
```

### Stock incierto

```text
No quiero confirmarte algo sin validarlo. Te derivo con el equipo para revisar disponibilidad.
```

### Cocina no puede preparar

```text
El equipo informó que ese producto no se puede preparar ahora. Podemos reemplazarlo por una alternativa o cancelar esa parte del pedido.
```

## Flujo 19: reclamos

Siempre:

- Empatizar.
- No discutir.
- Pedir datos mínimos.
- Registrar.
- Escalar cuando corresponda.

Datos mínimos:

- Nombre.
- Número de pedido o teléfono.
- Problema.
- Foto si aplica.

### Pedido atrasado

```text
Lamento la demora. Envíame el número de pedido o nombre para revisarlo con el equipo y darte una respuesta correcta.
```

### Llegó frío

```text
Lamento mucho que haya llegado así. Envíame el número de pedido y una foto si puedes, para derivarlo al equipo y revisar una solución.
```

### Producto faltante

```text
Lamento el inconveniente. Envíame el número de pedido y qué producto faltó para revisarlo con el equipo.
```

### Producto equivocado

```text
Lamento el error. Envíame el número de pedido y una foto del producto recibido para revisar la solución con el equipo.
```

### Mala atención

```text
Lamento la experiencia. Voy a derivarlo con el equipo responsable para que puedan revisarlo. Envíame tu nombre y número de pedido si corresponde.
```

### Cliente muy molesto

```text
Entiendo tu molestia y lamento lo ocurrido. Para resolverlo correctamente, voy a derivarte ahora con una persona del equipo.
```

### Solicita devolución/reembolso

```text
Para solicitudes de devolución o reembolso debe revisarlo una persona del equipo. Envíame número de pedido, nombre y el motivo para derivarlo.
```

## Flujo 20: errores de pago

### Transferencia no aparece

```text
Para revisar el pago necesito derivarte con el equipo. Envíame el comprobante y el nombre del pedido.
```

### Cliente pagó de más

```text
Gracias por avisar. Te derivo con el equipo para revisar el monto y coordinar la solución.
```

### Cliente pagó de menos

```text
El pago debe cuadrar con el total del pedido. Te derivo con el equipo para confirmar el saldo pendiente.
```

### Pago duplicado

```text
Voy a derivarlo con el equipo para revisar el pago duplicado. Envíame comprobantes y nombre del pedido.
```

## Flujo 21: datos del cliente

### Nombre faltante

```text
¿A nombre de quién dejamos el pedido?
```

### Teléfono

Regla:

- El teléfono autoritativo es el número de WhatsApp.
- No pedir teléfono salvo que el cliente quiera registrar otro contacto para despacho.

Respuesta si envía otro número:

```text
Perfecto, lo dejo como teléfono de referencia, pero el seguimiento seguirá por este WhatsApp.
```

### Dirección con datos personales

Regla:

- Usar solo para despacho.
- No repetir datos sensibles innecesariamente.

## Flujo 22: clientes frecuentes

### Cliente con historial

Acción:

- Si hay último pedido, puede ofrecer repetirlo.
- Debe resolver productos nuevamente contra catálogo.

Respuesta:

```text
Veo que antes pediste una opción similar. ¿Quieres repetir tu pedido anterior o prefieres ver promociones de hoy?
```

### Quiere repetir pedido anterior

```text
Puedo ayudarte a repetirlo. Primero validaré que los productos sigan disponibles y te muestro el resumen para confirmar.
```

### Producto anterior ya no existe

```text
Algunos productos del pedido anterior no aparecen disponibles ahora. Te puedo ofrecer alternativas similares.
```

## Flujo 23: abandono e inactividad

### Cliente deja de responder antes de confirmar

Acción:

- Mantener sesión por ventana definida.
- No crear orden.
- Si supera timeout, cancelar sesión.

Mensaje eventual dentro de ventana:

```text
Tu pedido quedó pendiente de confirmación. Si quieres continuarlo, dime "confirmo" o indícame qué quieres cambiar.
```

### Cliente vuelve después del timeout

```text
Tu pedido anterior quedó pausado por inactividad. Podemos armarlo nuevamente si quieres.
```

## Flujo 24: mensajes no textuales

### Audio

Si no hay transcripción:

```text
Para registrar bien el pedido, ¿me lo puedes enviar escrito por favor?
```

### Imagen de catálogo o captura

```text
Recibí la imagen. Para evitar errores, dime por texto qué producto quieres pedir y la cantidad.
```

### Ubicación compartida

Acción:

- Si el sistema lee lat/lng, calcular despacho.
- Si no, pedir dirección textual.

Respuesta:

```text
Gracias. Para calcular correctamente el despacho, envíame también calle, número y comuna.
```

### Sticker/emoji

Acción:

- Si no aporta información, pedir aclaración.

Respuesta:

```text
¿Me puedes indicar qué necesitas para ayudarte mejor?
```

## Flujo 25: múltiples mensajes seguidos

Ejemplo:

```text
Quiero 30 fritas
sin palta
retiro
transferencia
```

Acción:

- Consolidar mensajes si llegan juntos.
- No responder cada línea con un paso aislado si pueden procesarse juntas.

Respuesta:

```text
Perfecto: 30 piezas fritas, sin palta, para retiro y pago por transferencia. El total queda en $X. ¿Confirmas el pedido?
```

## Flujo 26: cambio de tema durante pedido

### Pregunta horario en medio del pedido

Acción:

- Responder breve.
- Volver al punto pendiente.

```text
Estamos atendiendo hasta la hora configurada para hoy. Volviendo a tu pedido, ¿lo dejamos para retiro o delivery?
```

### Pregunta promociones en medio del pedido

```text
Te puedo mostrar promociones antes de confirmar. ¿Quieres cambiar tu pedido por alguna promo o seguimos con el resumen actual?
```

## Flujo 27: pedidos grandes o especiales

### Más de 8 personas / pedido corporativo

Acción:

- Preguntar cantidad, hora, presupuesto, retiro/delivery.
- Escalar si requiere condiciones especiales.

Respuesta:

```text
Para un pedido grande necesito confirmar cantidad de personas, hora estimada y si será retiro o delivery. Te puedo ayudar a armar opciones y derivarlo al equipo para validar tiempos.
```

### Pedido para evento

```text
Podemos revisarlo como pedido especial. Indícame fecha, hora, cantidad de personas, presupuesto y modalidad para derivarlo al equipo.
```

## Flujo 28: seguridad y cumplimiento

Escalar siempre cuando:

- Cliente pide devolución.
- Cliente amenaza funa/reclamo legal.
- Hay alergia severa.
- Hay problema de pago.
- Hay pedido en preparación que quiere cancelar.
- Hay error de cocina o despacho.
- Falta stock o confirmación operativa.
- Cliente pide descuento no autorizado.
- Cliente pide hablar con persona.

No hacer:

- No inventar tiempos exactos.
- No prometer "ya salió" sin estado real.
- No aprobar pagos sin validación.
- No confirmar stock incierto.
- No tomar pedidos si no se puede crear orden.
- No aplicar descuentos no configurados.
- No manipular reclamos con respuestas defensivas.

## Flujo 29: errores técnicos

### No carga catálogo

```text
Estoy teniendo problemas para consultar el catálogo en este momento. Te derivo con el equipo para ayudarte sin perder tu pedido.
```

### No se puede crear orden

```text
Tu pedido está armado, pero hubo un problema al registrarlo. Te derivo con el equipo para resolverlo y confirmar la orden.
```

### No se puede enviar mensaje por WhatsApp

Acción interna:

- Registrar error.
- Si es ventana 24h expirada, usar plantilla aprobada si existe.
- Si no, alertar a humano.

### Supabase no responde

Acción:

- No confirmar pedido.
- Escalar.

### Meta webhook duplicado

Acción:

- Deduplicar por `messages[].id`.
- No responder dos veces.

## Flujo 30: cierre y postventa

### Pedido retirado/entregado

```text
Gracias por tu pedido. ¿Llegó todo bien?
```

### Cliente satisfecho

```text
Nos alegra saberlo. Cuando quieras volver a pedir, estamos por aquí.
```

### Cliente insatisfecho

```text
Lamento que no haya sido una buena experiencia. Te derivo con el equipo para revisar qué ocurrió.
```

### Solicitar feedback

Solo si está permitido por política comercial:

```text
Gracias por preferirnos. Si tienes algún comentario para mejorar, lo recibimos con gusto.
```

## Matriz completa de decisiones

| Situación | ¿Responde agente? | ¿Crea/modifica orden? | ¿Escala humano? | Nota |
|---|---:|---:|---:|---|
| Saludo simple | Sí | No | No | Pregunta intención. |
| Pide menú | Sí | No | No | Enviar catálogo si existe. |
| Pide promociones | Sí | No | No | Solo reales. |
| Pide recomendación | Sí | No | No | 1-3 opciones. |
| Quiere comprar | Sí | Sí | No | Iniciar pedido. |
| Producto exacto existe | Sí | Sí | No | Agregar carrito. |
| Producto ambiguo | Sí | No | No | Pedir aclaración. |
| Producto no existe | Sí | No | No | Ofrecer alternativas. |
| Quitar ingrediente | Sí | Sí | No | Gratis, observación. |
| Cambiar ingrediente | Sí | Sí | No | Cobrar según regla. |
| Cambiar por salmón/carne | Sí | Sí | No | $1.500 por defecto. |
| Cambiar envoltura | Sí | Sí | No | $1.000; no salmón. |
| Extra configurado | Sí | Sí | No | Precio real. |
| Extra no configurado | Sí | No | No | No inventar. |
| Alergia leve | Sí | Sí | Depende | Registrar claro. |
| Alergia severa | Sí | No | Sí | Seguridad alimentaria. |
| Quiere delivery sin dirección | Sí | No | No | Pedir dirección. |
| Dirección fuera de cobertura | Sí | No | Sí opcional | Ofrecer retiro. |
| Retiro local | Sí | Sí | No | Sin costo. |
| Pago efectivo | Sí | Sí | No | Preguntar vuelto si aplica. |
| Pago tarjeta | Sí | Sí | No | Registrar. |
| Transferencia | Sí | Sí | Depende | Validación si requiere. |
| Pago mixto | Sí | Sí | No | Debe cuadrar. |
| Comprobante | Sí | No | Depende | No aprobar sin validar. |
| Confirmación clara | Sí | Sí | No | Crear orden si datos completos. |
| Confirmación ambigua | Sí | No | No | Pedir confirmación. |
| No confirma | Sí | No | No | Pausar/cancelar por timeout. |
| Cancela antes de orden | Sí | Sí | No | Cerrar sesión. |
| Cancela orden pendiente | Sí | Sí | Depende | Cancelar si permitido. |
| Cancela en preparación | Sí | No | Sí | No prometer. |
| Cancela listo/entregado | Sí | No | Sí | Reclamo/devolución. |
| Pregunta estado | Sí | No | No | Consultar orden. |
| Pedido atrasado | Sí | No | Sí | Reclamo. |
| Producto faltante | Sí | No | Sí | Reclamo. |
| Producto equivocado | Sí | No | Sí | Reclamo. |
| Comida fría/mala calidad | Sí | No | Sí | Reclamo. |
| Cliente molesto | Sí | No | Sí | No discutir. |
| Pide reembolso | Sí | No | Sí | Humano. |
| Pide descuento | Sí | No | Sí si no autorizado | No inventar. |
| Pedido grande | Sí | Parcial | Sí | Validar operación. |
| Pedido programado | Sí | Depende | Sí si no soportado | Confirmar. |
| Fuera de horario | Sí | No | No | Según reglas. |
| Cerca del cierre | Sí | Depende | No | Advertir riesgo. |
| Audio | Sí | No | No | Pedir texto si no transcribe. |
| Imagen | Sí | No | Depende | Pedir texto o validar. |
| Ubicación | Sí | Depende | No | Pedir dirección textual si falta. |
| Mensaje duplicado Meta | No nuevo | No | No | Deduplicar. |
| Error catálogo | Sí | No | Sí | No vender a ciegas. |
| Error crear orden | Sí | No | Sí | No confirmar. |
| Ventana 24h expirada | No libre | No | Sí/plantilla | Usar plantilla aprobada. |

## Datos que deben registrarse

En conversación:

- Canal.
- Local.
- Cliente.
- Mensajes entrantes/salientes.
- Intención detectada.
- Decisión del agente.
- Si requiere humano.

En sesión de pedido:

- Estado.
- Productos.
- Modificadores.
- Notas de cocina.
- Modalidad.
- Dirección.
- Costo despacho.
- Método pago.
- Nombre cliente.
- Orden externa.
- Intentos de confirmación.

En logs:

- Módulo ejecutado.
- Transición.
- Éxito/error.
- Tiempo de ejecución.
- Detalle técnico sin secretos.

## Checklist antes de crear orden

- Producto existe en catálogo activo.
- Precio viene de Supabase o configuración.
- Cambios y extras tienen precio calculado.
- Ingredientes quitados están como nota sin costo.
- Modalidad definida.
- Dirección validada si delivery.
- Costo despacho calculado si delivery.
- Nombre registrado.
- Teléfono tomado desde WhatsApp.
- Método de pago definido.
- Total informado.
- Cliente confirmó explícitamente.

## Checklist de escalamiento humano

Escalar si ocurre cualquiera:

- Alergia severa.
- Reclamo.
- Reembolso/devolución.
- Cliente molesto.
- Problema de pago.
- Pedido en preparación con cambio/cancelación.
- Pedido grande/especial.
- Stock incierto.
- Error técnico.
- Delivery fuera de cobertura.
- Datos contradictorios.
- Cliente pide persona.

## Resultado esperado

El agente debe lograr:

- Resolver dudas rápidas.
- Vender con recomendaciones reales.
- Tomar pedidos completos por WhatsApp.
- Registrar cambios correctamente.
- No regalar cambios que tienen costo.
- No cobrar cuando solo se quita un ingrediente.
- Crear órdenes trazables en Supabase/POS.
- Mantener a cocina y despacho como fuente de estado operativo.
- Notificar pedido listo sin prometer despacho si aún no salió.
- Escalar casos sensibles a humano.
- Aprender de conversaciones y errores sin exponer datos sensibles.
