// ============================================================
// lib/modulos/guards.ts — Guards de cancelación, timeouts e intentos máximos
// Oleada 3: Especialista en Estado de Pedidos
// ============================================================

import type { SesionPedidoCtx, ModuloAgente } from './types';

const MODULOS_CANCELABLES: ModuloAgente[] = [
  'PEDIDOS', 'ORDEN_COMPRA', 'CONFIRMACION',
  'TIPO_ENTREGA', 'DIRECCION', 'FORMAS_PAGO',
];

const PALABRAS_CANCELAR = [
  'cancelar', 'cancela', 'cancelo', 'no quiero', 'olvidalo', 'olvídalo',
  'déjalo', 'dejalo', 'no gracias', 'mejor no', 'no voy a pedir',
  'me arrepentí', 'me arrepenti',
];

const TIMEOUT_MINUTOS: Partial<Record<ModuloAgente, number>> = {
  PEDIDOS: 10,
  ORDEN_COMPRA: 5,
  CONFIRMACION: 5,
  TIPO_ENTREGA: 5,
  DIRECCION: 8,
  FORMAS_PAGO: 5,
};

export const MENSAJES_CANCELACION: Record<string, string> = {
  timeout: 'Tu pedido fue cancelado por inactividad. Si quieres pedir de nuevo, escríbenos cuando quieras. 🍣',
  max_intentos: 'Parece que hay dudas con el pedido. Lo cancelé por ahora. Si necesitas ayuda, escríbenos.',
  cliente_cancela: '¡Entendido! Tu pedido fue cancelado. Cuando quieras pedir, aquí estamos. 🍣',
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function detectarCancelacion(texto: string, modulo: ModuloAgente): boolean {
  if (!MODULOS_CANCELABLES.includes(modulo)) return false;
  const norm = normalizar(texto);
  return PALABRAS_CANCELAR.some(p => norm.includes(normalizar(p)));
}

export function verificarTimeout(sesion: SesionPedidoCtx): boolean {
  const modulo = sesion.moduloActual as ModuloAgente;
  const timeoutMin = TIMEOUT_MINUTOS[modulo];
  if (!timeoutMin) return false;
  const minutos = (Date.now() - new Date(sesion.ultimaActividadEn).getTime()) / 60000;
  return minutos > timeoutMin;
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
