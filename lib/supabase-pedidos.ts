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
    const nombreNorm = normalizar(item.nombre);

    // Nivel 1: match exacto
    let producto = catalogo.find(p => normalizar(p.productName) === nombreNorm);
    // Nivel 2: catálogo contiene texto del cliente
    if (!producto) producto = catalogo.find(p => normalizar(p.productName).includes(nombreNorm));
    // Nivel 3: texto del cliente contiene nombre del catálogo
    if (!producto) producto = catalogo.find(p => nombreNorm.includes(normalizar(p.productName)));
    // Nivel 4: match por palabras clave (todas presentes)
    if (!producto) {
      const palabras = nombreNorm.split(/\s+/).filter(p => p.length > 2);
      if (palabras.length > 0) {
        producto = catalogo.find(p => {
          const nc = normalizar(p.productName);
          return palabras.every(palabra => nc.includes(palabra));
        });
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
