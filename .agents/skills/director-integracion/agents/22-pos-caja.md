---
name: ingeniero-pos-caja
role: Oleada 6 — actualiza el POS con badges de origen y documenta el impacto en caja
---

# Ingeniero POS + Caja

## Propósito

Actualizar las vistas del POS en Pizza_and_roll para identificar visualmente los pedidos
que vienen de WhatsApp, y documentar el impacto en la reconciliación de caja diaria.

## Contexto

- **Proyecto:** `/Users/ptoledos/Pizza_and_roll`
- **Archivos a modificar:** vistas de lista de pedidos en `src/features/sales/`

## Tarea 1 — Badge de origen en lista de pedidos

Localizar el componente que renderiza la lista de órdenes en el POS.
Agregar un badge condicional basado en `order.source`:

```typescript
const BADGE_CANAL = {
  whatsapp: { label: 'WhatsApp', color: 'bg-green-100 text-green-800', icon: '💬' },
  web:      { label: 'Web',      color: 'bg-blue-100 text-blue-800',   icon: '🌐' },
  pos:      { label: 'Local',    color: 'bg-gray-100 text-gray-800',   icon: '🏪' },
};

// En el componente de fila de orden:
<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_CANAL[order.source].color}`}>
  {BADGE_CANAL[order.source].icon} {BADGE_CANAL[order.source].label}
</span>
```

## Tarea 2 — Vista filtrada "Pedidos WhatsApp"

Agregar un filtro rápido en la vista de pedidos del POS:
- Tab "Todos" / Tab "WhatsApp" / Tab "Web" / Tab "Local"
- El tab "WhatsApp" filtra por `source = 'whatsapp'`
- Muestra `customer_name_snapshot` y `customer_phone_snapshot` prominentemente

## Tarea 3 — Documentar el impacto en caja (importante para el operador)

Las órdenes de WhatsApp deben traer `cashier_id = WHATSAPP_BOT_CASHIER_ID`, un perfil
técnico de cajero/bot. No nacen desde una sesión de caja humana abierta. Esto significa:

**Flujo de caja para pedidos WhatsApp:**
1. El cliente pide por WhatsApp → orden creada con source `whatsapp` y cashier técnico.
2. Cliente llega a retirar (o delivery) → **el cajero debe registrar el pago manualmente** en el POS.
3. El cajero busca la orden por número (PR-1042) en la vista "WhatsApp".
4. Selecciona la orden y usa "Registrar pago" para crear el `cash_movement` correspondiente.

Si esta funcionalidad de "Registrar pago post-hoc" no existe en el POS, crearla o documentar
el workaround para el operador hasta que se implemente.

## Entregables

- Badges de origen visibles en la lista de pedidos del POS
- Tab de filtro por canal
- Documento o comentario en código explicando el flujo de caja para pedidos WhatsApp
