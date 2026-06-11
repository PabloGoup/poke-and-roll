# Contratos de API — Poke and roll ↔ Pizza_and_roll

Leer antes de tocar cualquier código que cruce la frontera entre ambos proyectos.

## Contrato 1 — RPC `create_storefront_order`

**Proyecto:** Pizza_and_roll  
**Archivo:** `/Users/ptoledos/Pizza_and_roll/supabase/add_storefront_checkout_profiles.sql`

La RPC recibe un único parámetro `payload jsonb` con `cart` y `checkout`.

### Payload

```json
{
  "cart": [
    {
      "id": "cuid-local",
      "productId": "uuid-real-de-supabase",
      "productName": "Poke Salmón",
      "categoryName": "Pokes",
      "quantity": 2,
      "unitPrice": 9900,
      "notes": "sin palta",
      "variantId": null,
      "variantName": null,
      "modifiers": [
        { "id": "uuid-modifier", "name": "Extra salsa", "priceDelta": 500 }
      ]
    }
  ],
  "checkout": {
    "source": "whatsapp",
    "cashier_id": "uuid-perfil-bot-whatsapp",
    "type": "retiro_local",
    "paymentMethod": "efectivo",
    "paymentBreakdown": { "cash": 19800, "card": 0, "transfer": 0 },
    "discountAmount": 0,
    "promotionAmount": 0,
    "deliveryFee": 0,
    "extraCharges": [],
    "customerName": "Juan Pérez",
    "customerPhone": "56912345678",
    "addressLabel": "Casa",
    "addressStreet": "",
    "addressDistrict": "",
    "addressReference": "",
    "notes": "sin palta en el roll"
  }
}
```

### Reglas

- `checkout.source` debe aceptar `whatsapp`, `web` o `pos`.
- `checkout.cashier_id` debe ser `WHATSAPP_BOT_CASHIER_ID` cuando la orden nace desde WhatsApp.
- `cart[].productId` debe ser UUID real de `public.products`.
- `paymentMethod` puede ser `efectivo`, `tarjeta`, `transferencia` o `mixto` si el enum de Supabase lo soporta.
- Si `paymentMethod = "mixto"`, `paymentBreakdown.cash + card + transfer` debe cuadrar con el total final.
- `product_variants.price` se interpreta como precio absoluto, no como delta.

### Respuesta Exitosa

```json
{
  "orderId": "uuid",
  "number": "PR-1042",
  "total": 19800,
  "estimatedReadyAt": "2026-06-10T20:35:00Z",
  "customerId": "uuid"
}
```

### Errores Que Debe Manejar El Agente

| Mensaje | Módulo |
|---|---|
| "Agrega al menos un producto al carrito." | M04_PEDIDOS |
| "Debes indicar nombre y teléfono válidos." | M10_FORMAS_PAGO |
| "Para despacho debes completar dirección y comuna." | M09_DIRECCION |
| "La comuna indicada no tiene cobertura de despacho." | M09_DIRECCION → M03_ATENCION |
| "El pago mixto debe cuadrar con el total final." | M10_FORMAS_PAGO |

## Contrato 2 — RPC `buscar_productos_activos`

**Proyecto:** Pizza_and_roll  
**Propósito:** devolver catálogo activo con UUIDs reales para resolver texto libre del cliente.

### SQL De Referencia

```sql
create or replace function public.buscar_productos_activos()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'categoryName', pc.name,
      'unitPrice', p.base_price,
      'status', p.status,
      'description', p.description,
      'imageUrl', p.image_url,
      'variants', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'id', v.id,
            'name', v.name,
            'price', v.price
          )
        ), '[]'::jsonb)
        from public.product_variants v
        where v.product_id = p.id
      ),
      'modifierGroups', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'id', mg.id,
            'name', mg.name,
            'isRequired', mg.is_required,
            'modifiers', (
              select coalesce(jsonb_agg(
                jsonb_build_object(
                  'id', m.id,
                  'name', m.name,
                  'priceDelta', m.price_delta
                )
              ), '[]'::jsonb)
              from public.product_modifiers m
              where m.modifier_group_id = mg.id
            )
          )
        ), '[]'::jsonb)
        from public.product_modifier_groups mg
        where mg.product_id = p.id
      )
    )
  )
  into resultado
  from public.products p
  join public.product_categories pc on pc.id = p.category_id
  where p.status = 'activo';

  return coalesce(resultado, '[]'::jsonb);
end;
$$;
```

**Importante:** `product_variants` no tiene columna `is_active`; no filtrar por ese campo.

## Contrato 3 — RPC `get_storefront_customer_profile`

Usar tal como está en Pizza_and_roll.

```typescript
supabase.rpc("get_storefront_customer_profile", {
  customer_phone: "56912345678",
});
```

M01 puede usar `recentOrders` para ofrecer repetir pedido, pero antes de crear orden debe resolver productos nuevamente a UUID real con `resolverItemsCarrito()`.

## Contrato 4 — Webhook `POST /api/webhooks/pedido-listo`

**Proyecto:** Poke and roll  
**Disparado por:** Supabase Database Webhook cuando `orders.status` cambia a `listo`.

### Header

```http
x-webhook-secret: <SUPABASE_PEDIDOS_WEBHOOK_SECRET_ROTADO>
```

### Payload

```json
{
  "type": "UPDATE",
  "table": "orders",
  "schema": "public",
  "record": {
    "id": "uuid",
    "number": "PR-1042",
    "status": "listo",
    "source": "whatsapp",
    "customer_phone_snapshot": "56912345678",
    "customer_name_snapshot": "Juan Pérez",
    "type": "retiro_local"
  },
  "old_record": {
    "status": "en_preparacion"
  }
}
```

### Condiciones

- `record.status === "listo"`
- `old_record.status !== "listo"`
- `record.source === "whatsapp"`
- `record.customer_phone_snapshot` existe
- No hay log exitoso previo de `ENTREGA` para esa orden

### Mensajes

```text
Retiro: "Tu pedido {number} está listo. Puedes pasar a retirarlo cuando quieras."
Delivery: "Tu pedido {number} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato."
```

No usar "va en camino" en este webhook, porque `listo` solo confirma que cocina terminó.

## Contrato 5 — `lib/supabase-pedidos.ts`

Funciones públicas:

```typescript
obtenerCatalogoProductos(): Promise<ProductoResuelto[]>
resolverItemsCarrito(items: { nombre: string; cantidad: number; notas?: string }[]): Promise<{
  resueltos: ItemCarritoWA[];
  noEncontrados: string[];
}>
crearOrdenWhatsApp(sesion: SesionPedidoCtx): Promise<ResultadoOrdenWA>
obtenerPerfilCliente(telefono: string): Promise<unknown | null>
consultarEstadoOrden(orderId: string): Promise<{ status: string; number: string } | null>
cancelarOrdenSupabase(orderId: string): Promise<boolean>
```

## Variables

```env
SUPABASE_PEDIDOS_URL=https://<project-ref>.supabase.co
SUPABASE_PEDIDOS_ANON_KEY=<anon-or-publishable-key>
SUPABASE_PEDIDOS_WEBHOOK_SECRET=<rotated-secret>
WHATSAPP_BOT_CASHIER_ID=<uuid-existing-profile>
```
