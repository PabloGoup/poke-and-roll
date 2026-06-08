import { prisma } from "@/lib/prisma";
import { readdir } from "node:fs/promises";
import path from "node:path";

export type ReglaComercialInput = {
  id: string;
  titulo: string;
  descripcion: string;
  activa: boolean;
  prioridad: "alta" | "media" | "baja";
  canal: "todos" | "whatsapp" | "instagram" | "facebook";
};

export type ItemComercialInput = {
  id?: string;
  tipo: "menu" | "promocion";
  nombre: string;
  detalle: string;
  precioTexto?: string | null;
  activo: boolean;
};

export type CatalogoVisualInput = {
  id?: string;
  nombre: string;
  url: string;
  storagePath?: string | null;
  tipo: "catalogo" | "promocion" | "roll_dia" | "menu_dia";
  prioridadEnvio: boolean;
  activo: boolean;
};

async function obtenerCatalogoPdfDocs(): Promise<CatalogoVisualInput | null> {
  try {
    const docsDir = path.join(process.cwd(), "docs");
    const archivos = await readdir(docsDir);
    const pdf = archivos
      .filter((archivo) => archivo.toLowerCase().endsWith(".pdf"))
      .sort((a, b) => {
        const prioridadA = /catalogo|catalog|menu|men[uú]/i.test(a) ? 0 : 1;
        const prioridadB = /catalogo|catalog|menu|men[uú]/i.test(b) ? 0 : 1;
        return prioridadA - prioridadB || a.localeCompare(b);
      })[0];

    if (!pdf) return null;

    return {
      id: "catalogo-completo-docs-pdf",
      nombre: pdf,
      url: "/api/catalogo/pdf",
      storagePath: `docs:${pdf}`,
      tipo: "catalogo",
      prioridadEnvio: true,
      activo: true
    };
  } catch {
    return null;
  }
}

export const reglasComercialesDefault: ReglaComercialInput[] = [
  {
    id: "catalogo-visual",
    titulo: "Enviar catalogo visual primero",
    descripcion: "Cuando el cliente pregunte por menu, promociones o precios, responder primero con imagen/catalogo y luego texto breve.",
    activa: true,
    prioridad: "alta",
    canal: "todos"
  },
  {
    id: "promocion-dia",
    titulo: "Promocion del dia",
    descripcion: "Destacar una promo vigente antes de listar alternativas del catalogo.",
    activa: true,
    prioridad: "alta",
    canal: "todos"
  },
  {
    id: "roll-dia",
    titulo: "Roll del dia",
    descripcion: "Recomendar un roll hero para cerrar venta cuando el cliente pide sugerencias.",
    activa: true,
    prioridad: "media",
    canal: "whatsapp"
  },
  {
    id: "combo-personas",
    titulo: "Combos por cantidad de personas",
    descripcion: "Si el cliente menciona 2, 3, 4 o mas personas, priorizar productos compartibles y promos reales.",
    activa: true,
    prioridad: "alta",
    canal: "todos"
  },
  {
    id: "upsell-extras",
    titulo: "Sugerir extras",
    descripcion: "Ofrecer bebidas, gyosas, hand rolls o agregados cuando el pedido este casi listo.",
    activa: true,
    prioridad: "media",
    canal: "todos"
  },
  {
    id: "menu-dia",
    titulo: "Menu del dia",
    descripcion: "Usar una seleccion diaria para respuestas rapidas y contenido de redes.",
    activa: false,
    prioridad: "media",
    canal: "instagram"
  },
  {
    id: "sin-palta-alergenos",
    titulo: "Alergias y sin palta",
    descripcion: "Cuando exista alergia o restriccion, recomendar solo productos compatibles y pedir confirmacion.",
    activa: true,
    prioridad: "alta",
    canal: "todos"
  },
  {
    id: "respuesta-breve",
    titulo: "Respuesta breve vendedora",
    descripcion: "Mantener maximo 3 oraciones, con precio real y pregunta de cierre.",
    activa: true,
    prioridad: "media",
    canal: "todos"
  }
];

export const itemsComercialesDefault: ItemComercialInput[] = [
  { tipo: "promocion", nombre: "Promo almuerzo", detalle: "10% de descuento entre 15:00 y 16:00", precioTexto: "10%", activo: true },
  { tipo: "menu", nombre: "Sushi Burger Pollo", detalle: "Pollo apanado, palta, queso crema y cebollin", precioTexto: "$6.490", activo: true },
  { tipo: "menu", nombre: "2 Pokes a Eleccion", detalle: "Promo de 2 pokes a eleccion", precioTexto: "$12.990", activo: true }
];

export async function asegurarReglasComerciales() {
  const existentes = await prisma.reglaComercialAgente.findMany({
    select: { id: true }
  });
  const ids = new Set(existentes.map((r) => r.id));
  const faltantes = reglasComercialesDefault.filter((r) => !ids.has(r.id));

  if (faltantes.length > 0) {
    await prisma.reglaComercialAgente.createMany({
      data: faltantes,
      skipDuplicates: true
    });
  }
}

export async function obtenerConfiguracionComercial() {
  await asegurarReglasComerciales();

  const [reglas, items, imagenes, catalogoPdf] = await Promise.all([
    prisma.reglaComercialAgente.findMany({ orderBy: [{ prioridad: "asc" }, { titulo: "asc" }] }),
    prisma.itemComercialDestacado.findMany({ orderBy: { creadoEn: "desc" } }),
    prisma.catalogoVisualAgente.findMany({ where: { activo: true, NOT: { storagePath: { startsWith: "local:" } } }, orderBy: [{ prioridadEnvio: "desc" }, { creadoEn: "desc" }] }),
    obtenerCatalogoPdfDocs()
  ]);

  const catalogos = catalogoPdf
    ? [catalogoPdf, ...imagenes.map((img) => ({ ...img, prioridadEnvio: false }))]
    : imagenes;

  return { reglas, items, imagenes: catalogos };
}
