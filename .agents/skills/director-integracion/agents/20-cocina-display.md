---
name: ingeniero-cocina-display
role: Oleada 6 — pantalla de cocina en Pizza_and_roll
---

# Ingeniero Cocina Display

## Propósito

Crear la pantalla de cocina que el jefe y ayudantes usan para ver los pedidos
en preparación en tiempo real, organizados por área de producción.

## Contexto

- **Proyecto:** `/Users/ptoledos/Pizza_and_roll`
- **Archivos a crear:**
  - `src/features/kitchen/pages/kitchen-display-page.tsx`
  - `src/features/kitchen/components/ticket-card.tsx`
- **Datos:** tabla `kitchen_tickets` JOIN `orders` JOIN `order_items`

## Tarea 1 — Estructura de la página

```
/cocina  →  KitchenDisplayPage
  │
  ├── Header: "COCINA — Poke & Roll" + indicador de conexión Realtime
  │
  ├── Columna PENDIENTES
  │   └── Tickets con status='pendiente', ordenados por created_at ASC
  │
  ├── Columna EN PREPARACIÓN
  │   └── Tickets con status='en_preparacion', con cronómetro
  │
  └── Sin columna LISTO (esos ya salen de la vista)
```

## Tarea 2 — TicketCard

Cada tarjeta muestra:
- **Número de orden** (PR-1042) en grande
- **Badge de canal**: WhatsApp 🟢 / Web 🌐 / Presencial 🏪
- **Tipo**: Retiro 🏪 / Delivery 🛵
- **Items** con modificadores y notas (ej: "Poke Salmón ×2 — sin palta")
- **Cronómetro** desde `created_at`
- **Color de urgencia**: verde (<10 min), amarillo (10-20 min), rojo (>20 min)
- **Botón "Iniciar"** → cambia status a `en_preparacion`
- **Botón "LISTO ✓"** → cambia status a `listo` (solo visible cuando está en_preparacion)

## Tarea 3 — Acceso sin login completo

La pantalla de cocina no debe requerir login de administrador.
Opciones (elegir la más simple):
- URL con token en query param: `/cocina?token=<KITCHEN_TOKEN>`
- PIN de 4 dígitos configurable en `store_settings`
- Ruta pública (sin auth) si el restaurante acepta el riesgo

Configurar `KITCHEN_TOKEN` en `.env.local` del proyecto.

## Tarea 4 — Separación por área (opcional, si los productos tienen categoría)

Basado en `order_items.category_name`:
- "Sushi" / "Rolls" → área Sushi 🍱
- "Pokes" / "Bowls" → área Cocina 🥗
- "Bebidas" / "Postres" → área Bebidas 🥤

Mostrar sub-sección dentro de cada ticket si los items son de áreas distintas.

## Entregables

- `src/features/kitchen/` con página + componente
- Ruta `/cocina` agregada al router de la app
- Botones Iniciar y LISTO funcionando con actualización en Supabase
