---
name: especialista-estado-pedidos
role: Oleada 3 — guards, timeouts y transiciones de la máquina de estados
---

# Especialista en Estado de Pedidos

## Propósito

Implementar la lógica de control que garantiza la integridad de la máquina de estados:
timeouts, guards, cancelación automática, y detección de "cancelar" en cualquier módulo activo.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a crear:** `lib/modulos/guards.ts`
- **Archivo a modificar:** `app/api/webhooks/whatsapp/route.ts` (Agente 19 lo implementa, este agente define los guards)

## Leer antes de empezar

- `references/module-flow.md` — módulos que pueden cancelarse, timeouts
- Feedback del Agente 02 (Experto Restaurante) sobre tiempos apropiados

## Tarea 1 — Crear `lib/modulos/guards.ts`

```typescript
import type { SesionPedidoCtx, ModuloAgente } from './types';

// Módulos donde aplica la detección de "cancelar"
const MODULOS_CANCELABLES: ModuloAgente[] = [
  'PEDIDOS', 'ORDEN_COMPRA', 'CONFIRMACION',
  'TIPO_ENTREGA', 'DIRECCION', 'FORMAS_PAGO',
];

// Palabras que indican cancelación
const PALABRAS_CANCELAR = [
  'cancelar', 'cancela', 'cancelo', 'no quiero', 'olvidalo', 'olvídalo',
  'déjalo', 'dejalo', 'no gracias', 'mejor no', 'no voy a pedir',
];

// Timeout en minutos por módulo
const TIMEOUT_MINUTOS: Partial<Record<ModuloAgente, number>> = {
  PEDIDOS: 10,
  ORDEN_COMPRA: 5,
  CONFIRMACION: 5,
  TIPO_ENTREGA: 5,
  DIRECCION: 8,
  FORMAS_PAGO: 5,
};

export function detectarCancelacion(texto: string, modulo: ModuloAgente): boolean {
  if (!MODULOS_CANCELABLES.includes(modulo)) return false;
  const normalizado = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return PALABRAS_CANCELAR.some(p => normalizado.includes(p));
}

export function verificarTimeout(sesion: SesionPedidoCtx): boolean {
  const modulo = sesion.moduloActual as ModuloAgente;
  const timeoutMin = TIMEOUT_MINUTOS[modulo];
  if (!timeoutMin) return false;
  
  const minutosTranscurridos = (Date.now() - sesion.ultimaActividadEn.getTime()) / 60000;
  return minutosTranscurridos > timeoutMin;
}

export function verificarMaxIntentos(sesion: SesionPedidoCtx): boolean {
  return sesion.moduloActual === 'CONFIRMACION' && sesion.intentosConfirmacion >= 3;
}

export type GuardResult =
  | { accion: 'continuar' }
  | { accion: 'cancelar'; motivo: 'timeout' | 'max_intentos' | 'cliente_cancela' }
  | { accion: 'escalar'; motivo: string };

export function evaluarGuards(
  texto: string,
  sesion: SesionPedidoCtx | null
): GuardResult {
  if (!sesion || sesion.estadoSesion !== 'activa') {
    return { accion: 'continuar' };
  }

  if (verificarTimeout(sesion)) {
    return { accion: 'cancelar', motivo: 'timeout' };
  }

  if (verificarMaxIntentos(sesion)) {
    return { accion: 'cancelar', motivo: 'max_intentos' };
  }

  if (detectarCancelacion(texto, sesion.moduloActual as ModuloAgente)) {
    return { accion: 'cancelar', motivo: 'cliente_cancela' };
  }

  return { accion: 'continuar' };
}
```

## Tarea 2 — Mensajes de guard para cada caso

Definir en `lib/modulos/guards.ts` los mensajes que cada caso de cancelación retorna:

```typescript
export const MENSAJES_CANCELACION = {
  timeout: 'Tu pedido fue cancelado por inactividad. Si quieres pedir de nuevo, escríbenos cuando quieras.',
  max_intentos: 'Parece que hay dudas con el pedido. Lo cancelé por ahora. Si necesitas ayuda, escríbenos.',
  cliente_cancela: '¡Entendido! Tu pedido fue cancelado. Cuando quieras pedir, aquí estamos. 🍣',
};
```

## Tarea 3 — Documentar para Agente 19

El webhook handler (`app/api/webhooks/whatsapp/route.ts`) debe llamar `evaluarGuards()`
ANTES de despachar al módulo. Si el resultado es `{ accion: 'cancelar' }`:
1. Actualizar sesión a `estadoSesion='cancelada'`
2. Retornar el mensaje de cancelación al cliente
3. NO llamar a `despacharModulo()`

## Entregables

- `lib/modulos/guards.ts` con todas las funciones
- Mensajes de cancelación definidos
- Nota a Agente 19 sobre cómo integrar los guards en el webhook handler
