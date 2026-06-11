---
name: arquitecto-modulos-agente-ia
role: Oleada 3 — dispatcher, types, máquina de estados
---

# Arquitecto de Módulos del Agente IA

## Propósito

Crear la infraestructura que hace posible el agente modular: el dispatcher central,
los tipos TypeScript compartidos y la validación de transiciones de módulo.
Todo el resto de los módulos (M01–M13) depende de lo que este agente construye.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivos a crear:**
  - `lib/modulos/types.ts`
  - `lib/modulos/dispatcher.ts`
- **Depende de:** Agente 05 (Prisma schema con SesionPedido) y Agente 03 (Prisma/Neon helpers)

## Leer antes de empezar

- `references/shared-types.md` — fuente de verdad para todos los tipos
- `references/module-flow.md` — transiciones válidas entre módulos

## Tarea 1 — Crear `lib/modulos/types.ts`

Implementar exactamente los tipos definidos en `references/shared-types.md`.
Exportar: `ModuloAgente`, `TRANSICIONES_VALIDAS`, `ItemCarritoWA`, `ModificadorItem`,
`SesionPedidoCtx`, `DireccionCliente`, `RespuestaModulo`, `ResultadoOrdenWA`, `ZonaDespachoResuelta`.

## Tarea 2 — Crear `lib/modulos/dispatcher.ts`

```typescript
import { guardarLogModulo, obtenerSesionPedido } from '@/lib/db-helpers';
import type { MensajeEntrante } from '@/lib/agente';
import type { RespuestaModulo, ModuloAgente, SesionPedidoCtx, TRANSICIONES_VALIDAS } from './types';

// Importación lazy para evitar que el dispatcher dependa de implementaciones concretas
// en tiempo de compilación. Cada handler se importa dinámicamente.
const handlers: Record<ModuloAgente, () => Promise<{ ejecutar: Function }>> = {
  BIENVENIDA:          () => import('./m01-bienvenida'),
  CONSULTAS:           () => import('./m02-consultas'),
  ATENCION:            () => import('./m03-atencion'),
  PEDIDOS:             () => import('./m04-pedidos'),
  ORDEN_COMPRA:        () => import('./m05-orden-compra'),
  ORDEN_CANCELACION:   () => import('./m06-orden-cancelacion'),
  CONFIRMACION:        () => import('./m07-confirmacion'),
  TIPO_ENTREGA:        () => import('./m08-tipo-entrega'),
  DIRECCION:           () => import('./m09-direccion'),
  FORMAS_PAGO:         () => import('./m10-formas-pago'),
  DAR_GRACIAS:         () => import('./m11-dar-gracias'),
  ENTREGA:             () => import('./m12-entrega'),
  DESPEDIDA:           () => import('./m13-despedida'),
};

export async function despacharModulo(
  mensaje: MensajeEntrante,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const modulo = (sesion?.moduloActual ?? 'BIENVENIDA') as ModuloAgente;
  const inicio = Date.now();
  const sesionId = sesion?.id;

  try {
    const handler = await handlers[modulo]();
    const resultado: RespuestaModulo = await handler.ejecutar(mensaje, sesion);

    // Validar que la transición es válida
    if (resultado.moduloSiguiente) {
      validarTransicion(modulo, resultado.moduloSiguiente as ModuloAgente);
    }

    await guardarLogModulo({
      sesionPedidoId: sesionId,
      modulo,
      mensajeEntrada: mensaje.texto,
      respuestaSalida: resultado.respuesta,
      transicionHacia: resultado.moduloSiguiente ?? null,
      exito: true,
      duracionMs: Date.now() - inicio,
    });

    return resultado;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    await guardarLogModulo({
      sesionPedidoId: sesionId,
      modulo,
      mensajeEntrada: mensaje.texto,
      respuestaSalida: '',
      exito: false,
      errorDetalle: errorMsg,
      duracionMs: Date.now() - inicio,
    });

    // Fallback seguro: escalar a humano con mensaje genérico
    return {
      respuesta: 'Tuvimos un problema técnico. Un miembro de nuestro equipo te atenderá en breve.',
      moduloSiguiente: 'ATENCION',
      requiereHumano: true,
    };
  }
}

function validarTransicion(actual: ModuloAgente, siguiente: ModuloAgente): void {
  const permitidos = TRANSICIONES_VALIDAS[actual] ?? [];
  if (!permitidos.includes(siguiente)) {
    console.warn(`[Dispatcher] Transición no permitida: ${actual} → ${siguiente}`);
    // No lanzar error en producción — solo loggear
  }
}
```

## Tarea 3 — Crear estructura de carpetas

```
lib/modulos/
├── types.ts
├── dispatcher.ts
├── prompts/          ← Agente 13 crea los prompts aquí
│   ├── m01.ts
│   ├── m02.ts
│   └── ...
├── m01-bienvenida.ts ← Agentes 15/16/17 implementan estos
├── m02-consultas.ts
└── ...
```

## Entregables

- `lib/modulos/types.ts` con todos los tipos
- `lib/modulos/dispatcher.ts` con el switch + logging
- Carpeta `lib/modulos/prompts/` creada (vacía, Agente 13 la llena)
- Confirmar a Agentes 15, 16, 17 que pueden empezar a implementar módulos
