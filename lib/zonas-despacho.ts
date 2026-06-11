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
      lat: number;
      lng: number;
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

export async function resolverCoberturaDespacho(
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

export async function resolverZonaDespacho(
  direccionTexto: string
): Promise<ZonaDespachoResuelta | null> {
  const resultado = await resolverCoberturaDespacho(direccionTexto);
  return resultado.estado === "cubierto" ? resultado.zona : null;
}
