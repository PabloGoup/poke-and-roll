import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type ZonaDespachoConRangos = {
  id: string;
  nombre: string;
  costo: number;
  tiempoEstimadoMin: number;
  tiempoEstimadoMax: number;
  activa: boolean;
  distanciaMinKm: number | null;
  distanciaMaxKm: number | null;
};

export async function geocodificarDireccion(
  direccion: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${apiKey}&region=cl&language=es`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) return null;
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch {
    return null;
  }
}

export function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function hashDireccion(textoNormalizado: string): string {
  return crypto.createHash("sha256").update(textoNormalizado).digest("hex");
}

export async function geocodificarConCache(
  direccion: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  const normalizado = normalizarTexto(direccion);
  const hash = hashDireccion(normalizado);

  const cached = await prisma.direccionGeocacheada.findUnique({
    where: { hashTexto: hash }
  });
  if (cached) return { lat: cached.latitud, lng: cached.longitud };

  const coords = await geocodificarDireccion(direccion, apiKey);
  if (!coords) return null;

  await prisma.direccionGeocacheada.upsert({
    where: { hashTexto: hash },
    create: { hashTexto: hash, textoOriginal: direccion, latitud: coords.lat, longitud: coords.lng },
    update: { latitud: coords.lat, longitud: coords.lng }
  });

  return coords;
}

export async function calcularCostoDespacho(
  direccionCliente: string,
  restauranteLat: number,
  restauranteLng: number,
  zonas: ZonaDespachoConRangos[],
  apiKey: string
): Promise<{ zona: ZonaDespachoConRangos; distanciaKm: number } | null> {
  const coords = await geocodificarConCache(direccionCliente, apiKey);
  if (!coords) return null;

  const distanciaKm = calcularDistanciaKm(
    restauranteLat, restauranteLng,
    coords.lat, coords.lng
  );

  const zonasConKm = zonas.filter(
    (z) => z.activa && z.distanciaMinKm !== null && z.distanciaMaxKm !== null
  );

  const zona = zonasConKm.find(
    (z) => distanciaKm >= z.distanciaMinKm! && distanciaKm <= z.distanciaMaxKm!
  );

  if (!zona) return null;
  return { zona, distanciaKm };
}

// ── Geocodificación extendida con extracción de comuna ────────────────────────

export interface ResultadoGeocodificacion {
  lat: number;
  lng: number;
  direccionFormateada: string;
  comuna: string | null;
  region: string | null;
}

export async function geocodificarDireccionCompleta(
  direccion: string,
  apiKey: string
): Promise<ResultadoGeocodificacion | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      direccion + ", Chile"
    )}&key=${apiKey}&region=cl&language=es`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.[0]) return null;

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    const components = result.address_components as Array<{
      long_name: string;
      types: string[];
    }>;

    // En Chile la comuna aparece como 'locality' o 'sublocality_level_1'
    const comunaComponent = components.find(
      (c) =>
        c.types.includes("locality") ||
        c.types.includes("sublocality_level_1")
    );

    return {
      lat,
      lng,
      direccionFormateada: result.formatted_address,
      comuna: comunaComponent?.long_name ?? null,
      region:
        components.find((c) =>
          c.types.includes("administrative_area_level_1")
        )?.long_name ?? null,
    };
  } catch {
    return null;
  }
}
