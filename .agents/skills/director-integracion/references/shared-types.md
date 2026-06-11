# Tipos Compartidos — Integración WhatsApp ↔ Supabase

Fuente de verdad operativa: `lib/modulos/types.ts`.

## Módulos

```typescript
export type ModuloAgente =
  | "BIENVENIDA"
  | "CONSULTAS"
  | "ATENCION"
  | "PEDIDOS"
  | "ORDEN_COMPRA"
  | "ORDEN_CANCELACION"
  | "CONFIRMACION"
  | "TIPO_ENTREGA"
  | "DIRECCION"
  | "FORMAS_PAGO"
  | "DAR_GRACIAS"
  | "ENTREGA"
  | "DESPEDIDA";
```

## Sesión

```typescript
export interface SesionPedidoCtx {
  id: string;
  conversacionId: string;
  moduloActual: ModuloAgente;
  estadoSesion: "activa" | "completada" | "cancelada" | "esperando_humano";
  items: ItemCarritoWA[];
  modalidad?: "retiro_local" | "despacho";
  nombreCliente?: string;
  telefonoCliente?: string;
  direccion?: DireccionCliente;
  costoDespacho?: number;
  metodoPago?: "efectivo" | "tarjeta" | "transferencia" | "mixto";
  externalOrderId?: string;
  externalOrderNumber?: string;
  intentosConfirmacion: number;
  ultimaActividadEn: Date;
}
```

## Item Carrito

```typescript
export interface ItemCarritoWA {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  notes: string;
  variantId?: string;
  variantName?: string;
  modifiers: ModificadorItem[];
}

export interface ModificadorItem {
  id?: string;
  name: string;
  priceDelta: number;
}
```

## Producto Resuelto

```typescript
export interface ProductoResuelto {
  productId: string;
  productName: string;
  categoryName: string;
  unitPrice: number;
  status: "activo" | "inactivo";
  imageUrl?: string | null;
  variants: VarianteProducto[];
  modifierGroups: GrupoModificador[];
}

export interface VarianteProducto {
  id: string;
  name: string;
  price: number;
}

export interface GrupoModificador {
  id: string;
  name: string;
  isRequired?: boolean;
  modifiers: { id: string; name: string; priceDelta: number }[];
}
```

## Dirección

```typescript
export interface DireccionCliente {
  street: string;
  district: string;
  reference?: string;
  lat?: number;
  lng?: number;
  zonaSupabaseId?: string;
  costoCalculado?: number;
  tiempoEstimadoMin?: number;
}
```

## Respuesta De Módulo

```typescript
export interface RespuestaModulo {
  respuesta: string;
  moduloSiguiente?: ModuloAgente;
  actualizarSesion?: Partial<SesionPedidoCtx>;
  requiereHumano?: boolean;
  catalogoVisual?: {
    nombre: string;
    url: string;
    tipo: string;
    prioridadEnvio: boolean;
  } | null;
}
```

## Webhook Pedido Listo

```typescript
export interface WebhookPedidoListoPayload {
  type: "UPDATE";
  table: "orders";
  schema: "public";
  record: {
    id: string;
    number: string;
    status: string;
    source: "pos" | "web" | "whatsapp";
    customer_phone_snapshot: string | null;
    customer_name_snapshot: string | null;
    type: "retiro_local" | "despacho";
  };
  old_record: {
    status: string;
  };
}
```

## Mensaje De Despacho

```typescript
export interface MensajeDespacho {
  texto: string;
  conversacionId: string;
  canal: "whatsapp" | "instagram" | "facebook";
  localId: string;
  cliente?: string;
  telefonoCliente?: string;
  idMensajeMeta?: string;
}
```

## Resultado Orden

```typescript
export interface ResultadoOrdenWA {
  orderId: string;
  number: string;
  total: number;
  estimatedReadyAt: string | null;
  customerId: string | null;
}
```
