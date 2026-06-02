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
    nombre: "Acevichado Roll",
    categoria: "sushi premium",
    descripcion: "Palta, queso crema, ciboulette, cubierto con salsa acevichada del dia.",
    precio: 5990
  },
  {
    nombre: "Beef Roll",
    categoria: "sushi premium",
    descripcion: "Queso crema, cebollin, carne, cubierto con salsa teriyaki.",
    precio: 5990
  },
  {
    nombre: "Sushi a la Huancaina",
    categoria: "sushi premium",
    descripcion: "Pollo tempurizado, queso crema, banado con salsa a la huancaina.",
    precio: 5990
  },
  {
    nombre: "Ebi Spicy",
    categoria: "sushi premium",
    descripcion: "Camaron, queso crema, cebollin, apanado en panko, aderezado con salsa spicy.",
    precio: 5900
  },
  {
    nombre: "Cangrejo Dinamita Roll",
    categoria: "sushi premium",
    descripcion: "Mezcla de cangrejo con salsa dinamita, queso crema, cebollin, envuelto en palta.",
    precio: 6490
  },
  {
    nombre: "Tori Fuji Roll",
    categoria: "sushi premium",
    descripcion: "Pollo apanado, queso crema, pepino, envuelto en sesamo, con salsa fuji sopleteada.",
    precio: 6490
  },
  {
    nombre: "Sake Ceviche Roll",
    categoria: "sushi premium",
    descripcion: "Salmon y palta, cubierto con ceviche mixto del dia.",
    precio: 6990
  },
  {
    nombre: "Ebi Roll",
    categoria: "futomaki envuelto en nori",
    descripcion: "Camaron, queso crema, cebollin.",
    precio: 4000
  },
  {
    nombre: "Tori Roll",
    categoria: "futomaki envuelto en nori",
    descripcion: "Pollo, queso crema, cebollin.",
    precio: 4000
  },
  {
    nombre: "Sake Roll",
    categoria: "futomaki envuelto en nori",
    descripcion: "Salmon, palta, queso crema.",
    precio: 4000
  },
  {
    nombre: "Pepino Roll",
    categoria: "futomaki envuelto en nori",
    descripcion: "Pepino, queso crema, palta.",
    precio: 3800
  },
  {
    nombre: "Maki Roll",
    categoria: "futomaki envuelto en nori",
    descripcion: "Kanikama, queso crema, ciboulette.",
    precio: 3800
  },
  {
    nombre: "Palmito Roll",
    categoria: "futomaki envuelto en nori",
    descripcion: "Palmito, palta.",
    precio: 3800
  },
  {
    nombre: "Ebi Roll",
    categoria: "california envuelto en sesamo o ciboulette",
    descripcion: "Camaron, queso crema, cebollin.",
    precio: 4200
  },
  {
    nombre: "Tori Tempura Roll",
    categoria: "california envuelto en sesamo o ciboulette",
    descripcion: "Pollo tempurizado, queso crema, cebollin.",
    precio: 4200
  },
  {
    nombre: "Sake Roll",
    categoria: "california envuelto en sesamo o ciboulette",
    descripcion: "Salmon, palta, queso crema.",
    precio: 4200
  },
  {
    nombre: "Pepino Roll",
    categoria: "california envuelto en sesamo o ciboulette",
    descripcion: "Pepino, queso crema, palta.",
    precio: 4000
  },
  {
    nombre: "Maki Roll",
    categoria: "california envuelto en sesamo o ciboulette",
    descripcion: "Kanikama, queso crema, ciboulette.",
    precio: 4000
  },
  {
    nombre: "Teriyaki Roll",
    categoria: "california envuelto en sesamo o ciboulette",
    descripcion: "Pollo teriyaki, palta, cebollin.",
    precio: 4500
  },
  {
    nombre: "Ebi Tempura Roll",
    categoria: "avocado envuelto en palta o queso",
    descripcion: "Camaron apanado, queso crema, cebollin.",
    precio: 4500
  },
  {
    nombre: "Tori Tempura Roll",
    categoria: "avocado envuelto en palta o queso",
    descripcion: "Pollo tempurizado, queso crema, cebollin.",
    precio: 4500
  },
  {
    nombre: "Sake Roll",
    categoria: "avocado envuelto en palta o queso",
    descripcion: "Salmon, palta, queso crema.",
    precio: 5000
  },
  {
    nombre: "Palmito Roll",
    categoria: "avocado envuelto en palta o queso",
    descripcion: "Palmito, queso crema, palta.",
    precio: 4200
  },
  {
    nombre: "Maki Roll",
    categoria: "avocado envuelto en palta o queso",
    descripcion: "Kanikama, queso crema, ciboulette.",
    precio: 4200
  },
  {
    nombre: "Teriyaki Roll",
    categoria: "avocado envuelto en palta o queso",
    descripcion: "Pollo teriyaki, palta, cebollin.",
    precio: 5000
  },
  {
    nombre: "Ebi Roll",
    categoria: "rolls calientes",
    descripcion: "Camaron, queso crema, cebollin.",
    precio: 5000
  },
  {
    nombre: "Tori Roll",
    categoria: "rolls calientes",
    descripcion: "Pollo, queso crema, cebollin.",
    precio: 5000
  },
  {
    nombre: "Sake Roll",
    categoria: "rolls calientes",
    descripcion: "Salmon, palta, queso crema.",
    precio: 5500
  },
  {
    nombre: "Veggie Roll",
    categoria: "rolls calientes",
    descripcion: "Champinon, queso crema, pimenton.",
    precio: 4500
  },
  {
    nombre: "Maki Roll",
    categoria: "rolls calientes",
    descripcion: "Kanikama, queso crema, ciboulette.",
    precio: 4500
  },
  {
    nombre: "Teriyaki Roll",
    categoria: "rolls calientes",
    descripcion: "Pollo teriyaki, queso crema, cebollin.",
    precio: 5500
  },
  {
    nombre: "Sashimi",
    categoria: "aperitivos",
    descripcion: "5 cortes de salmon o pescado blanco.",
    precio: 5500
  },
  {
    nombre: "Nigiris",
    categoria: "aperitivos",
    descripcion: "1 unidad de arroz cubierta con salmon, camaron o pescado blanco.",
    precio: 1000
  },
  {
    nombre: "Gyosas",
    categoria: "aperitivos",
    descripcion: "5 empanadas japonesas que pueden ser de pollo, camaron, cerdo o vegetariana.",
    precio: 3990
  },
  {
    nombre: "Sake Furay",
    categoria: "aperitivos",
    descripcion: "5 unidades de cortes de salmon apanado.",
    precio: 5000
  },
  {
    nombre: "Tori Furay",
    categoria: "aperitivos",
    descripcion: "5 unidades de cortes de filete pollo apanado.",
    precio: 4500
  },
  {
    nombre: "Ebi Furay",
    categoria: "aperitivos",
    descripcion: "5 unidades de camaron apanado.",
    precio: 4500
  },
  {
    nombre: "Hand Roll Ebi",
    categoria: "hand roll",
    descripcion: "Camaron, queso crema, cebollin.",
    precio: 3500
  },
  {
    nombre: "Hand Roll Tori",
    categoria: "hand roll",
    descripcion: "Pollo, queso crema, cebollin.",
    precio: 3000
  },
  {
    nombre: "Hand Roll Sake",
    categoria: "hand roll",
    descripcion: "Salmon, queso crema, cebollin.",
    precio: 3500
  },
  {
    nombre: "Hand Roll Vegetariano",
    categoria: "hand roll",
    descripcion: "Champinon, queso crema, cebollin.",
    precio: 3000
  },
  {
    nombre: "Hand Roll Maki",
    categoria: "hand roll",
    descripcion: "Kanikama, queso crema, cebollin.",
    precio: 3000
  },
  {
    nombre: "Sushi sin arroz Vegetariano",
    categoria: "sushi sin arroz",
    descripcion: "Pepino, champinon, palta, queso crema, palmito, cebollin.",
    precio: 5500
  },
  {
    nombre: "Sushi sin arroz Ebi Sake",
    categoria: "sushi sin arroz",
    descripcion: "Camaron, salmon, queso crema, palta, cebollin.",
    precio: 6000
  },
  {
    nombre: "Sushi sin arroz Ebi Tori",
    categoria: "sushi sin arroz",
    descripcion: "Camaron, pollo, queso crema, palta, cebollin.",
    precio: 6000
  },
  {
    nombre: "Sushi Burger Pollo",
    categoria: "sushiburger",
    descripcion: "Relleno de pollo apanado, palta, queso crema y cebollin.",
    precio: 6490
  },
  {
    nombre: "Sushi Burger Camaron",
    categoria: "sushiburger",
    descripcion: "Relleno de camaron apanado, palta, queso crema y cebollin.",
    precio: 6990
  },
  {
    nombre: "Sushi Burger Salmon",
    categoria: "sushiburger",
    descripcion: "Relleno de salmon, palta, queso crema y cebollin.",
    precio: 7490
  },
  {
    nombre: "Poke de Pollo",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, queso crema, pollo, palta, pepino, cebollin y sesamo + salsa.",
    precio: 6490
  },
  {
    nombre: "Poke de Pollo Apanado",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, queso crema, pollo apanado, palta, zanahoria y sesamo + salsa.",
    precio: 6990
  },
  {
    nombre: "Poke de Camaron",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, queso crema, camaron apanado, palta, pepino y sesamo + salsa.",
    precio: 6990
  },
  {
    nombre: "Poke de Salmon",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, queso crema, salmon, palta, pepino y sesamo + salsa.",
    precio: 6990
  },
  {
    nombre: "Poke de Veggie",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, palta, pepino, zanahoria, champinon y sesamo + salsa.",
    precio: 5990
  },
  {
    nombre: "Poke Cangrejo Teriyaki",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, cangrejo teriyaki, queso crema, palta y cebollin + salsa.",
    precio: 6490
  },
  {
    nombre: "Poke Camaron Apanado",
    categoria: "poke bowl",
    descripcion: "Arroz shari o nodle, pollo apanado, queso crema, palta y cebollin + salsa.",
    precio: 6990
  },
  {
    nombre: "Salsa adicional",
    categoria: "extras",
    descripcion: "Salsas disponibles: acevichada, teriyaki, mayo spicy, soya, ponzu, thai, huancaina, fuji, guasacaca, dinamita cangrejo, aceite de sesamo, mayonesa, limon o sriracha.",
    precio: 500
  },
  {
    nombre: "Vegetal adicional",
    categoria: "extras",
    precio: 1000
  },
  {
    nombre: "Proteina adicional",
    categoria: "extras",
    precio: 1500
  }
];

const promocionesFallback: PromocionCatalogo[] = [
  {
    nombre: "30 piezas premium",
    descripcion: "1 Acevichado Roll, 1 Sushi a la Huancaina y 1 Tori Fuji Roll.",
    precio: 14990,
    condiciones: "Sujeto a disponibilidad del dia."
  },
  {
    nombre: "50 piezas premium",
    descripcion: "2 Acevichado Roll, 1 Beef Roll, 1 Cangrejo Dinamita Roll y 1 Ceviche Roll.",
    precio: 24990,
    condiciones: "Sujeto a disponibilidad del dia."
  },
  {
    nombre: "20 piezas mixtas",
    descripcion: "10 pollo queso crema cebollin envuelto en panko y 10 camaron queso crema cebollin envuelto en sesamo.",
    precio: 7990,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "30 piezas fritas",
    descripcion: "10 pollo queso crema cebollin, 10 camaron queso crema cebollin y 10 kanikama queso crema cebollin.",
    precio: 10990,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "30 piezas mixtas",
    descripcion: "10 pollo palta cebollin envuelto en queso, 10 palmito queso crema ciboulette envuelto en palta y 10 kanikama queso crema cebollin envuelto en panko.",
    precio: 12500,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "40 piezas mixtas",
    descripcion: "10 camaron queso cebollin envuelto en palta, 10 pollo queso cebollin fritos, 10 kanikama queso ciboulette fritos y 10 pepino queso palta envuelto en sesamo.",
    precio: 13990,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "40 piezas fritas",
    descripcion: "Salmon queso palta envuelto en panko, pollo queso cebollin envuelto en panko, champinon queso cebollin envuelto en panko y camaron queso cebollin envuelto en panko.",
    precio: 14500,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "50 piezas opcion A",
    descripcion: "10 kanikama queso ciboulette futomaki frito, 10 camaron queso cebollin fritos, 10 pollo queso cebollin fritos, 10 salmon queso cebollin envuelto en palta y 10 palmito queso palta envuelto en sesamo.",
    precio: 15990,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "50 piezas opcion B",
    descripcion: "Pollo apanado envuelto en palta, camaron apanado envuelto en queso, salmon queso cebollin envuelto en panko, pollo queso cebollin envuelto en panko y kanikama queso cebollin envuelto en panko.",
    precio: 17500,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "70 piezas mixtas",
    descripcion: "10 camaron queso cebollin fritos, 10 pollo queso cebollin fritos, 10 kanikama queso ciboulette fritos, 10 salmon queso cebollin envuelto en palta, 10 palmito queso palta envuelto en queso, 10 pepino queso palta envuelto en sesamo y 10 pollo queso cebollin futomaki fritos.",
    precio: 21990,
    condiciones: "Promociones rolls 1."
  },
  {
    nombre: "80 piezas mixtas",
    descripcion: "20 pollo apanado en panko, 20 camaron apanado en panko, 10 salmon queso cebollin envuelto en sesamo, 10 camaron queso palta envuelto en queso, 10 pollo queso cebollin envuelto en palta, 10 palmito queso palta envuelto en ciboulette y futomaki pollo queso.",
    precio: 25000,
    condiciones: "Promociones rolls 2."
  },
  {
    nombre: "100 piezas mixtas",
    descripcion: "20 pollo queso cebollin en panko, 10 camaron queso cebollin en panko, 10 kanikama queso ciboulette en panko, 10 salmon queso cebollin en panko, 10 champinon queso cebollin en panko, 10 pollo queso crema palta envuelto en nori, 10 camaron queso cebollin envuelto en palta, 10 pepino queso cebollin envuelto en sesamo y 10 palmito queso cebollin envuelto en queso.",
    precio: 34990,
    condiciones: "Promociones rolls 2."
  },
  {
    nombre: "140 piezas mixtas",
    descripcion: "20 pollo queso cebollin en panko, 20 camaron queso cebollin en panko, 20 kanikama queso ciboulette en panko, 10 salmon queso cebollin en panko, 10 champinon queso cebollin en panko, 10 acevichado roll, 10 pollo queso crema palta envuelto en nori, 10 camaron queso cebollin envuelto en palta, 10 pepino queso cebollin envuelto en sesamo, 10 salmon queso ciboulette envuelto en palta y 10 palmito queso cebollin envuelto en queso.",
    precio: 44990,
    condiciones: "Promociones rolls 2."
  },
  {
    nombre: "200 piezas mixtas",
    descripcion: "40 pollo queso cebollin en panko, 30 camaron queso cebollin en panko, 20 kanikama queso ciboulette en panko, 10 salmon queso cebollin en panko, 10 champinon queso cebollin en panko, 20 pollo queso crema palta envuelto en nori, 10 camaron queso cebollin envuelto en palta, 10 pepino queso cebollin envuelto en sesamo, 10 salmon queso ciboulette envuelto en palta, 10 palmito queso cebollin envuelto en queso, 10 acevichado, 10 sushi a la huancaina y 10 beef roll.",
    precio: 64990,
    condiciones: "Promociones rolls 2."
  },
  {
    nombre: "Promo 2 pokes",
    descripcion: "Elige 2 pokes a eleccion.",
    precio: 12990,
    condiciones: "Promocion de pokes."
  },
  {
    nombre: "Promo 3 pokes",
    descripcion: "Elige 3 pokes a eleccion.",
    precio: 18990,
    condiciones: "Promocion de pokes."
  },
  {
    nombre: "Promo 5 pokes",
    descripcion: "Elige 5 pokes a eleccion.",
    precio: 29990,
    condiciones: "Promocion de pokes."
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
  const consultaNormalizada = normalizar(consulta);
  const pideCatalogoCompleto = /\b(menu|carta|catalogo|precios|productos)\b/.test(consultaNormalizada)
    || consultaNormalizada.includes("que tienen")
    || consultaNormalizada.includes("que venden");

  if (pideCatalogoCompleto) {
    return [...productos].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.precio - b.precio);
  }

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
