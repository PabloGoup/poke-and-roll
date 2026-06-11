import type { ItemCarritoWA, SesionPedidoCtx } from './types';

export function normalizarTexto(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function formatearPrecio(pesos: number) {
  return `$${pesos.toLocaleString('es-CL')}`;
}

export function calcularSubtotalItems(items: ItemCarritoWA[]) {
  return items.reduce((acc, item) => {
    const recargos = item.modifiers.reduce((total, mod) => total + mod.priceDelta, 0);
    return acc + (item.unitPrice + recargos) * item.quantity;
  }, 0);
}

export function calcularTotalSesion(sesion: SesionPedidoCtx) {
  return calcularSubtotalItems(sesion.items) + (sesion.costoDespacho ?? 0);
}

export function construirResumenPedido(sesion: SesionPedidoCtx) {
  const lineas = sesion.items.map((item) => {
    const mods = item.modifiers.length > 0
      ? ` (${item.modifiers.map((mod) => `${mod.name}${mod.priceDelta > 0 ? ` +${formatearPrecio(mod.priceDelta)}` : ''}`).join(', ')})`
      : '';
    const nota = item.notes ? ` - ${item.notes}` : '';
    const recargos = item.modifiers.reduce((total, mod) => total + mod.priceDelta, 0);
    const totalItem = (item.unitPrice + recargos) * item.quantity;
    return `- ${item.quantity}x ${item.productName}${mods}${nota}: ${formatearPrecio(totalItem)}`;
  });

  const subtotal = calcularSubtotalItems(sesion.items);
  const despacho = sesion.costoDespacho ? `\nDespacho: ${formatearPrecio(sesion.costoDespacho)}` : '';
  const modalidad = sesion.modalidad
    ? `\nEntrega: ${sesion.modalidad === 'retiro_local' ? 'Retiro en local' : 'Delivery'}`
    : '';

  return `${lineas.join('\n')}\nSubtotal: ${formatearPrecio(subtotal)}${despacho}${modalidad}\nTotal: ${formatearPrecio(calcularTotalSesion(sesion))}`;
}

export function esConfirmacionExplicita(texto: string) {
  const n = normalizarTexto(texto);
  return /^(si|sí|confirmo|confirmado|dale|ok|okay|listo|correcto|de acuerdo|va|vamos|proceda|eso es|asi esta|así está)[\s.!]*$/.test(n)
    || n.includes('confirmo el pedido')
    || n.includes('esta correcto')
    || n.includes('está correcto');
}

export function esNegacionOCancelacion(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(no|cancelar|cancela|olvidalo|olvídalo|mejor no|no quiero|dejalo|déjalo)\b/.test(n);
}

export function esCierreDePedido(texto: string) {
  const n = normalizarTexto(texto);
  return n.includes('eso es todo')
    || n.includes('solo eso')
    || n.includes('quiero solo eso')
    || n.includes('no, solo eso')
    || n.includes('no gracias, solo eso')
    || n.includes('nada mas')
    || n.includes('nada más')
    || n.includes('ya esta')
    || n.includes('ya está')
    || n.includes('listo eso')
    || n === 'eso';
}

export function detectarMetodoPago(texto: string): 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto' | null {
  const n = normalizarTexto(texto);
  if (/\b(mixto|parte y parte)\b/.test(n)) return 'mixto';
  if (/\b(transferencia|transferir|transfiero|transfer)\b/.test(n)) return 'transferencia';
  if (/\b(tarjeta|debito|débito|credito|crédito|redcompra|pos)\b/.test(n)) return 'tarjeta';
  if (/\b(efectivo|cash)\b/.test(n)) return 'efectivo';
  return null;
}

export function pareceReclamo(texto: string) {
  const n = normalizarTexto(texto);
  return /\b(pesima|pésima|mala atencion|mala atención|reclamo|frio|frío|atraso|demora|llego mal|llegó mal|faltante|equivocado|devolucion|devolución|reembolso|molesto|enojado)\b/.test(n);
}

export function clasificarTipoReclamo(texto: string) {
  const n = normalizarTexto(texto);
  if (/\b(frío|frio|mala calidad)\b/.test(n)) return 'calidad';
  if (/\b(faltante|falta|equivocado|llego mal|llegó mal)\b/.test(n)) return 'error_pedido';
  if (/\b(atraso|demora|no llego|no llegó)\b/.test(n)) return 'atraso';
  if (/\b(devolucion|devolución|reembolso)\b/.test(n)) return 'reembolso';
  return 'atencion';
}
