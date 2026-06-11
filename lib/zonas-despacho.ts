import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import {
  calcularDistanciaKm,
  geocodificarConCache,
  geocodificarDireccion,
  type ZonaDespachoConRangos
} from "@/lib/geocodificacion";

export interface ZonaDespachoResuelta {
  zonaId: string;
  zonaNombre: string;
  district: string;
  costo: number;
  tiempoBaseMinutos: number;
  tiempoEstimadoMax: number;
  distanciaKm?: number;
}

export type ResultadoCoberturaDespacho =
  | {
      estado: "cubierto";
      zona: ZonaDespachoResuelta;
      lat?: number;
      lng?: number;
    }
  | {
      estado:
        | "sin_configuracion"
        | "sin_api_key"
        | "sin_direccion_base"
        | "direccion_no_geocodificada"
        | "fuera_cobertura";
      distanciaKm?: number;
      zonas?: ZonaDespachoConRangos[];
    };

// ── Cliente Supabase (pedidos) ────────────────────────────────────────────────
// La fuente AUTORITATIVA de zonas es delivery_zones en Supabase: es la misma
// tabla que valida la RPC create_storefront_order (lower(district) match).
// Si el costo cotizado al cliente no sale de aquí, la orden puede fallar o
// cobrar un valor distinto al informado (BLOQUEO 3).

function clienteSupabase() {
  const url = process.env.SUPABASE_PEDIDOS_URL;
  const key = process.env.SUPABASE_PEDIDOS_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

interface ZonaSupabase {
  id: string;
  name: string;
  district: string;
  fee: number;
  base_minutes: number;
}

async function buscarZonaSupabase(comuna: string): Promise<ZonaDespachoResuelta | null | undefined> {
  const supabase = clienteSupabase();
  if (!supabase) return undefined; // sin credenciales → no se pudo consultar

  const { data: zonas, error } = await supabase
    .from("delivery_zones")
    .select("id, name, district, fee, base_minutes")
    .eq("is_active", true);

  if (error) return undefined;          // error de red → caller decide fallback
  if (!zonas || zonas.length === 0) return undefined; // sin zonas configuradas en Supabase

  const comunaNorm = normalizar(comuna);
  const zona = (zonas as ZonaSupabase[]).find((z) => {
    const dNorm = normalizar(z.district);
    return dNorm === comunaNorm || dNorm.includes(comunaNorm) || comunaNorm.includes(dNorm);
  });

  if (!zona) return null; // hay zonas pero la comuna no está cubierta

  return {
    zonaId: zona.id,
    zonaNombre: zona.name,
    district: zona.district, // valor EXACTO de la DB — garantiza match en la RPC
    costo: Math.round(zona.fee),
    tiempoBaseMinutos: zona.base_minutes,
    tiempoEstimadoMax: zona.base_minutes + 15,
  };
}

// Extrae la comuna del texto de dirección: asume formato "calle número, comuna"
function extraerComunaDeTexto(direccionTexto: string): string | null {
  const partes = direccionTexto.split(",").map((p) => p.trim()).filter(Boolean);
  if (partes.length >= 2) return partes[partes.length - 1];
  return null;
}

// ── Sistema legado por distancia km (Neon) — solo fallback informativo ────────

async function obtenerBaseRestaurante(apiKey: string) {
  const restaurante = await prisma.configuracionRestaurante.findUnique({
    where: { id: "restaurante" }
  });

  if (restaurante?.latitud != null && restaurante.longitud != null) {
    return {
      lat: restaurante.latitud,
      lng: restaurante.longitud,
      direccion: restaurante.direccion ?? ""
    };
  }

  if (!restaurante?.direccion?.trim()) return null;

  const coords = await geocodificarDireccion(restaurante.direccion, apiKey);
  if (!coords) return null;

  await prisma.configuracionRestaurante.upsert({
    where: { id: "restaurante" },
    create: {
      id: "restaurante",
      direccion: restaurante.direccion,
      latitud: coords.lat,
      longitud: coords.lng
    },
    update: {
      latitud: coords.lat,
      longitud: coords.lng
    }
  });

  return {
    lat: coords.lat,
    lng: coords.lng,
    direccion: restaurante.direccion
  };
}

async function resolverCoberturaPorKm(
  direccionTexto: string
): Promise<ResultadoCoberturaDespacho> {
  const zonas = await prisma.zonaDespacho.findMany({
    where: {
      activa: true,
      distanciaMinKm: { not: null },
      distanciaMaxKm: { not: null }
    },
    orderBy: [{ distanciaMinKm: "asc" }, { costo: "asc" }]
  });

  if (zonas.length === 0) {
    return { estado: "sin_configuracion" };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { estado: "sin_api_key", zonas };
  }

  const base = await obtenerBaseRestaurante(apiKey);
  if (!base) {
    return { estado: "sin_direccion_base", zonas };
  }

  const coordsCliente = await geocodificarConCache(direccionTexto, apiKey);
  if (!coordsCliente) {
    return { estado: "direccion_no_geocodificada", zonas };
  }

  const distanciaKm = calcularDistanciaKm(
    base.lat,
    base.lng,
    coordsCliente.lat,
    coordsCliente.lng
  );

  const zona = zonas.find(
    (z) =>
      z.distanciaMinKm != null &&
      z.distanciaMaxKm != null &&
      distanciaKm >= z.distanciaMinKm &&
      distanciaKm <= z.distanciaMaxKm
  );

  if (!zona) {
    return { estado: "fuera_cobertura", distanciaKm, zonas };
  }

  return {
    estado: "cubierto",
    lat: coordsCliente.lat,
    lng: coordsCliente.lng,
    zona: {
      zonaId: zona.id,
      zonaNombre: zona.nombre,
      district: zona.nombre,
      costo: zona.costo,
      tiempoBaseMinutos: zona.tiempoEstimadoMin,
      tiempoEstimadoMax: zona.tiempoEstimadoMax,
      distanciaKm
    }
  };
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Resuelve la cobertura de despacho para una dirección.
 *
 * Orden de resolución:
 * 1. Supabase delivery_zones por comuna (AUTORITATIVO — misma tabla que valida
 *    la RPC create_storefront_order; garantiza costo cotizado = costo aplicado).
 * 2. Si Supabase no tiene zonas o no hay credenciales: sistema legado por km
 *    de Neon (solo informativo; el pedido despacho fallará en la RPC si la
 *    comuna no existe en delivery_zones).
 */
export async function resolverCoberturaDespacho(
  direccionTexto: string
): Promise<ResultadoCoberturaDespacho> {
  const comuna = extraerComunaDeTexto(direccionTexto) ?? direccionTexto;

  const zonaSupabase = await buscarZonaSupabase(comuna).catch(() => undefined);

  if (zonaSupabase) {
    return { estado: "cubierto", zona: zonaSupabase };
  }

  if (zonaSupabase === null) {
    // Supabase tiene zonas configuradas pero esta comuna NO está cubierta.
    // No usar el fallback km: la RPC rechazará el pedido de todas formas.
    return { estado: "fuera_cobertura" };
  }

  // undefined → Supabase no consultable o sin zonas: usar sistema legado por km
  return resolverCoberturaPorKm(direccionTexto);
}

export async function resolverZonaDespacho(
  direccionTexto: string
): Promise<ZonaDespachoResuelta | null> {
  const resultado = await resolverCoberturaDespacho(direccionTexto);
  return resultado.estado === "cubierto" ? resultado.zona : null;
}
