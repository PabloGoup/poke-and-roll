---
name: ingeniero-rpc-supabase
role: Oleada 1 — modifica y extiende funciones SQL en Pizza_and_roll
---

# Ingeniero RPC Supabase

## Propósito

Modificar la RPC `create_storefront_order` para aceptar el parámetro `source` (actualmente
hardcodeado como 'web') y crear la nueva función `buscar_productos_activos()` que permite
al chatbot resolver nombres de productos a UUIDs reales.

## Contexto

- **Proyecto:** `/Users/ptoledos/Pizza_and_roll`
- **Archivo a modificar:** `supabase/add_storefront_checkout_profiles.sql`
- **Schema:** `supabase/schema.sql`
- **Bloqueantes resueltos por este agente:** BLOQUEO 1 y parte del BLOQUEO 2

Leer `references/bloqueantes.md` antes de empezar.
Leer `references/api-contracts.md` — Contrato 1 y Contrato 2.

## Tarea 1 — Modificar `create_storefront_order`

En el archivo SQL, localizar el bloque `declare` y agregar:

```sql
order_source public.order_source := coalesce(
  (checkout->>'source')::public.order_source,
  'web'
);
```

Luego en el `INSERT INTO public.orders`, reemplazar el literal `'web'` por `order_source`:

```sql
-- ANTES:
'web',

-- DESPUÉS:
order_source,
```

**Importante:** El cast `::public.order_source` fallará si se pasa un valor inválido.
El `coalesce` con `'web'` asegura que los llamados existentes (desde el storefront web
y el POS) no se rompan.

## Tarea 2 — Crear `buscar_productos_activos()`

Agregar al final de `supabase/add_storefront_checkout_profiles.sql`:

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
      'description', coalesce(p.description, ''),
      'imageUrl', p.image_url,
      'variants', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'id', v.id,
            'name', v.name,
            'priceModifier', coalesce(v.price_modifier, 0)
          ) order by v.name
        ), '[]'::jsonb)
        from public.product_variants v
        where v.product_id = p.id and v.is_active = true
      ),
      'modifierGroups', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'id', mg.id,
            'name', mg.name,
            'isRequired', coalesce(mg.is_required, false),
            'modifiers', (
              select coalesce(jsonb_agg(
                jsonb_build_object(
                  'id', m.id,
                  'name', m.name,
                  'priceDelta', coalesce(m.price_delta, 0)
                ) order by m.name
              ), '[]'::jsonb)
              from public.product_modifiers m
              where m.modifier_group_id = mg.id
            )
          ) order by mg.name
        ), '[]'::jsonb)
        from public.product_modifier_groups mg
        where mg.product_id = p.id
      )
    ) order by pc.sort_order, p.name
  )
  into resultado
  from public.products p
  join public.product_categories pc on pc.id = p.category_id
  where p.status = 'activo';

  return coalesce(resultado, '[]'::jsonb);
end;
$$;

-- Permitir acceso anónimo (para el chatbot de Poke and roll)
grant execute on function public.buscar_productos_activos() to anon;
```

## Tarea 3 — Verificar RLS

Asegurarse de que la política `"products public storefront read"` incluye:
```sql
using (status = 'activo')
```

Si no existe la política de acceso anon para `buscar_productos_activos`, el `grant execute` del paso anterior debería ser suficiente dado que la función es `SECURITY DEFINER`.

## Tarea 4 — Aplicar cambios en Supabase

Los cambios de SQL deben ejecutarse en el panel de Supabase del proyecto Pizza_and_roll:
Dashboard → SQL Editor → pegar y ejecutar los cambios.

Alternativamente, si hay Supabase CLI configurado:
```bash
cd "/Users/ptoledos/Pizza_and_roll"
supabase db push
```

## Entregables

- `create_storefront_order` modificada y probada (insertar una orden con `source='whatsapp'`)
- `buscar_productos_activos()` creada y probada (devuelve JSON con productos activos)
- Confirmar a Agente 07 (Resolución de Productos) que las RPCs están listas
