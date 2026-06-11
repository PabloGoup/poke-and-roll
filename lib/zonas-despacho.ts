import { createClient } from "@supabase/supabase-js";
import { geocodificarDireccionCompleta } from "./geocodificacion";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ZonaDespachoResuelta {
  zonaId: string;
  zonaNombre: string;
  district: string;
  costo: number;
  tiempoBaseMinutos: number;
  distanciaKm?: number;
}

// ── Cliente Supabase (pedidos) ────────────────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_PEDIDOS_URL!,
  process.env.SUPABASE_PEDIDOS_ANON_KEY!
);

// ── Utilidad de normalización ─────────────────────────────────────────────────

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Dada una dirección en texto libre, devuelve la zona de despacho correspondiente.
 *
 * Estrategia:
 * 1. Si hay GOOGLE_MAPS_API_KEY → geocodifica y extrae la comuna desde Google Maps.
 * 2. Si Google Maps falla o no hay clave → busca el nombre de alguna zona dentro
 *    del texto de la dirección (fallback por texto).
 * 3. Si nada coincide → null (zona fuera de cobertura).
 */
export async function resolverZonaDespacho(
  direccionTexto: string
): Promise<ZonaDespachoResuelta | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn(
      "[ZonasDespacho] Sin GOOGLE_MAPS_API_KEY — usando solo texto de dirección"
    );
    return resolverZonaPorTexto(direccionTexto);
  }

  const geo = await geocodificarDireccionCompleta(direccionTexto, apiKey);
  if (!geo?.comuna) {
    // Fallback: intentar extraer la zona del texto libre
    return resolverZonaPorTexto(direccionTexto);
  }

  return buscarZonaEnSupabase(geo.comuna);
}

// ── Helpers privados ──────────────────────────────────────────────────────────

/**
 * Fallback sin Google Maps: recorre todas las zonas activas y devuelve la primera
 * cuyo `district` aparezca como subcadena dentro del texto de la dirección.
 */
async function resolverZonaPorTexto(
  direccionTexto: string
): Promise<ZonaDespachoResuelta | null> {
  const { data: zonas, error } = await supabase
    .from("delivery_zones")
    .select("id, name, district, fee, base_minutes")
    .eq("is_active", true);

  if (error || !zonas) return null;

  const textoNorm = normalizar(direccionTexto);

  const zona = zonas.find((z) => {
    const districtNorm = normalizar(z.district);
    return textoNorm.includes(districtNorm);
  });

  if (!zona) return null;

  return {
    zonaId: zona.id,
    zonaNombre: zona.name,
    district: zona.district,
    costo: Math.round(zona.fee),
    tiempoBaseMinutos: zona.base_minutes,
  };
}

/**
 * Busca la zona cuyo `district` coincida con la comuna entregada por Google Maps.
 *
 * Intentos en orden:
 * 1. ilike exacto (case-insensitive, sin normalización de tildes).
 * 2. Comparación normalizada (sin tildes, espacios colapsados) contra todas las
 *    zonas activas — también acepta inclusión parcial en cualquier dirección.
 */
async function buscarZonaEnSupabase(
  comuna: string
): Promise<ZonaDespachoResuelta | null> {
  // Intento 1: ilike exacto
  const { data: zonaExacta } = await supabase
    .from("delivery_zones")
    .select("id, name, district, fee, base_minutes")
    .eq("is_active", true)
    .ilike("district", comuna)
    .limit(1)
    .maybeSingle();

  if (zonaExacta) {
    return {
      zonaId: zonaExacta.id,
      zonaNombre: zonaExacta.name,
      district: zonaExacta.district,
      costo: Math.round(zonaExacta.fee),
      tiempoBaseMinutos: zonaExacta.base_minutes,
    };
  }

  // Intento 2: normalización con tildes
  const { data: todas } = await supabase
    .from("delivery_zones")
    .select("id, name, district, fee, base_minutes")
    .eq("is_active", true);

  if (!todas) return null;

  const comunaNorm = normalizar(comuna);
  const encontrada = todas.find((z) => {
    const dNorm = normalizar(z.district);
    return (
      dNorm === comunaNorm ||
      dNorm.includes(comunaNorm) ||
      comunaNorm.includes(dNorm)
    );
  });

  if (!encontrada) return null;

  return {
    zonaId: encontrada.id,
    zonaNombre: encontrada.name,
    district: encontrada.district,
    costo: Math.round(encontrada.fee),
    tiempoBaseMinutos: encontrada.base_minutes,
  };
}
