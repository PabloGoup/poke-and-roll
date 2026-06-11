---
name: especialista-supabase-realtime-ui
role: Oleada 6 — suscripciones en tiempo real para la pantalla de cocina
---

# Especialista Supabase Realtime + UI

## Propósito

Implementar las suscripciones Supabase Realtime que mantienen la pantalla de cocina
actualizada sin necesidad de polling, con reconexión automática y estado de conexión visible.

## Contexto

- **Proyecto:** `/Users/ptoledos/Pizza_and_roll`
- **Archivo a crear:** `src/features/kitchen/hooks/use-kitchen-tickets.ts`

## Tarea 1 — Hook `use-kitchen-tickets.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { KitchenTicketWithOrder } from '@/types/domain';

export type ConnectionStatus = 'conectado' | 'reconectando' | 'error';

export function useKitchenTickets() {
  const [tickets, setTickets] = useState<KitchenTicketWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus>('reconectando');

  const cargarTickets = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('kitchen_tickets')
      .select(`
        *,
        order:orders(
          id, number, source, type, notes, customer_name_snapshot,
          order_items(
            id, quantity, unit_price, notes,
            product:products(name, category:product_categories(name)),
            variant:product_variants(name),
            order_item_modifiers(modifier_name_snapshot, price_delta)
          )
        )
      `)
      .in('status', ['pendiente', 'en_preparacion'])
      .order('created_at', { ascending: true });

    if (data) setTickets(data as KitchenTicketWithOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarTickets();

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('kitchen-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kitchen_tickets',
      }, () => {
        // Al cualquier cambio en kitchen_tickets, recargar
        cargarTickets();
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') setStatus('conectado');
        else if (state === 'CHANNEL_ERROR') setStatus('error');
        else setStatus('reconectando');
      });

    return () => { supabase.removeChannel(channel); };
  }, [cargarTickets]);

  const iniciarTicket = async (ticketId: string) => {
    const supabase = getSupabaseClient();
    await supabase
      .from('kitchen_tickets')
      .update({ status: 'en_preparacion' })
      .eq('id', ticketId);
    // La suscripción realtime lo actualizará automáticamente
  };

  const marcarListo = async (ticketId: string) => {
    const supabase = getSupabaseClient();
    // Actualizar kitchen_ticket
    await supabase
      .from('kitchen_tickets')
      .update({ status: 'listo' })
      .eq('id', ticketId);
    // Actualizar order (esto dispara el webhook de Supabase hacia Poke and roll)
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket?.order?.id) {
      await supabase
        .from('orders')
        .update({ status: 'listo' })
        .eq('id', ticket.order.id);
    }
  };

  return { tickets, loading, status, iniciarTicket, marcarListo };
}
```

## Tarea 2 — Indicador de conexión

En la pantalla de cocina, mostrar el estado de conexión Realtime:
- 🟢 Conectado — actualizaciones en tiempo real
- 🟡 Reconectando... — intentando reconectar
- 🔴 Sin conexión — actualizar manualmente

## Entregables

- `use-kitchen-tickets.ts` funcionando con Realtime
- `marcarListo()` dispara el cambio en `orders.status` que activa el webhook hacia Poke and roll
