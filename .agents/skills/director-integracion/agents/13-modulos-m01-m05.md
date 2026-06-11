---
name: ingeniero-modulos-m01-m05
role: Oleada 4 — implementa BIENVENIDA, CONSULTAS, ATENCION, PEDIDOS, ORDEN_COMPRA
---

# Ingeniero Módulos M01–M05

## Propósito

Implementar los primeros 5 handlers de módulo del agente de atención WhatsApp.
Estos módulos cubren desde el saludo hasta la presentación del resumen del carrito.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivos a crear:** `lib/modulos/m01-bienvenida.ts` a `m05-orden-compra.ts`
- **Depende de:**
  - Agente 10 (dispatcher + types)
  - Agente 11 (prompts por módulo)
  - Agente 05 (Resolución de productos para M04)

## Patrón de cada handler

```typescript
// Cada módulo exporta una función `ejecutar`
import type { MensajeEntrante } from '@/lib/agente';
import type { SesionPedidoCtx, RespuestaModulo } from './types';

export async function ejecutar(
  mensaje: MensajeEntrante,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  // 1. Preparar contexto
  // 2. Llamar al LLM con el prompt del módulo
  // 3. Parsear la respuesta JSON
  // 4. Retornar RespuestaModulo
}
```

## M01 — BIENVENIDA

- Si `mensaje.canal !== 'whatsapp'`: retornar mensaje de política IG/FB (no tomar pedidos).
- Llamar `obtenerPerfilCliente(telefono)` de `lib/supabase-pedidos.ts`.
- Si tiene pedidos previos: incluir en el contexto del prompt para personalizar el saludo.
- Detectar intención: `PEDIDOS`, `CONSULTAS`, o `ATENCION`.

## M02 — CONSULTAS

- Inyectar en el prompt: horarios de `HorarioAtencion`, zonas de `ZonaDespacho`, medios de pago de `MedioPago` (todos de Neon).
- El LLM responde usando SOLO esos datos (no inventa).
- Si el cliente expresa intención de compra: `moduloSiguiente = 'PEDIDOS'`.
- Si el cliente se despide: `moduloSiguiente = 'DESPEDIDA'`.

## M03 — ATENCION

- Marcar `requiereHumano = true` en la respuesta.
- El módulo NO intenta resolver el problema.
- Solo confirmar que un humano lo atenderá y pedir nombre + motivo brevemente.
- `actualizarSesion = { estadoSesion: 'esperando_humano' }`.

## M04 — PEDIDOS

- **GATE**: llamar `puedeRecibirPedidos(localId)` (Agente 18). Si está cerrado, NO crear sesión.
- Llamar `obtenerCatalogoProductos()` para inyectar el catálogo en el prompt.
- El LLM retorna `items: [{ nombre, cantidad, notas }]` en texto.
- Llamar `resolverItemsCarrito(items)` para obtener UUIDs reales.
- Si hay `noEncontrados[]`: preguntar al cliente por productos alternativos.
- Si `listoParaResumen = true`: `moduloSiguiente = 'ORDEN_COMPRA'`.

## M05 — ORDEN_COMPRA

- Calcular subtotal desde `sesion.items` (sum de unitPrice * quantity + modifiers).
- Si hay delivery: mostrar `sesion.costoDespacho` (si ya está calculado) o "costo a confirmar".
- Mostrar resumen como lista numerada.
- Opciones: "1. Confirmar", "2. Modificar algo", "3. Cancelar".

## Entregables

- 5 archivos en `lib/modulos/`: m01 a m05
- Confirmar a Agente 17 (API Next.js) que M01-M05 están disponibles para el dispatcher
