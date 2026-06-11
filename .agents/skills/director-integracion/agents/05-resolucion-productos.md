---
name: especialista-resolucion-productos
role: Oleada 1 — lookup nombre→UUID de productos (CRÍTICO para crear órdenes)
---

# Especialista en Resolución de Productos

## Propósito

El chatbot recibe texto libre del cliente ("quiero 2 poke de salmón sin palta").
Para crear la orden en Supabase, necesita el UUID real del producto "Poke Salmón"
en la tabla `products`. Este agente implementa el puente entre texto y UUIDs.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a crear:** `lib/supabase-pedidos.ts`
- **Depende de:** Agente 06 (RPC `buscar_productos_activos()` debe estar lista)
- **Bloqueante resuelto:** BLOQUEO 2

## Leer antes de empezar

- `references/shared-types.md` — interfaces `ProductoResuelto`, `ItemCarritoWA`
- `references/api-contracts.md` — Contrato 2 (`buscar_productos_activos`) y Contrato 5

## Tarea 1 — Crear `lib/supabase-pedidos.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { ItemCarritoWA, ProductoResuelto, ResultadoOrdenWA, SesionPedidoCtx } from './modulos/types';

const supabase = createClient(
  process.env.SUPABASE_PEDIDOS_URL!,
  process.env.SUPABASE_PEDIDOS_ANON_KEY!
);

// Cache en memoria con TTL de 5 minutos
let catalogoCache: ProductoResuelto[] | null = null;
let catalogoCacheAt: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function obtenerCatalogoProductos(): Promise<ProductoResuelto[]> {
  if (catalogoCache && Date.now() - catalogoCacheAt < CACHE_TTL_MS) {
    return catalogoCache;
  }
  const { data, error } = await supabase.rpc('buscar_productos_activos');
  if (error) throw new Error(`Error obteniendo catálogo: ${error.message}`);
  catalogoCache = (data as ProductoResuelto[]) ?? [];
  catalogoCacheAt = Date.now();
  return catalogoCache;
}

export function invalidarCacheProductos() {
  catalogoCache = null;
}
```

## Tarea 2 — Implementar `resolverItemsCarrito()`

Estrategia de matching (de más estricto a más flexible):
1. Match exacto de nombre (case-insensitive)
2. El nombre del catálogo contiene el texto del cliente
3. El texto del cliente contiene el nombre del catálogo
4. Match de palabras clave (tokenizar por espacios, match de todas las palabras clave)

```typescript
export async function resolverItemsCarrito(
  items: { nombre: string; cantidad: number; notas?: string }[]
): Promise<{ resueltos: ItemCarritoWA[]; noEncontrados: string[] }> {
  const catalogo = await obtenerCatalogoProductos();
  const resueltos: ItemCarritoWA[] = [];
  const noEncontrados: string[] = [];

  for (const item of items) {
    const nombreNorm = normalizar(item.nombre);
    
    // Nivel 1: match exacto
    let producto = catalogo.find(p => normalizar(p.productName) === nombreNorm);
    
    // Nivel 2: el catálogo contiene el texto del cliente
    if (!producto) {
      producto = catalogo.find(p => normalizar(p.productName).includes(nombreNorm));
    }
    
    // Nivel 3: el texto del cliente contiene el nombre del catálogo
    if (!producto) {
      producto = catalogo.find(p => nombreNorm.includes(normalizar(p.productName)));
    }
    
    // Nivel 4: match por palabras clave (todas deben estar presentes)
    if (!producto) {
      const palabras = nombreNorm.split(/\s+/).filter(p => p.length > 2);
      producto = catalogo.find(p => {
        const nombreCatalogo = normalizar(p.productName);
        return palabras.every(palabra => nombreCatalogo.includes(palabra));
      });
    }

    if (producto && producto.status === 'activo') {
      resueltos.push({
        id: crypto.randomUUID(),
        productId: producto.productId,
        productName: producto.productName,
        categoryName: producto.categoryName,
        quantity: item.cantidad,
        unitPrice: producto.unitPrice,
        notes: item.notas ?? '',
        modifiers: [],
      });
    } else {
      noEncontrados.push(item.nombre);
    }
  }

  return { resueltos, noEncontrados };
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar tildes
    .trim();
}
```

## Tarea 3 — Implementar `crearOrdenWhatsApp()`

```typescript
export async function crearOrdenWhatsApp(sesion: SesionPedidoCtx): Promise<ResultadoOrdenWA> {
  const { data, error } = await supabase.rpc('create_storefront_order', {
    payload: {
      cart: sesion.items,
      checkout: {
        source: 'whatsapp',
        type: sesion.modalidad ?? 'retiro_local',
        paymentMethod: sesion.metodoPago ?? 'efectivo',
        paymentBreakdown: { cash: 0, card: 0, transfer: 0 },
        discountAmount: 0,
        promotionAmount: 0,
        deliveryFee: sesion.costoDespacho ?? 0,
        extraCharges: [],
        customerName: sesion.nombreCliente ?? '',
        customerPhone: (sesion.telefonoCliente ?? '').replace(/\D/g, ''),
        addressLabel: 'Delivery',
        addressStreet: sesion.direccion?.street ?? '',
        addressDistrict: sesion.direccion?.district ?? '',
        addressReference: sesion.direccion?.reference ?? '',
        notes: '',
      },
    },
  });
  if (error) throw new Error(error.message);
  return data as ResultadoOrdenWA;
}

export async function obtenerPerfilCliente(telefono: string) {
  const { data, error } = await supabase.rpc('get_storefront_customer_profile', {
    customer_phone: telefono.replace(/\D/g, ''),
  });
  if (error) return null;
  return data;
}

export async function consultarEstadoOrden(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, number, status, estimated_ready_at')
    .eq('id', orderId)
    .single();
  if (error) return null;
  return data;
}
```

## Entregables

- `lib/supabase-pedidos.ts` completo y exportando todas las funciones
- Confirmar a Agentes 15/16 que pueden importar `resolverItemsCarrito` y `crearOrdenWhatsApp`
