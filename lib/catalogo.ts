import { prisma } from "@/lib/prisma";

type ProductoCatalogo = {
  nombre: string;
  categoria: string;
  descripcion?: string | null;
  precio: number;
  variante?: string | null;
  modificadores?: string[];
};

type PromocionCatalogo = {
  nombre: string;
  descripcion: string;
  precio?: number | null;
  condiciones?: string | null;
  tipo?: string | null;
};

type ZonaCatalogo = {
  nombre: string;
  costo: number;
  tiempoEstimadoMin: number;
  tiempoEstimadoMax: number;
};

type HorarioCatalogo = {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
};

type MedioPagoCatalogo = {
  nombre: string;
  instrucciones?: string | null;
};

type ProductoPosRow = {
  name: string;
  product_categories?: { name: string | null } | null;
  description: string | null;
  base_price: unknown;
  product_variants?: Array<{ name: string | null; price: unknown; is_default?: boolean | null }> | null;
  product_modifier_groups?: Array<{
    name: string | null;
    product_modifiers?: Array<{ name: string; price_delta: unknown; default_included?: boolean | null }> | null;
  }> | null;
};

type PromocionPosRow = {
  name: string;
  description: string | null;
  type: string;
  value: unknown;
  rules: unknown;
};

type ZonaPosRow = {
  name: string;
  district: string;
  fee: unknown;
  base_minutes: number;
};

type StoreSettingsRow = {
  pickup_base_minutes: number;
  delivery_base_minutes: number;
  currency_code: string;
  is_store_open: boolean;
};

type SupabaseRequestOptions = {
  select?: string;
  params?: Record<string, string>;
};

export type ContextoNegocio = {
  productos: ProductoCatalogo[];
  promociones: PromocionCatalogo[];
  zonasDespacho: ZonaCatalogo[];
  horarios: HorarioCatalogo[];
  mediosPago: MedioPagoCatalogo[];
  fuente: "base_datos" | "fallback";
};

const productosFallback: ProductoCatalogo[] = [
  {
    nombre: "Combo Pareja",
    categoria: "combos",
    descripcion: "8 rolls variados + 2 bebidas.",
    precio: 16900
  },
  {
    nombre: "Combo Mix",
    categoria: "combos",
    descripcion: "8 rolls + 4 tempuras, ideal para 2 personas.",
    precio: 18900
  },
  {
    nombre: "Combo Familiar",
    categoria: "combos",
    descripcion: "16 rolls variados + 8 tempuras + 4 gyosas, recomendado para 4 personas.",
    precio: 34900
  },
  {
    nombre: "Salmon Clasico",
    categoria: "rolls",
    descripcion: "Roll de salmon, queso crema y pepino, sin palta.",
    precio: 8900
  },
  {
    nombre: "Spicy Salmon",
    categoria: "rolls",
    descripcion: "Roll de salmon spicy sin palta.",
    precio: 9200
  },
  {
    nombre: "Gyosas",
    categoria: "extras",
    descripcion: "Porcion para agregar al pedido.",
    precio: 4500
  },
  {
    nombre: "Bebida lata",
    categoria: "bebidas",
    descripcion: "Bebida individual.",
    precio: 1800
  }
];

const promocionesFallback: PromocionCatalogo[] = [
  {
    nombre: "Promo para 2",
    descripcion: "Combo Pareja con rolls variados y 2 bebidas.",
    precio: 16900,
    condiciones: "Sujeto a disponibilidad del dia."
  },
  {
    nombre: "Promo familiar",
    descripcion: "Combo Familiar recomendado para 4 personas.",
    precio: 34900,
    condiciones: "Consultar disponibilidad antes de confirmar."
  }
];

const horariosFallback: HorarioCatalogo[] = [
  { diaSemana: 1, horaApertura: "12:00", horaCierre: "22:30" },
  { diaSemana: 2, horaApertura: "12:00", horaCierre: "22:30" },
  { diaSemana: 3, horaApertura: "12:00", horaCierre: "22:30" },
  { diaSemana: 4, horaApertura: "12:00", horaCierre: "22:30" },
  { diaSemana: 5, horaApertura: "12:00", horaCierre: "23:00" },
  { diaSemana: 6, horaApertura: "12:00", horaCierre: "23:00" },
  { diaSemana: 0, horaApertura: "12:00", horaCierre: "22:30" }
];

const mediosPagoFallback: MedioPagoCatalogo[] = [
  { nombre: "Transferencia" },
  { nombre: "Tarjeta" },
  { nombre: "Efectivo" }
];

const zonasFallback: ZonaCatalogo[] = [
  { nombre: "Zona cercana", costo: 2000, tiempoEstimadoMin: 30, tiempoEstimadoMax: 45 }
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreProducto(producto: ProductoCatalogo, consulta: string) {
  const texto = normalizar(`${producto.nombre} ${producto.categoria} ${producto.descripcion ?? ""}`);
  const tokens = normalizar(consulta).split(/\W+/).filter((token) => token.length >= 3);
  let score = 0;

  for (const token of tokens) {
    if (texto.includes(token)) score += 2;
  }

  if (normalizar(consulta).includes("combo") && texto.includes("combo")) score += 4;
  if (normalizar(consulta).includes("bebida") && texto.includes("bebida")) score += 4;
  if (normalizar(consulta).includes("palta") && texto.includes("sin palta")) score += 4;
  if (normalizar(consulta).includes("salmon") && texto.includes("salmon")) score += 3;
  if (normalizar(consulta).includes("persona") && texto.includes("persona")) score += 2;
  if (/\b4\s*(personas|persona|pax)\b/i.test(consulta) && texto.includes("familiar")) score += 8;
  if (/\b2\s*(personas|persona|pax)\b/i.test(consulta) && texto.includes("pareja")) score += 8;
  if (/\b\d+\s*(personas|persona|pax)\b/i.test(consulta) || normalizar(consulta).includes("combo")) {
    if (texto.includes("promo")) score += 7;
    if (texto.includes("pokes")) score += 5;
    if (texto.includes("roll")) score += 4;
    if (texto.includes("burger")) score += 2;
    if (texto.includes("nigiri")) score -= 4;
  }

  return score;
}

function ordenarProductosRelevantes(productos: ProductoCatalogo[], consulta: string) {
  const scored = [...productos]
    .map((producto) => ({ producto, score: scoreProducto(producto, consulta) }))
    .sort((a, b) => b.score - a.score || a.producto.precio - b.producto.precio);

  const relevantes = scored.filter((item) => item.score > 0);
  const base = relevantes.length > 0 ? relevantes : scored;

  return base
    .slice(0, 8)
    .map(({ producto }) => producto);
}

function numero(valor: unknown) {
  if (typeof valor === "number") return valor;
  if (typeof valor === "bigint") return Number(valor);
  if (typeof valor === "string") return Number(valor);
  if (valor && typeof valor === "object" && "toString" in valor) return Number(valor.toString());
  return 0;
}

export function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(precio);
}

function contextoFallback(consulta: string): ContextoNegocio {
  return {
    productos: ordenarProductosRelevantes(productosFallback, consulta),
    promociones: promocionesFallback,
    zonasDespacho: zonasFallback,
    horarios: horariosFallback,
    mediosPago: mediosPagoFallback,
    fuente: "fallback"
  };
}

function supabaseVentasConfig() {
  const url = process.env.SUPABASE_VENTAS_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_VENTAS_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function supabaseGet<T>(table: string, options: SupabaseRequestOptions = {}): Promise<T[]> {
  const config = supabaseVentasConfig();
  if (!config) return [];

  const params = new URLSearchParams(options.params ?? {});
  if (options.select) params.set("select", options.select);

  const response = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const detalle = await response.text().catch(() => "");
    throw new Error(`Supabase ventas ${table}: ${response.status} ${detalle}`);
  }

  return response.json() as Promise<T[]>;
}

async function obtenerContextoSupabaseVentas(consulta: string): Promise<ContextoNegocio | null> {
  if (!supabaseVentasConfig()) return null;

  const [productos, promociones, zonasDespacho, settings] = await Promise.all([
    supabaseGet<ProductoPosRow>("products", {
      select: [
        "name",
        "description",
        "base_price",
        "product_categories(name)",
        "product_variants(name,price,is_default)",
        "product_modifier_groups(name,product_modifiers(name,price_delta,default_included))"
      ].join(","),
      params: {
        "status": "eq.activo",
        "order": "sort_order.asc,name.asc",
        "limit": "120"
      }
    }),
    supabaseGet<PromocionPosRow>("promotions", {
      select: "name,description,type,value,rules",
      params: {
        "is_active": "eq.true",
        "order": "name.asc",
        "limit": "30"
      }
    }).catch(() => []),
    supabaseGet<ZonaPosRow>("delivery_zones", {
      select: "name,district,fee,base_minutes",
      params: {
        "is_active": "eq.true",
        "order": "sort_order.asc,fee.asc",
        "limit": "40"
      }
    }).catch(() => []),
    supabaseGet<StoreSettingsRow>("store_settings", {
      select: "pickup_base_minutes,delivery_base_minutes,currency_code,is_store_open",
      params: {
        "order": "created_at.desc",
        "limit": "1"
      }
    }).catch(() => [])
  ]);

  if (productos.length === 0 && promociones.length === 0) return null;

  const productosCatalogo = productos.flatMap((p) => {
    const variantes = p.product_variants?.length ? p.product_variants : [null];
    const precioBase = numero(p.base_price);
    const modificadores = p.product_modifier_groups?.flatMap((g) =>
      g.product_modifiers?.map((m) => `${g.name ?? "Modificador"}: ${m.name} ${numero(m.price_delta) ? `+${formatearPrecio(numero(m.price_delta))}` : ""}`) ?? []
    ) ?? [];

    return variantes.map((variante) => {
      const precioVariante = numero(variante?.price);
      return {
        nombre: p.name,
        categoria: p.product_categories?.name ?? "Sin categoria",
        descripcion: p.description,
        precio: precioVariante > 0 ? precioVariante : precioBase,
        variante: variante?.name,
        modificadores
      };
    });
  });

  const promocionesCatalogo = promociones.map((p) => ({
    nombre: p.name,
    descripcion: [
      p.description,
      p.type === "horario" && numero(p.value) > 0 ? `Descuento: ${numero(p.value)}%` : null,
      p.type && p.type !== "horario" ? `Tipo: ${p.type}` : null,
      p.rules ? `Reglas: ${JSON.stringify(p.rules)}` : null
    ].filter(Boolean).join(" | "),
    precio: ["precio_fijo", "fixed_price"].includes(p.type) && numero(p.value) > 0 ? numero(p.value) : null,
    condiciones: "Vigente segun configuracion de promociones.",
    tipo: p.type
  }));

  const zonasCatalogo = zonasDespacho.map((z) => ({
    nombre: `${z.name} - ${z.district}`,
    costo: numero(z.fee),
    tiempoEstimadoMin: z.base_minutes,
    tiempoEstimadoMax: z.base_minutes + (settings[0]?.delivery_base_minutes ?? 15)
  }));

  const mediosPago: MedioPagoCatalogo[] = [
    { nombre: "Efectivo" },
    { nombre: "Tarjeta" },
    { nombre: "Transferencia" }
  ];

  return {
    productos: ordenarProductosRelevantes(productosCatalogo, consulta),
    promociones: promocionesCatalogo,
    zonasDespacho: zonasCatalogo,
    horarios: [],
    mediosPago,
    fuente: "base_datos"
  };
}

export async function obtenerContextoNegocio(consulta: string): Promise<ContextoNegocio> {
  try {
    const contextoVentas = await obtenerContextoSupabaseVentas(consulta);
    if (contextoVentas) return contextoVentas;
  } catch {
    // Si Supabase ventas no responde, seguimos con el modelo propio del agente.
  }

  try {
    const [productos, promociones, zonasDespacho, horarios, mediosPago] = await Promise.all([
      prisma.menuProducto.findMany({
        where: { disponible: true },
        orderBy: [{ categoria: "asc" }, { precio: "asc" }],
        take: 80
      }),
      prisma.promocion.findMany({
        where: { activa: true },
        orderBy: { nombre: "asc" },
        take: 20
      }),
      prisma.zonaDespacho.findMany({
        where: { activa: true },
        orderBy: { costo: "asc" },
        take: 20
      }),
      prisma.horarioAtencion.findMany({
        where: { activo: true },
        orderBy: { diaSemana: "asc" }
      }),
      prisma.medioPago.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" }
      })
    ]);

    if (productos.length === 0 && promociones.length === 0) {
      return contextoFallback(consulta);
    }

    return {
      productos: ordenarProductosRelevantes(productos, consulta),
      promociones,
      zonasDespacho,
      horarios,
      mediosPago,
      fuente: "base_datos"
    };
  } catch {
    return contextoFallback(consulta);
  }
}

export function serializarContextoNegocio(contexto: ContextoNegocio) {
  const productos = contexto.productos
    .map((p) => {
      const variante = p.variante ? ` / ${p.variante}` : "";
      const modificadores = p.modificadores?.length ? ` Modificadores: ${p.modificadores.join(", ")}` : "";
      return `- ${p.nombre}${variante} (${p.categoria}): ${formatearPrecio(p.precio)}${p.descripcion ? ` - ${p.descripcion}` : ""}${modificadores}`;
    })
    .join("\n");

  const promociones = contexto.promociones
    .map((p) => `- ${p.nombre}: ${p.precio ? `${formatearPrecio(p.precio)} - ` : ""}${p.descripcion}${p.condiciones ? ` Condiciones: ${p.condiciones}` : ""}`)
    .join("\n");

  const horarios = contexto.horarios
    .map((h) => `- Dia ${h.diaSemana}: ${h.horaApertura}-${h.horaCierre}`)
    .join("\n");

  const zonas = contexto.zonasDespacho
    .map((z) => `- ${z.nombre}: despacho ${formatearPrecio(z.costo)}, estimado ${z.tiempoEstimadoMin}-${z.tiempoEstimadoMax} min`)
    .join("\n");

  const pagos = contexto.mediosPago
    .map((p) => `- ${p.nombre}${p.instrucciones ? `: ${p.instrucciones}` : ""}`)
    .join("\n");

  return [
    `Fuente catalogo: ${contexto.fuente}`,
    productos ? `Productos relevantes:\n${productos}` : "",
    promociones ? `Promociones activas:\n${promociones}` : "",
    horarios ? `Horarios:\n${horarios}` : "",
    zonas ? `Zonas de despacho:\n${zonas}` : "",
    pagos ? `Medios de pago:\n${pagos}` : ""
  ].filter(Boolean).join("\n\n");
}
