# Flujo de Módulos del Agente WhatsApp

## Flujo Principal

```text
INICIO
  -> M01_BIENVENIDA
  -> M04_PEDIDOS
  -> M05_ORDEN_COMPRA
  -> M07_CONFIRMACION
  -> M08_TIPO_ENTREGA
  -> M09_DIRECCION?       solo delivery
  -> M10_FORMAS_PAGO
  -> M11_DAR_GRACIAS
  -> M12_ENTREGA          solo por webhook pedido-listo
  -> M13_DESPEDIDA
```

## Reglas Por Canal

- WhatsApp: canal operativo para pedidos.
- Sitio web: canal operativo para pedidos.
- Presencial/POS: canal operativo para pedidos.
- Instagram/Facebook: derivación a WhatsApp o sitio, dudas, campañas, noticias y marketing. No gestionan pedidos.

## M01_BIENVENIDA

- Saluda al cliente y detecta intención.
- Si el cliente quiere pedir, avanza a `M04_PEDIDOS`.
- Si pregunta algo general, avanza a `M02_CONSULTAS`.
- Si hay reclamo o riesgo, avanza a `M03_ATENCION`.

## M02_CONSULTAS

- Responde dudas sobre horarios, ubicación, menú, promociones, delivery y medios de pago.
- Si detecta intención de compra, invita a continuar por WhatsApp/pedido y avanza a `M04_PEDIDOS`.

## M03_ATENCION

- Marca `requiereHumano`.
- Escala reclamos complejos, enojo fuerte, datos incompletos, alergias severas o riesgo de promesa falsa.

## M04_PEDIDOS

- Recolecta productos, cantidades y notas.
- Resuelve productos contra Supabase con UUID real.
- Distingue:
  - Quitar ingrediente: gratis, debe quedar como nota.
  - Cambiar interior principal: recargo según regla comercial vigente.
  - Cambiar envoltura: recargo según regla comercial vigente.
- Si hay dudas de stock o preparación, escala a humano.

## M05_ORDEN_COMPRA

- Resume carrito, precios y notas.
- Permite modificar antes de confirmar.

## M06_ORDEN_CANCELACION

- Cancela sesiones activas antes de cocina.
- Si la orden ya está en preparación/lista, escala a humano.

## M07_CONFIRMACION

- Pide confirmación explícita.
- Tras 3 intentos sin confirmación, cancela o escala según contexto.

## M08_TIPO_ENTREGA

- Define `retiro_local` o `despacho`.
- Retiro pasa directo a `M10_FORMAS_PAGO`.
- Delivery pasa a `M09_DIRECCION`.

## M09_DIRECCION

- Pide calle, número, comuna y referencia opcional.
- Valida cobertura contra `delivery_zones.district` de Supabase.
- Informa costo y tiempo estimado antes de pago.

## M10_FORMAS_PAGO

- Recolecta método de pago.
- Soporta `efectivo`, `tarjeta`, `transferencia` y `mixto` si la RPC/enum lo permite.
- Crea la orden vía `crearOrdenWhatsApp()`.
- Envía `source = "whatsapp"` y `cashier_id = WHATSAPP_BOT_CASHIER_ID` si existe.

## M11_DAR_GRACIAS

- Confirma número de pedido y tiempo estimado.
- Mantiene la sesión consultable mientras cocina prepara.

## M12_ENTREGA

- Se activa por webhook `pedido-listo`, no por mensaje del cliente.
- Retiro: "Tu pedido {number} está listo. Puedes pasar a retirarlo cuando quieras."
- Delivery: "Tu pedido {number} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato."
- No dice "va en camino" solo porque cocina marcó `listo`.

## M13_DESPEDIDA

- Cierre breve.
- Marca sesión como `completada` o `cancelada`.

## Triggers Globales

| Trigger | Destino |
|---|---|
| Cancelación explícita | M06_ORDEN_CANCELACION |
| Alergia severa | M03_ATENCION |
| Reclamo complejo | M03_ATENCION |
| Consulta durante espera | M02_CONSULTAS |
| Pedido listo desde Supabase | M12_ENTREGA |

## Logging

Cada módulo debe registrar en `LogModulo`:

- módulo ejecutado
- éxito/error
- duración
- transición
- detalle útil para auditoría
