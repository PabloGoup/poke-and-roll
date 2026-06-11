import { createClient } from '@supabase/supabase-js';
import type {
  ItemCarritoWA,
  ProductoResuelto,
  ResultadoOrdenWA,
  SesionPedidoCtx,
} from '@/lib/modulos/types';

type CatalogoProductoRpc = {
  id: string;
  name: string;
  categoryName: string;
  unitPrice: number;
  status: 'activo' | 'inactivo';
  imageUrl?: string | null;
  variants: { id: string; name: string; price: number }[];
  modifierGroups: {
    id: string;
    name: string;
    isRequired?: boolean;
    modifiers: { id: string; name: string; priceDelta: number }[];
  }[];
};

const supabase = createClient(
  process.env.SUPABASE_PEDIDOS_URL!,
  process.env.SUPABASE_PEDIDOS_ANON_KEY!
);

// Cache en memoria con TTL 5 minutos
let catalogoCache: ProductoResuelto[] | null = null;
let catalogoCacheAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function obtenerCatalogoProductos(): Promise<ProductoResuelto[]> {
  if (catalogoCache && Date.now() - catalogoCacheAt < CACHE_TTL_MS) {
    return catalogoCache;
  }
  const { data, error } = await supabase.rpc('buscar_productos_activos');
  if (error) throw new Error(`Error obteniendo catálogo: ${error.message}`);
  // Mapear id → productId para compatibilidad con ItemCarritoWA
  const productos = Array.isArray(data) ? (data as CatalogoProductoRpc[]) : [];
  catalogoCache = productos.map((p) => ({
    productId: p.id,
    productName: p.name,
    categoryName: p.categoryName,
    unitPrice: p.unitPrice,
    status: p.status,
    imageUrl: p.imageUrl ?? null,
    variants: p.variants ?? [],
    modifierGroups: p.modifierGroups ?? [],
  }));
  catalogoCacheAt = Date.now();
  return catalogoCache!;
}

export function invalidarCacheProductos() {
  catalogoCache = null;
}

// Sinónimos: mapeo de términos alternativos a como aparecen en el catálogo.
// "gohan" es equivalente a "poke" — misma preparación, distinto nombre coloquial.
const SINONIMOS: [RegExp, string][] = [
  [/\bgohanes?\b/gi, 'poke'],      // "gohan" / "gohanes" = poke bowl
  [/\bpokee?\b/gi, 'poke'],        // "pokee" / typos
  [/\bbol\b/gi, 'poke'],           // "bol de salmón" → poke de salmón
];

function aplicarSinonimos(texto: string): string {
  let resultado = texto;
  for (const [patron, reemplazo] of SINONIMOS) {
    resultado = resultado.replace(patron, reemplazo);
  }
  return resultado;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similitudLevenshtein(a: string, b: string): number {
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length, 1);
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

export async function resolverItemsCarrito(
  items: { nombre: string; cantidad: number; notas?: string }[]
): Promise<{ resueltos: ItemCarritoWA[]; noEncontrados: string[] }> {
  const catalogo = await obtenerCatalogoProductos();
  const resueltos: ItemCarritoWA[] = [];
  const noEncontrados: string[] = [];

  for (const item of items) {
    // Aplicar sinónimos antes de normalizar (gohan → poke, bol → poke, etc.)
    const nombreConSinonimos = aplicarSinonimos(item.nombre);
    const nombreNorm = normalizar(nombreConSinonimos);

    // Nivel 1: match exacto
    let producto = catalogo.find(p => normalizar(p.productName) === nombreNorm);
    // Nivel 2: catálogo contiene texto del cliente
    if (!producto) producto = catalogo.find(p => normalizar(p.productName).includes(nombreNorm));
    // Nivel 3: texto del cliente contiene nombre del catálogo
    if (!producto) producto = catalogo.find(p => nombreNorm.includes(normalizar(p.productName)));
    // Nivel 4: match por palabras clave (todas las palabras del cliente presentes en el nombre)
    if (!producto) {
      const palabras = nombreNorm.split(/\s+/).filter(p => p.length > 2);
      if (palabras.length > 0) {
        producto = catalogo.find(p => {
          const nc = normalizar(p.productName);
          return palabras.every(palabra => nc.includes(palabra));
        });
      }
    }
    // Nivel 5: match difuso — al menos la mitad de palabras coinciden (tolerancia a errores de escritura)
    if (!producto) {
      const palabras = nombreNorm.split(/\s+/).filter(p => p.length > 2);
      if (palabras.length > 0) {
        producto = catalogo
          .map(p => {
            const nc = normalizar(p.productName);
            const coincidencias = palabras.filter(palabra => nc.includes(palabra)).length;
            return { producto: p, ratio: coincidencias / palabras.length };
          })
          .filter(r => r.ratio >= 0.5)
          .sort((a, b) => b.ratio - a.ratio)[0]?.producto;
      }
    }
    // Nivel 6: similitud de caracteres por bigramas (captura "acevichao" → "acevichado")
    if (!producto) {
      const bigramas = (s: string) => {
        const set = new Set<string>();
        for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
        return set;
      };
      const bg = bigramas(nombreNorm);
      const mejor = catalogo
        .map(p => {
          const bgP = bigramas(normalizar(p.productName));
          const interseccion = [...bg].filter(b => bgP.has(b)).length;
          const union = new Set([...bg, ...bgP]).size;
          return { producto: p, similitud: union > 0 ? interseccion / union : 0 };
        })
        .filter(r => r.similitud >= 0.4)
        .sort((a, b) => b.similitud - a.similitud)[0];
      if (mejor) producto = mejor.producto;
    }

    // Nivel 7: Levenshtein por palabras — captura errores en palabras cortas ("pokee", "prmo")
    if (!producto) {
      const palabrasCliente = nombreNorm.split(/\s+/).filter(p => p.length >= 3);
      if (palabrasCliente.length > 0) {
        producto = catalogo
          .map(p => {
            const palabrasProd = normalizar(p.productName).split(/\s+/);
            let totalSim = 0;
            let matches = 0;
            for (const pc of palabrasCliente) {
              const mejorSim = Math.max(...palabrasProd.map(pp => similitudLevenshtein(pc, pp)));
              if (mejorSim >= 0.65) { totalSim += mejorSim; matches++; }
            }
            return { producto: p, score: matches > 0 ? totalSim / palabrasCliente.length : 0 };
          })
          .filter(r => r.score >= 0.5)
          .sort((a, b) => b.score - a.score)[0]?.producto;
      }
    }

    if (producto && producto.status === 'activo') {
      resueltos.push({
        id: crypto.randomUUID(),
        productId: producto.productId,
        productName: producto.productName,
        categoryName: producto.categoryName,
        quantity: item.cantidad,
        unitPrice: producto.unitPrice,
        notes: item.notas ?? '',
        modifiers: [],
      });
    } else {
      noEncontrados.push(item.nombre);
    }
  }

  return { resueltos, noEncontrados };
}

export async function crearOrdenWhatsApp(sesion: SesionPedidoCtx): Promise<ResultadoOrdenWA> {
  if (!sesion.items || sesion.items.length === 0) {
    throw new Error('No hay items en el carrito');
  }

  const cashierId = process.env.WHATSAPP_BOT_CASHIER_ID;
  const subtotal = sesion.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const total = subtotal + (sesion.costoDespacho ?? 0);

  // La RPC recibe un único parámetro `payload jsonb` que contiene cart y checkout
  const { data, error } = await supabase.rpc('create_storefront_order', {
    payload: {
      cart: sesion.items,
      checkout: {
        source: 'whatsapp',
        cashier_id: cashierId ?? null,
        type: sesion.modalidad ?? 'retiro_local',
        paymentMethod: sesion.metodoPago ?? 'efectivo',
        paymentBreakdown: {
          cash: sesion.metodoPago === 'efectivo' ? total : 0,
          card: sesion.metodoPago === 'tarjeta' ? total : 0,
          transfer: sesion.metodoPago === 'transferencia' || sesion.metodoPago === 'mixto' ? total : 0,
        },
        discountAmount: 0,
        promotionAmount: 0,
        deliveryFee: sesion.costoDespacho ?? 0,
        extraCharges: [],
        customerName: sesion.nombreCliente ?? '',
        customerPhone: (sesion.telefonoCliente ?? '').replace(/\D/g, ''),
        addressLabel: sesion.modalidad === 'despacho' ? 'Delivery' : '',
        addressStreet: sesion.direccion?.street ?? '',
        addressDistrict: sesion.direccion?.district ?? '',
        addressReference: sesion.direccion?.reference ?? '',
        notes: '',
      },
    },
  });

  if (error) throw new Error(error.message);
  return data as ResultadoOrdenWA;
}

export async function obtenerPerfilCliente(telefono: string) {
  const { data, error } = await supabase.rpc('get_storefront_customer_profile', {
    customer_phone: telefono.replace(/\D/g, ''),
  });
  if (error) return null;
  return data;
}

export async function consultarEstadoOrden(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, number, status, estimated_ready_at')
    .eq('id', orderId)
    .single();
  if (error) return null;
  return data;
}

export async function cancelarOrdenSupabase(orderId: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelado', cancellation_reason: 'cliente_solicito' })
    .eq('id', orderId)
    .eq('status', 'pendiente'); // solo si está pendiente, no si ya está en_preparacion

  return !error;
}
