import { prisma } from "@/lib/prisma";

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

export type TarifaDespachoInput = {
  id?: string;
  nombre: string;
  distanciaMinKm: number;
  distanciaMaxKm: number;
  costoPesos: number;
  tiempoMinMin: number;
  tiempoMaxMin: number;
  activa: boolean;
};

export type ConfiguracionRestauranteInput = {
  direccion: string;
  latitud?: number | null;
  longitud?: number | null;
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

  const [reglas, items, imagenes, tarifas, restaurante] = await Promise.all([
    prisma.reglaComercialAgente.findMany({ orderBy: [{ prioridad: "asc" }, { titulo: "asc" }] }),
    prisma.itemComercialDestacado.findMany({ orderBy: { creadoEn: "desc" } }),
    prisma.catalogoVisualAgente.findMany({ where: { activo: true }, orderBy: [{ prioridadEnvio: "desc" }, { creadoEn: "desc" }] }),
    prisma.zonaDespacho.findMany({ orderBy: { costo: "asc" } }),
    prisma.configuracionRestaurante.findUnique({ where: { id: "restaurante" } })
  ]);

  return { reglas, items, imagenes, tarifas, restaurante };
}

export async function guardarTarifasDespacho(
  tarifas: TarifaDespachoInput[],
  restaurante: ConfiguracionRestauranteInput
): Promise<void> {
  const zonaData = tarifas.map((t) => ({
    nombre: t.nombre,
    costo: t.costoPesos,
    tiempoEstimadoMin: t.tiempoMinMin,
    tiempoEstimadoMax: t.tiempoMaxMin,
    activa: t.activa,
    distanciaMinKm: t.distanciaMinKm,
    distanciaMaxKm: t.distanciaMaxKm
  }));

  await prisma.configuracionRestaurante.upsert({
    where: { id: "restaurante" },
    create: {
      id: "restaurante",
      direccion: restaurante.direccion,
      latitud: restaurante.latitud ?? null,
      longitud: restaurante.longitud ?? null
    },
    update: {
      direccion: restaurante.direccion,
      latitud: restaurante.latitud ?? null,
      longitud: restaurante.longitud ?? null
    }
  });

  await prisma.zonaDespacho.deleteMany();

  for (const zona of zonaData) {
    await prisma.zonaDespacho.create({ data: zona });
  }
}
