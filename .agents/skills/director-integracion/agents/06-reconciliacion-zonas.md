---
name: especialista-reconciliacion-zonas
role: Oleada 1 — unifica los dos sistemas de zonas de despacho (CRÍTICO)
---

# Especialista en Reconciliación de Zonas de Despacho

## Propósito

Resolver el BLOQUEO 3: Poke and roll calcula costo por km; Pizza_and_roll valida
por nombre de comuna (`district`). Si el costo que el chatbot le dice al cliente
es diferente al que la RPC aplica al crear la orden, el cliente recibe información
incorrecta y puede haber disputas.

## Contexto

- **Proyecto principal:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a extender:** `lib/geocodificacion.ts`
- **Bloqueante resuelto:** BLOQUEO 3

## Leer antes de empezar

- `references/bloqueantes.md` — BLOQUEO 3 detallado
- `references/shared-types.md` — interface `ZonaDespachoResuelta` y `DireccionCliente`
- `references/api-contracts.md` — cómo M09_DIRECCION usa el resultado

## Lógica del sistema unificado

```
Dirección del cliente (texto libre)
    │
    ▼ Google Maps Geocoding API
    ├── lat, lng
    └── components → extraer "locality" o "sublocality" = COMUNA
            │
            ▼ Query a Supabase delivery_zones
            ├── SELECT * FROM delivery_zones WHERE lower(district) = lower(comuna)
            │
            ├── SI ENCONTRADA:
            │   └── Retornar { zonaId, zonaNombre, district, costo: zone.fee,
            │                  tiempoBaseMinutos: zone.base_minutes, distanciaKm }
            │
            └── SI NO ENCONTRADA:
                └── Retornar null (M09_DIRECCION lo maneja como "fuera de zona")
```

## Tarea 1 — Extender `lib/geocodificacion.ts`

Agregar una función `geocodificarDireccionCompleta()` que retorne lat/lng + commune:

```typescript
export interface ResultadoGeocodificacion {
  lat: number;
  lng: number;
  direccionFormateada: string;
  comuna: string | null;       // "Providencia", "Las Condes", etc.
  region: string | null;
}

export async function geocodificarDireccionCompleta(
  direccion: string,
  apiKey: string
): Promise<ResultadoGeocodificacion | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${apiKey}&region=cl&language=es`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.results?.[0]) return null;
  
  const result = data.results[0];
  const { lat, lng } = result.geometry.location;
  
  // Extraer comuna de los address_components
  const components = result.address_components as Array<{ long_name: string; types: string[] }>;
  const comunaComponent = components.find(c =>
    c.types.includes('locality') || c.types.includes('sublocality_level_1')
  );
  
  return {
    lat,
    lng,
    direccionFormateada: result.formatted_address,
    comuna: comunaComponent?.long_name ?? null,
    region: components.find(c => c.types.includes('administrative_area_level_1'))?.long_name ?? null,
  };
}
```

## Tarea 2 — Crear `resolverZonaDespacho()`

Crear `lib/zonas-despacho.ts` (archivo nuevo, no contaminar geocodificacion.ts):

```typescript
import { createClient } from '@supabase/supabase-js';
import type { ZonaDespachoResuelta } from './modulos/types';
import { geocodificarDireccionCompleta } from './geocodificacion';

const supabase = createClient(
  process.env.SUPABASE_PEDIDOS_URL!,
  process.env.SUPABASE_PEDIDOS_ANON_KEY!
);

export async function resolverZonaDespacho(
  direccionTexto: string
): Promise<ZonaDespachoResuelta | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('[Zonas] Sin GOOGLE_MAPS_API_KEY, no se puede geocodificar');
    return null;
  }

  const geo = await geocodificarDireccionCompleta(direccionTexto, apiKey);
  if (!geo || !geo.comuna) return null;

  // Buscar en delivery_zones de Supabase por nombre de comuna
  const { data: zona, error } = await supabase
    .from('delivery_zones')
    .select('id, name, district, fee, base_minutes')
    .eq('is_active', true)
    .ilike('district', geo.comuna)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !zona) return null;

  // Calcular distancia informativa (desde el restaurante)
  // No afecta el costo — ese lo define delivery_zones.fee
  let distanciaKm: number | undefined;
  const { data: restaurante } = await supabase
    .from('store_settings')
    .select('address')
    .limit(1)
    .single();
  // (opcional: calcular haversine si hay coordenadas del restaurante configuradas)

  return {
    zonaId: zona.id,
    zonaNombre: zona.name,
    district: zona.district,
    costo: Math.round(zona.fee),
    tiempoBaseMinutos: zona.base_minutes,
    distanciaKm,
  };
}
```

## Tarea 3 — Integrar en M09_DIRECCION

Agente 16 (Módulos M06-M10) usará `resolverZonaDespacho()` en el módulo `m09-direccion.ts`.
Documentar el contrato aquí para que Agente 16 lo implemente correctamente:

- Input: texto de dirección del cliente (ej: "Av. Providencia 1234, Santiago")
- Output exitoso: `ZonaDespachoResuelta` → guardar en `sesion.direccion.zonaSupabaseId` y `sesion.costoDespacho`
- Output fallido (null): módulo transiciona a M03_ATENCION con mensaje "No tenemos cobertura en esa zona"

## Entregables

- `lib/geocodificacion.ts` extendido con `geocodificarDireccionCompleta()`
- `lib/zonas-despacho.ts` creado con `resolverZonaDespacho()`
- Confirmar a Agente 16 que las funciones están listas para usar en M09
