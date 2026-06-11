import { prisma } from "@/lib/prisma";
import type { MediaAEnviar } from "@/lib/modulos/types";

type IntencionVisual = "catalogo" | "promocion" | "pokes_gohan" | "rolls" | "handrolls";

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function resolverUrlPublica(url: string): string {
  if (url.startsWith("http")) return url;
  const base = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://goupsoluciones.cl").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function resolverUrlCatalogoPdfFallback() {
  return resolverUrlPublica("/api/catalogo/pdf");
}

export function detectarIntencionVisual(texto: string): IntencionVisual | null {
  const n = normalizar(texto);
  const solicitaVer =
    /\b(enviar|envia|envíame|enviame|manda|mandame|mándame|mostrar|muestrame|muéstrame|ver|pasame|pásame|necesito|quiero ver|tienes|tienen|hay|cuales|cuáles)\b/.test(n)
    || n.includes("me puedes enviar")
    || n.includes("me mandas")
    || n.includes("solo las")
    || n.includes("solo los")
    || n.includes("solo la");

  const pidePromos = /\b(promo|promos|promocion|promociones|oferta|ofertas)\b/.test(n);
  if (pidePromos && solicitaVer) return "promocion";

  const pidePokes = /\b(poke|pokes|gohan|gohans|bowl|bowls)\b/.test(n);
  if (pidePokes && solicitaVer) return "pokes_gohan";

  const pideHandrolls = /\b(hand\s?roll|handroll|handrolls)\b/.test(n);
  if (pideHandrolls && solicitaVer) return "handrolls";

  const pideRolls = /\b(roll|rolls|sushi|piezas)\b/.test(n);
  if (pideRolls && solicitaVer) return "rolls";

  const pideCatalogo =
    /\b(menu|carta|catalogo|precios)\b/.test(n) ||
    n.includes("que tienen") ||
    n.includes("que venden") ||
    n.includes("ver opciones");

  return pideCatalogo ? "catalogo" : null;
}

function coincidePorNombre(nombre: string, intencion: IntencionVisual) {
  const n = normalizar(nombre);
  if (intencion === "pokes_gohan") return /\b(poke|pokes|gohan|bowl)\b/.test(n);
  if (intencion === "rolls") return /\b(roll|rolls|sushi|piezas)\b/.test(n) && !/\bhand\s?roll|handroll\b/.test(n);
  if (intencion === "handrolls") return /\bhand\s?roll|handroll\b/.test(n);
  return false;
}

function fallbackCatalogoPdf(): MediaAEnviar {
  return {
    tipo: "documento",
    url: resolverUrlPublica("/api/catalogo/pdf"),
    nombre: "Carta Poke & Roll.pdf",
  };
}

export async function cargarMediaCatalogoVisual(intencion: IntencionVisual): Promise<MediaAEnviar[]> {
  const imagenes = await prisma.catalogoVisualAgente.findMany({
    where: { activo: true },
    orderBy: [{ prioridadEnvio: "desc" }, { creadoEn: "desc" }],
  });

  const publicas = imagenes.filter((img) => img.url.startsWith("http"));
  const fuente = publicas.length > 0 ? publicas : imagenes;

  const porTipo = fuente.filter((img) => {
    if (intencion === "catalogo") return img.tipo === "catalogo";
    if (intencion === "promocion") return img.tipo === "promocion";
    if (intencion === "rolls") return img.tipo === "roll_dia" || coincidePorNombre(img.nombre, intencion);
    if (intencion === "pokes_gohan") return img.tipo === "menu_dia" || coincidePorNombre(img.nombre, intencion);
    return coincidePorNombre(img.nombre, intencion);
  });

  let seleccion = porTipo.length > 0
    ? porTipo
    : intencion === "catalogo"
      ? fuente.filter((img) => img.tipo === "catalogo" || img.prioridadEnvio)
      : [];

  if (seleccion.length === 0 && intencion !== "catalogo") {
    seleccion = fuente.filter((img) => img.tipo === "catalogo" || img.prioridadEnvio);
  }

  const limite = intencion === "catalogo" ? 1 : 3;
  const media: MediaAEnviar[] = seleccion.slice(0, limite).map((img) => ({
    tipo: img.url.toLowerCase().includes(".pdf") || img.url.includes("/api/catalogo/pdf") ? "documento" as const : "imagen" as const,
    url: resolverUrlPublica(img.url),
    nombre: img.nombre,
  }));

  return media.length > 0 ? media : [fallbackCatalogoPdf()];
}
