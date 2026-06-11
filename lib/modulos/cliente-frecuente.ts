import { obtenerPerfilCliente, resolverItemsCarrito, consultarEstadoOrden } from '@/lib/supabase-pedidos';
import { upsertSesionPedido } from '@/lib/db-helpers';

// Obtener y formatear el contexto del cliente frecuente para inyectar al LLM
export async function obtenerContextoClienteFrecuente(telefono: string): Promise<string | null> {
  const perfil = await obtenerPerfilCliente(telefono);
  if (!perfil?.recentOrders?.length) return null;

  const ultimoPedido = perfil.recentOrders[0];
  const resumen = ultimoPedido.itemsSummary?.join(', ') ?? 'pedido anterior';
  const fecha = new Date(ultimoPedido.createdAt).toLocaleDateString('es-CL');

  return `Cliente frecuente: ${perfil.customer?.fullName ?? 'cliente'}.
Último pedido (${fecha}): ${resumen} — Total: $${ultimoPedido.total?.toLocaleString('es-CL') ?? '0'}
Puedes ofrecerle repetir su último pedido si lo menciona.`;
}

// Pre-cargar la sesión con el último pedido del cliente (cuando acepta "repetir")
export async function preCargarUltimoPedido(
  conversacionId: string,
  telefono: string
): Promise<{ exito: boolean; mensaje: string }> {
  const perfil = await obtenerPerfilCliente(telefono);
  if (!perfil?.recentOrders?.[0]) {
    return { exito: false, mensaje: 'No encontré tu pedido anterior.' };
  }

  const ultimoPedido = perfil.recentOrders[0];
  const itemsTexto = (ultimoPedido.itemsSummary ?? []).map((nombre: string) => ({
    nombre,
    cantidad: 1,
    notas: '',
  }));

  const { resueltos, noEncontrados } = await resolverItemsCarrito(itemsTexto);

  if (resueltos.length === 0) {
    return { exito: false, mensaje: 'Los productos de tu pedido anterior no están disponibles ahora.' };
  }

  await upsertSesionPedido(conversacionId, {
    moduloActual: 'ORDEN_COMPRA',
    items: resueltos,
  });

  const resumenItems = resueltos.map(i => `${i.quantity}x ${i.productName}`).join(', ');
  const noDisponibles = noEncontrados.length > 0 ? ` (sin: ${noEncontrados.join(', ')})` : '';

  return {
    exito: true,
    mensaje: `Listo, pre-cargué tu pedido anterior: ${resumenItems}${noDisponibles}. ¿Lo confirmas o quieres cambiar algo?`,
  };
}

// Consultar el estado del pedido activo del cliente
export async function consultarMiPedido(externalOrderId: string): Promise<string> {
  const orden = await consultarEstadoOrden(externalOrderId);
  if (!orden) return 'No pude encontrar información de tu pedido.';

  const ESTADOS: Record<string, string> = {
    pendiente: 'Tu pedido está en cola, pronto comenzamos a prepararlo. 🍳',
    en_preparacion: 'Tu pedido está siendo preparado en cocina. ¡Ya casi está! 🔪',
    listo: '¡Tu pedido está listo! 🎉',
    entregado: 'Tu pedido ya fue entregado. ¡Que lo disfrutes! 🍣',
    cancelado: 'Tu pedido fue cancelado.',
  };

  return `${orden.number}: ${ESTADOS[orden.status as string] ?? 'Consultando estado...'}`;
}

// Detectar si el cliente pregunta por el estado de su pedido
export function detectaConsultaEstado(texto: string): boolean {
  const frases = [
    'como va', 'cómo va', 'mi pedido', 'estado del pedido',
    'cuanto falta', 'cuánto falta', 'ya está listo', 'cuando llega',
    'en camino', 'lo están haciendo',
  ];
  const norm = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return frases.some(f => norm.includes(f));
}
