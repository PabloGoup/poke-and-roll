---
name: ingeniero-prisma-neon
role: Oleada 1 — schema y helpers de base de datos
---

# Ingeniero Prisma/Neon

## Propósito

Agregar los modelos `SesionPedido` y `LogModulo` al schema Prisma de Poke and roll,
crear la migración y los helpers necesarios para que los módulos del agente puedan
leer y escribir el estado de la sesión de pedido.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Schema:** `prisma/schema.prisma`
- **Helpers:** `lib/db-helpers.ts`
- **Tipos:** ver `references/shared-types.md`

## Leer antes de empezar

- `references/shared-types.md` — interface `SesionPedidoCtx` y `ModuloAgente`
- `references/bloqueantes.md` — no hay bloqueantes que afecten a Prisma directamente
- El modelo `Conversacion` ya existe con id, localId, clienteId, canal, estado

## Tareas

### 1. Agregar modelos al schema

En `prisma/schema.prisma`, agregar después de `Conversacion`:

```prisma
model SesionPedido {
  id                    String       @id @default(cuid())
  conversacionId        String       @unique @map("conversacion_id")
  conversacion          Conversacion @relation(fields: [conversacionId], references: [id])
  moduloActual          String       @default("BIENVENIDA") @map("modulo_actual")
  estadoSesion          String       @default("activa") @map("estado_sesion")
  items                 Json         @default("[]")
  modalidad             String?
  nombreCliente         String?      @map("nombre_cliente")
  telefonoCliente       String?      @map("telefono_cliente")
  direccion             Json?
  costoDespacho         Int?         @map("costo_despacho")
  metodoPago            String?      @map("metodo_pago")
  externalOrderId       String?      @map("external_order_id")
  externalOrderNumber   String?      @map("external_order_number")
  intentosConfirmacion  Int          @default(0) @map("intentos_confirmacion")
  ultimaActividadEn     DateTime     @default(now()) @map("ultima_actividad_en")
  creadoEn              DateTime     @default(now()) @map("creado_en")
  actualizadoEn         DateTime     @updatedAt @map("actualizado_en")
  logs                  LogModulo[]
  @@map("sesiones_pedido")
}

model LogModulo {
  id              String       @id @default(cuid())
  sesionPedidoId  String?      @map("sesion_pedido_id")
  sesionPedido    SesionPedido? @relation(fields: [sesionPedidoId], references: [id])
  modulo          String
  mensajeEntrada  String       @map("mensaje_entrada") @db.Text
  respuestaSalida String       @map("respuesta_salida") @db.Text
  transicionHacia String?      @map("transicion_hacia")
  exito           Boolean      @default(true)
  errorDetalle    String?      @map("error_detalle") @db.Text
  duracionMs      Int?         @map("duracion_ms")
  creadoEn        DateTime     @default(now()) @map("creado_en")
  @@index([sesionPedidoId, modulo])
  @@index([creadoEn])
  @@map("logs_modulo")
}
```

Agregar relación en `Conversacion`:
```prisma
sesionPedido    SesionPedido?
```

### 2. Crear migración

```bash
cd "/Users/ptoledos/Documents/Poke and roll"
npx prisma migrate dev --name add-sesion-pedido-modular
```

### 3. Agregar helpers en `lib/db-helpers.ts`

Al final del archivo existente:

```typescript
// ─── Helpers SesionPedido ──────────────────────────────────────────────────

export async function obtenerSesionPedido(conversacionId: string) {
  return prisma.sesionPedido.findUnique({
    where: { conversacionId },
    include: { logs: { orderBy: { creadoEn: 'asc' }, take: 50 } },
  });
}

export async function upsertSesionPedido(
  conversacionId: string,
  data: {
    moduloActual?: string;
    estadoSesion?: string;
    items?: object[];
    modalidad?: string;
    nombreCliente?: string;
    telefonoCliente?: string;
    direccion?: object;
    costoDespacho?: number;
    metodoPago?: string;
    externalOrderId?: string;
    externalOrderNumber?: string;
    intentosConfirmacion?: number;
  }
) {
  const ahora = new Date();
  return prisma.sesionPedido.upsert({
    where: { conversacionId },
    update: { ...data as never, ultimaActividadEn: ahora },
    create: { conversacionId, ...data as never, ultimaActividadEn: ahora },
  });
}

export async function transicionarModulo(
  conversacionId: string,
  moduloSiguiente: string,
  actualizaciones?: object
) {
  return upsertSesionPedido(conversacionId, {
    moduloActual: moduloSiguiente,
    ...actualizaciones,
  });
}

export async function guardarLogModulo(params: {
  sesionPedidoId?: string;
  modulo: string;
  mensajeEntrada: string;
  respuestaSalida: string;
  transicionHacia?: string | null;
  exito: boolean;
  errorDetalle?: string;
  duracionMs?: number;
}) {
  return prisma.logModulo.create({ data: params as never });
}

export async function cerrarSesionPedido(
  conversacionId: string,
  estado: 'completada' | 'cancelada'
) {
  return prisma.sesionPedido.update({
    where: { conversacionId },
    data: { estadoSesion: estado, moduloActual: 'DESPEDIDA' },
  });
}
```

## Entregables

- Schema Prisma actualizado con `SesionPedido` y `LogModulo`
- Migración ejecutada exitosamente
- Helpers agregados a `lib/db-helpers.ts`
- Confirmar al Director que Oleada 3 puede comenzar
