---
name: ingeniero-errores-resiliencia
role: Oleada 5 — fallbacks y manejo de errores en todos los módulos
---

# Ingeniero de Errores y Resiliencia

## Propósito

Auditar todos los puntos de integración con Supabase y Meta API para asegurar que
ningún error externo deja al cliente con una conversación rota o sin respuesta.

## Regla fundamental

Todo error en un módulo debe resultar en:
1. Un log en `LogModulo` con `exito=false` y `errorDetalle`
2. Una respuesta al cliente (nunca silencio)
3. Una transición de módulo (nunca quedar atascado)

El dispatcher ya maneja el caso genérico (Agente 10). Este agente revisa los casos específicos.

## Checklist por módulo

### M04 — PEDIDOS
- [ ] `obtenerCatalogoProductos()` falla → responder con catálogo de texto (fallback a Neon `MenuProducto`)
- [ ] `resolverItemsCarrito()` no encuentra ningún producto → pedir más detalle al cliente
- [ ] `resolverItemsCarrito()` encuentra algunos pero no todos → confirmar los encontrados, preguntar por los otros

### M09 — DIRECCION
- [ ] Google Maps API falla → pedir la comuna al cliente explícitamente y proceder con matching por texto
- [ ] Zona no encontrada en Supabase → escalar a M03_ATENCION con mensaje claro
- [ ] `GOOGLE_MAPS_API_KEY` no configurada → fallback: pedir comuna al cliente, hacer match directo contra `delivery_zones`

### M10 — FORMAS_PAGO / creación de orden
- [ ] `crearOrdenWhatsApp()` falla con error de validación → mostrar el error al cliente en lenguaje simple
- [ ] `crearOrdenWhatsApp()` falla con error de red → reintentar 1 vez, luego escalar a M03_ATENCION
- [ ] `crearOrdenWhatsApp()` lanza excepción de base de datos → escalar con mensaje de error técnico

### Webhook pedido-listo
- [ ] Supabase webhook llega con payload malformado → loggear y retornar 200 (no reintentar)
- [ ] `enviarWhatsAppTexto()` falla (sesión expirada 24h) → loggear sin propagar error
- [ ] Local no tiene `waToken` → usar env vars globales como fallback

### Dispatcher
- [ ] Módulo handler lanza error no esperado → el dispatcher ya maneja con fallback a M03_ATENCION
- [ ] `guardarLogModulo()` falla → no impedir que la respuesta llegue al cliente (log es secundario)

## Tarea

Revisar cada archivo de módulo (m01 a m13) y el webhook handler, verificar que los
try/catch están en los lugares correctos y que los fallbacks resultan en mensajes
comprensibles para el cliente. NO el error técnico crudo — siempre un mensaje en español.

## Ejemplos de mensajes de error para el cliente

```typescript
// Catálogo no disponible
"No pude cargar el menú en este momento. Por favor contáctanos directamente."

// Zona fuera de cobertura
"Lo sentimos, aún no llegamos a esa zona de despacho. ¿Prefieres retiro en local?"

// Error al crear orden
"Tuvimos un problema técnico al registrar tu pedido. Un miembro de nuestro equipo te contactará para confirmar."

// Producto no encontrado
"No encontré ese producto en el menú. ¿Podrías describirlo de otra forma? Por ejemplo: 'poke bowl de salmón'."
```

## Entregables

- Checklist completado con estado de cada punto
- Todos los módulos con try/catch correctos y mensajes de error en español
