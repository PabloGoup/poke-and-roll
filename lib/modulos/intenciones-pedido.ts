import type { ItemCarritoWA, MensajeDespacho, ModificadorItem } from './types';
import { normalizarTexto } from './flujo-utils';

export type ItemPedidoDetectado = {
  nombre: string;
  cantidad: number;
  notas?: string;
};

export type ModificacionDetectada = {
  origen: string;
  destino: string;
  recargo: number;
  nota: string;
};

function normalizar(texto: string) {
  return normalizarTexto(texto).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function ultimoAgente(historial?: MensajeDespacho['historial']) {
  return [...(historial ?? [])].reverse().find((m) => m.rol === 'agente')?.texto ?? '';
}

function ultimosCliente(historial?: MensajeDespacho['historial']) {
  return [...(historial ?? [])].reverse().filter((m) => m.rol === 'cliente').map((m) => m.texto);
}

function esAfirmacion(texto: string) {
  const n = normalizar(texto);
  return /^(si|sí|sip|sipo|correcto|exacto|dale|ok|okay|ese|esa|esa misma|ese mismo)[\s.!]*$/.test(n);
}

// Tamaños de promo (parte del nombre del producto, no indican cantidad)
const TAMANOS_PROMO = new Set([20, 30, 40, 50, 60, 70, 80, 100, 120, 140, 200]);

function cantidadDesdeTexto(texto: string, excluirNumeros?: Set<number>) {
  const n = normalizar(texto);
  // Busca TODOS los números y retorna el primero que no sea un tamaño de promo excluido
  const numeros = [...n.matchAll(/\b(\d+)\b/g)].map(m => Number(m[1]));
  for (const num of numeros) {
    if (excluirNumeros && excluirNumeros.has(num)) continue;
    return num;
  }
  if (/\b(una|un)\b/.test(n)) return 1;
  if (/\b(dos)\b/.test(n)) return 2;
  if (/\b(tres)\b/.test(n)) return 3;
  if (/\b(cuatro)\b/.test(n)) return 4;
  if (/\b(cinco)\b/.test(n)) return 5;
  return 1;
}

function detectarPromoComun(texto: string): ItemPedidoDetectado | null {
  const n = normalizar(texto);
  const pidePedido = /\b(quiero|dame|agrega|agregame|anota|anotame|llevo|dejame|la de|el de|promo)\b/.test(n);
  if (!pidePedido && !/\b(30|40|50|70|80|100|140|200)\b/.test(n)) return null;

  if (/\b30\b/.test(n) && /\b(frita|fritas|frito|fritos|friya|friyas|fria|frias)\b/.test(n)) {
    return { nombre: '30 piezas fritas', cantidad: cantidadDesdeTexto(n, TAMANOS_PROMO) };
  }

  if (/\b30\b/.test(n) && /\b(mixta|mixtas|mixto|mixtos)\b/.test(n)) {
    return { nombre: '30 piezas mixtas', cantidad: cantidadDesdeTexto(n, TAMANOS_PROMO) };
  }

  if (/\b30\b/.test(n) && /\b(premium)\b/.test(n)) {
    return { nombre: '30 piezas premium', cantidad: cantidadDesdeTexto(n, TAMANOS_PROMO) };
  }

  return null;
}

function inferirItemDesdeAfirmacion(msg: MensajeDespacho): ItemPedidoDetectado | null {
  if (!esAfirmacion(msg.texto)) return null;
  const agente = normalizar(ultimoAgente(msg.historial));

  if (agente.includes('promo 30') && /\bfrita|fritas|frito|fritos\b/.test(agente)) {
    return { nombre: '30 piezas fritas', cantidad: 1 };
  }
  if (agente.includes('promo 30') && /\bmixta|mixtas|mixto|mixtos\b/.test(agente)) {
    return { nombre: '30 piezas mixtas', cantidad: 1 };
  }
  if (agente.includes('promo 30') && agente.includes('premium')) {
    return { nombre: '30 piezas premium', cantidad: 1 };
  }

  return null;
}

function detectarPokeComun(texto: string): ItemPedidoDetectado | null {
  const n = normalizar(texto);
  if (!/\b(poke|pokes|gohan|gohans|bowl)\b/.test(n)) return null;
  if (!/\b(quiero|dame|agrega|agregame|anota|anotame|llevo|dejame)\b/.test(n)) return null;

  const cantidad = cantidadDesdeTexto(n);
  const notas: string[] = [];
  if (/\bsin cebollin\b/.test(n)) notas.push('uno sin cebollín');
  if (/\bsin palta\b/.test(n)) notas.push('sin palta');
  if (/\bsin queso\b/.test(n)) notas.push('sin queso crema');

  if (/\bsalmon\b/.test(n)) return { nombre: 'poke de salmón', cantidad, notas: notas.join(', ') || undefined };
  if (/\bpollo\b/.test(n)) return { nombre: 'poke de pollo', cantidad, notas: notas.join(', ') || undefined };
  if (/\bcamaron\b/.test(n)) return { nombre: 'poke de camarón', cantidad, notas: notas.join(', ') || undefined };
  if (/\bveg|vegetal|vegetariano\b/.test(n)) return { nombre: 'poke veggie', cantidad, notas: notas.join(', ') || undefined };

  return null;
}

export function detectarItemPedidoDeterministico(msg: MensajeDespacho): ItemPedidoDetectado | null {
  return detectarPromoComun(msg.texto)
    ?? inferirItemDesdeAfirmacion(msg)
    ?? detectarPokeComun(msg.texto);
}

export function detectarModificacion(texto: string): ModificacionDetectada | null {
  const n = normalizar(texto);

  const cambioExplicito = n.match(/\b(?:cambiar|cambia|cambiame|reemplazar|reemplaza|sustituir)\s+(.+?)\s+(?:por|x)\s+(.+?)$/);
  if (cambioExplicito) {
    return construirModificacion(cambioExplicito[1], cambioExplicito[2]);
  }

  const cambioSinVerbo = n.match(/\b(.+?)\s+(?:por|x)\s+(pollo|salmon|camaron|carne|beef)\b/);
  if (cambioSinVerbo && /\b(kanikama|camaron|pollo|salmon|palta|queso|cebollin|champiñon|champinon|champignon)\b/.test(cambioSinVerbo[1])) {
    return construirModificacion(cambioSinVerbo[1], cambioSinVerbo[2]);
  }

  if (/\b(tod[oa]s?|todo completo|entero|entera)\s+(?:con|de)\s+pollo\b/.test(n)) {
    return {
      origen: 'proteínas base',
      destino: 'pollo',
      recargo: 2000,
      nota: 'cambiar proteínas base por pollo (+$2.000)',
    };
  }

  return null;
}

function construirModificacion(origenRaw: string, destinoRaw: string): ModificacionDetectada | null {
  const origen = origenRaw
    .replace(/\b(el|la|los|las|y|tambien|también)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const destino = destinoRaw.trim();
  if (!origen || !destino) return null;

  const premium = /\b(salmon|carne|beef)\b/.test(destino);
  const origenes = origen.split(/\s+/).filter((palabra) =>
    /\b(kanikama|camaron|pollo|salmon|palta|queso|cebollin|champiñon|champinon|champignon|proteinas|base)\b/.test(palabra)
  );
  const cantidadCambios = Math.max(1, new Set(origenes).size);
  const recargoUnitario = premium ? 1500 : 1000;
  const recargo = recargoUnitario * cantidadCambios;
  return {
    origen,
    destino,
    recargo,
    nota: `cambiar ${origen} por ${destino} (+$${recargo.toLocaleString('es-CL')})`,
  };
}

function mismoProducto(a: string, b: string) {
  const na = normalizar(a).replace(/\bpromo\b/g, '').trim();
  const nb = normalizar(b).replace(/\bpromo\b/g, '').trim();
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function buscarItemExistente(items: ItemCarritoWA[], nombre: string) {
  return items.find((item) => mismoProducto(item.productName, nombre));
}

export function debeEvitarDuplicado(texto: string) {
  const n = normalizar(texto);
  return !/\b(otra|otro|agrega otra|agrega otro|sumale|súmale|tambien|también|ademas|además)\b/.test(n);
}

export function aplicarModificacionAItem(item: ItemCarritoWA, modificacion: ModificacionDetectada): ItemCarritoWA {
  const yaExiste = item.modifiers.some((mod) => normalizar(mod.name) === normalizar(`Cambio ${modificacion.origen} por ${modificacion.destino}`));
  if (yaExiste || normalizar(item.notes).includes(normalizar(modificacion.nota))) return item;

  const modifiers: ModificadorItem[] = [
    ...item.modifiers,
    { name: `Cambio ${modificacion.origen} por ${modificacion.destino}`, priceDelta: modificacion.recargo },
  ];
  const notes = [item.notes, modificacion.nota].filter(Boolean).join('; ');
  return { ...item, modifiers, notes };
}

export function ultimaModificacionPendiente(msg: MensajeDespacho): ModificacionDetectada | null {
  const ultimoCambio = ultimosCliente(msg.historial).find((texto) => detectarModificacion(texto));
  return ultimoCambio ? detectarModificacion(ultimoCambio) : null;
}
