// ============================================================
// lib/modulos/types.ts — Tipos compartidos del sistema de módulos
// Fuente de verdad: .agents/skills/director-integracion/references/shared-types.md
// ============================================================

// --------------- Módulos del agente -------------------------

export type ModuloAgente =
  | 'BIENVENIDA'
  | 'CONSULTAS'
  | 'ATENCION'
  | 'PEDIDOS'
  | 'ORDEN_COMPRA'
  | 'ORDEN_CANCELACION'
  | 'CONFIRMACION'
  | 'TIPO_ENTREGA'
  | 'DIRECCION'
  | 'FORMAS_PAGO'
  | 'DAR_GRACIAS'
  | 'ENTREGA'
  | 'DESPEDIDA';

export const TRANSICIONES_VALIDAS: Record<ModuloAgente, ModuloAgente[]> = {
  BIENVENIDA:          ['CONSULTAS', 'PEDIDOS', 'ATENCION'],
  CONSULTAS:           ['PEDIDOS', 'TIPO_ENTREGA', 'ATENCION', 'DESPEDIDA'],
  ATENCION:            ['DESPEDIDA'],
  PEDIDOS:             ['PEDIDOS', 'ORDEN_COMPRA', 'TIPO_ENTREGA', 'ORDEN_CANCELACION', 'ATENCION'],
  ORDEN_COMPRA:        ['PEDIDOS', 'CONFIRMACION', 'ORDEN_CANCELACION'],
  ORDEN_CANCELACION:   ['DESPEDIDA', 'BIENVENIDA'],
  CONFIRMACION:        ['TIPO_ENTREGA', 'ORDEN_CANCELACION'],
  TIPO_ENTREGA:        ['DIRECCION', 'FORMAS_PAGO', 'ORDEN_CANCELACION'],
  DIRECCION:           ['FORMAS_PAGO', 'ATENCION', 'ORDEN_CANCELACION'],
  FORMAS_PAGO:         ['DAR_GRACIAS', 'ATENCION'],
  DAR_GRACIAS:         ['CONSULTAS', 'ENTREGA'],
  ENTREGA:             ['DESPEDIDA'],
  DESPEDIDA:           [],
};

// --------------- Item del carrito ---------------------------

export interface ItemCarritoWA {
  id: string;                     // cuid local para identificar el item en la sesión
  productId: string;              // UUID real de products en Supabase — OBLIGATORIO
  productName: string;            // snapshot del nombre para mostrar al cliente
  categoryName: string;           // snapshot de la categoría
  quantity: number;
  unitPrice: number;              // precio en pesos CLP
  notes: string;                  // "sin palta", "extra salsa", etc.
  variantId?: string;             // UUID de product_variants si aplica
  variantName?: string;
  modifiers: ModificadorItem[];
}

export interface ModificadorItem {
  id?: string;                    // UUID de product_modifiers si existe
  name: string;                   // snapshot del nombre
  priceDelta: number;             // delta en pesos (positivo = recargo)
}

// --------------- Contexto de sesión pedido ------------------

export interface SesionPedidoCtx {
  id: string;
  conversacionId: string;
  moduloActual: ModuloAgente;
  estadoSesion: 'activa' | 'completada' | 'cancelada' | 'esperando_humano';
  items: ItemCarritoWA[];
  modalidad?: 'retiro_local' | 'despacho';
  nombreCliente?: string;
  telefonoCliente?: string;
  direccion?: DireccionCliente;
  costoDespacho?: number;
  metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';
  externalOrderId?: string;
  externalOrderNumber?: string;
  intentosConfirmacion: number;
  ultimaActividadEn: Date;
}

export interface DireccionCliente {
  street: string;
  district: string;              // comuna — debe existir en delivery_zones.district
  reference?: string;
  lat?: number;
  lng?: number;
  zonaSupabaseId?: string;       // UUID de delivery_zones para la RPC
  costoCalculado?: number;       // fee de la zona, en pesos CLP
  tiempoEstimadoMin?: number;
}

// --------------- Respuesta de cada módulo -------------------

export interface MediaAEnviar {
  tipo: "imagen" | "documento";
  url: string;
  caption?: string;
  nombre?: string;          // filename para documentos PDF
}

export interface RespuestaModulo {
  respuesta: string;                         // texto que se envía al cliente por WhatsApp
  moduloSiguiente?: ModuloAgente;            // transición explícita
  actualizarSesion?: Partial<SesionPedidoCtx>;
  requiereHumano?: boolean;
  mediaAEnviar?: MediaAEnviar[];            // imágenes/docs a enviar antes del texto
  catalogoVisual?: {
    nombre: string;
    url: string;
    tipo: string;
    prioridadEnvio: boolean;
  } | null;
}

// --------------- Resultado de crear orden en Supabase -------

export interface ResultadoOrdenWA {
  orderId: string;
  number: string;                // Ej: "PR-1042"
  total: number;
  estimatedReadyAt: string | null;
  customerId: string | null;
}

// --------------- Zona de despacho resuelta ------------------

export interface ZonaDespachoResuelta {
  zonaId: string;                // UUID de delivery_zones en Supabase
  zonaNombre: string;
  district: string;              // nombre de la comuna
  costo: number;                 // fee en pesos CLP
  tiempoBaseMinutos: number;     // base_minutes de la zona
  distanciaKm?: number;          // calculada por geocodificación (informativo)
}

// --------------- Producto resuelto --------------------------

export interface ProductoResuelto {
  productId: string;             // UUID real en products de Supabase
  productName: string;
  categoryName: string;
  unitPrice: number;
  status: 'activo' | 'inactivo';
  imageUrl?: string | null;
  variants: VarianteProducto[];
  modifierGroups: GrupoModificador[];
}

export interface VarianteProducto {
  id: string;
  name: string;
  price: number;                 // precio ABSOLUTO de la variante (no delta) — columna `price` en product_variants
}

export interface GrupoModificador {
  id: string;
  name: string;
  isRequired?: boolean;
  modifiers: { id: string; name: string; priceDelta: number }[];
}

// --------------- Webhook pedido-listo -----------------------

export interface WebhookPedidoListoPayload {
  type: 'UPDATE';
  table: 'orders';
  schema: 'public';
  record: {
    id: string;
    number: string;
    status: string;
    source: 'pos' | 'web' | 'whatsapp';
    customer_phone_snapshot: string | null;
    customer_name_snapshot: string | null;
    type: 'retiro_local' | 'despacho';
  };
  old_record: {
    status: string;
  };
}

// --------------- Perfil cliente frecuente -------------------

export interface PerfilClienteFrecuente {
  customer: {
    id: string;
    fullName: string;
    phone: string;
  };
  addresses: {
    id: string;
    label: string;
    street: string;
    district: string;
    reference?: string;
    isDefault: boolean;
  }[];
  recentOrders: {
    id: string;
    number: string;
    createdAt: string;
    total: number;
    type: string;
    itemsSummary: string[];
  }[];
  recommendedProducts: {
    productId: string;
    productName: string;
    categoryName: string;
    imageUrl: string | null;
    unitPrice: number;
    orderCount: number;
    lastOrderedAt: string;
  }[];
}

// --------------- Mensaje de despacho (entrada al dispatcher) -

export interface MensajeDespacho {
  texto: string;
  conversacionId: string;
  canal: 'whatsapp' | 'instagram' | 'facebook';
  localId: string;
  cliente?: string;
  telefonoCliente?: string;
  idMensajeMeta?: string;
  historial?: { rol: 'cliente' | 'agente'; texto: string }[];
}
