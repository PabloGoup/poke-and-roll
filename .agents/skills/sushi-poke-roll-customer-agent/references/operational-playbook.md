# Operational Playbook

## Source Of Truth

Catalog and sales data:

- Supabase ventas:
  - `products`
  - `product_categories`
  - `product_variants`
  - `product_modifier_groups`
  - `product_modifiers`
  - `promotions`
  - `delivery_zones`
  - `store_settings`

Agent configuration and audit:

- Prisma / Neon:
  - `reglas_comerciales_agente`
  - `items_comerciales_destacados`
  - `catalogos_visuales_agente`
  - conversations, messages, decisions, complaints, alerts

## Visual Catalog

Use the visual catalog as first option when:

- Customer asks for menu, carta, catalogo, precios, promociones, "que tienen", "mandame la carta".
- There is a `CatalogoVisualAgente` with `prioridadEnvio = true`.
- The `catalogo-visual` rule is active.

Expected behavior:

1. Offer/send the visual catalog first.
2. Add a short text recommendation.
3. Ask what they want to order or what preference they have.

Example:

> Te envio el catalogo visual para que lo revises rapido. Si quieres algo para compartir, te recomiendo mirar las promos de pokes y rolls. ¿Es para delivery o retiro?

## Add-ons

Use these only if no configured modifier data is available:

- Cambio normal: $1.000
- Cambio por salmon: $1.500
- Cambio por carne: $1.500
- Palta extra: $500
- Salsa extra: $500

If modifiers exist in Supabase, use modifier prices from Supabase instead of these defaults.

## Removing Ingredients Or Products

Removing an ingredient or product from an item has no additional cost.

Agent behavior:

1. Confirm the removal is possible without extra charge.
2. Ask for the exact product and ingredient/product to remove when missing.
3. State that it will be recorded as an order observation for kitchen.
4. Do not escalate to human just because the customer asks to remove palta, cebollin, queso crema, salsa, or another component.
5. If the customer declares a serious allergy, keep the same no-cost rule but ask for explicit confirmation and mark the observation clearly.

Example:

> Si, podemos dejarlo sin palta sin costo adicional. Lo registrare como observacion de la orden para cocina. ¿Que roll quieres pedir?

## Delivery And Pickup

- Pickup/retiro: no cost.
- Delivery/despacho: use `delivery_zones.fee` when available.
- If zone/address is unknown, ask for address before confirming delivery cost.
- Do not promise exact delivery time unless current load/settings are available.

Fallback delivery cost only when no zone data exists:

- Despacho base: $2.000

## Time Estimate Logic

Estimate time from:

- Pending orders
- Product count
- Product complexity
- Modifications
- Store settings:
  - `pickup_base_minutes`
  - `delivery_base_minutes`
  - `per_pending_order_minutes`
  - `high_load_threshold`

Complexity weights:

- Handroll: 1
- Roll: 2
- Poke: 3
- Promo pequena: 5
- Promo mediana: 8
- Promo familiar: 10

Use estimates as ranges, not exact guarantees.

## Sales Recommendation Patterns

For broad "que recomiendas":

1. Ask if they prefer rolls, pokes, sushi burger, hot/fried, salmon, chicken, veggie.
2. If catalog has active commercial item/roll of day, offer it.
3. Include price and a closing question.

For people count:

- 1 person: individual roll, hand roll, poke, sushi burger.
- 2 people: promo for 2, two pokes, shared rolls if configured.
- 3-4 people: shareable promos, multiple pokes, larger combos if configured.
- More than 4: ask budget and modality; avoid inventing family combo.

For promotions:

- If `promotions.type` is percentage/horario/descuento, describe it as discount/condition, not final price.
- Only present as final price when the promotion type represents fixed price.

## Complaint Escalation

Escalate to human when:

- Customer is angry or threatens complaint.
- Delay, wrong order, cold food, cancellation, refund, missing item.
- Allergy risk or food safety concern.
- Pedido large/corporate with special conditions.
- Data needed to answer is missing.

Complaint response pattern:

> Lo siento mucho. Para revisarlo con el equipo, enviame nombre y numero de pedido o telefono asociado. Voy a derivarlo a una persona.

## Test Cases

Use these when validating the agent:

- "Tienen sushi burger de pollo? cuanto sale?"
- "Que promociones tienen?"
- "Mandame la carta"
- "Cuanto vale el combo para 4 personas con bebidas?"
- "Quiero algo sin palta, soy alergica"
- "Mi pedido lleva una hora y quiero cancelar"
- "Cuanto sale delivery a [comuna/direccion]?"
- "Puedo retirar en local?"
