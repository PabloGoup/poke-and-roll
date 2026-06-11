# Matriz de regresión WhatsApp

Fecha: 2026-06-11

Esta matriz define los escenarios mínimos que el orquestador de WhatsApp debe respetar antes de confiar una conversación al bot.

## Regla central

Los módulos M01-M13 son handlers de tarea. La decisión de qué handler corre primero pertenece al orquestador determinístico (`lib/modulos/dispatcher.ts`), usando estado real de sesión, carrito, orden creada, intención visual, reclamo y datos faltantes.

## Escenarios críticos

| Escenario | Estado previo | Mensaje cliente | Resultado esperado |
|---|---|---|---|
| Saludo simple | Sin sesión | "Hola" | Bienvenida breve. |
| Carta desde inicio | Sin sesión o bienvenida | "Me puedes enviar la carta" | `CONSULTAS`, enviar media de catálogo, no pasar por bienvenida. |
| Promociones desde inicio | Sin sesión o bienvenida | "Solo las promociones" | `CONSULTAS`, enviar media de promociones. |
| Pedido directo | Sin sesión o consulta | "Quiero la promo de 30 fritas" | `PEDIDOS`, agregar producto validado. |
| Pedido con error de escritura | Sin sesión o consulta | "La de 30 friyas" | Resolver como `30 piezas fritas` si el contexto previo apunta a promos de 30. |
| Confirmación de aclaración | Último agente preguntó "¿te refieres a Promo 30 piezas fritas?" | "Sí" | Agregar `Promo 30 piezas fritas` al carrito, no volver a bienvenida. |
| Pregunta sobre item anotado | Carrito con promo | "Qué trae esa promoción?" | Responder sobre el último item del carrito, sin preguntar "¿cuál?". |
| Modificación con un item | Carrito con un solo producto | "Cambiar kanikama x pollo" | Aplicar cambio al único item y sumar recargo, sin preguntar producto. |
| Modificación en la misma frase | Sin sesión o consulta | "Quiero la promo de 30 fritas pero todas con pollo" | Agregar promo y aplicar cambio de proteínas base por pollo con recargo, sin pedir producto de nuevo. |
| Modificación sin verbo | Carrito con un solo producto | "El kanikama y el camarón por pollo" | Interpretar cambio doble por pollo y aplicar recargo total al item activo. |
| Referencia al producto activo | Carrito con modificación pendiente | "A la de 30 fritas" | Aplicar la modificación pendiente a la promo activa, sin derivar a humano. |
| Evitar duplicado | Carrito ya contiene promo 30 fritas | "Quiero las 30 fritas" | No duplicar; confirmar que ya está anotado salvo que pida otra. |
| Cierre de pedido | Carrito activo | "No", "solo eso", "no, solo eso" | Resumen + `CONFIRMACION`. |
| Confirmación explícita | Resumen mostrado | "Sí" | `TIPO_ENTREGA`. |
| Falta entrega | Carrito confirmado sin modalidad | "retiro" / "delivery" | Resolver solo entrega. |
| Delivery sin dirección | Modalidad despacho sin dirección | Dirección o consulta de dirección | `DIRECCION`; no ir a pedidos. |
| Falta pago/nombre | Modalidad definida | "transferencia", "tarjeta", nombre | `FORMAS_PAGO`; no volver a bienvenida. |
| Orden creada | `externalOrderId` presente | "quiero agregar bebida" | Escalar a humano; no modificar pedido directo. |
| Estado de orden | `externalOrderId` presente | "cómo va mi pedido" | `CONSULTAS`, consultar estado real. |
| Reclamo | Cualquier estado | "pésima atención", "llegó frío" | `ATENCION`, requiere humano y registra reclamo. |
| Audio/imagen/documento | Cualquier estado | Mensaje no textual | Responder útil, pedir texto o escalar según tipo. |
| Cambio de tema durante pedido | Carrito activo | "qué horario tienen?" | `CONSULTAS` sin perder carrito. |
| Retorno al pedido | Carrito activo después de consulta | "solo eso" | Resumen + confirmación del carrito activo. |

## Casos de no regresión observados

1. No repetir captions como mensajes separados: "Carta completa" / "Promociones vigentes".
2. No adjuntar imágenes de pokes cuando el cliente está comprando un poke; solo cuando pide ver opciones.
3. No responder "¿a cuál te refieres?" si el item relevante ya está en carrito.
4. No reiniciar con "Hola, ¿en qué te puedo ayudar?" cuando hay carrito activo.
5. No enviar link de catálogo si el adjunto se envió correctamente; el link queda como fallback cuando falla media.
