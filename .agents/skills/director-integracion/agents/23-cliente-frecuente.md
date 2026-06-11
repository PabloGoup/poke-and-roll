---
name: agente-cliente-frecuente-post-pedido
role: Oleada 6 — features de fidelización y consulta de estado de orden
---

# Agente de Cliente Frecuente + Post-Pedido

## Propósito

Implementar dos features de alto valor para la experiencia del cliente:
1. "¿Repetir tu último pedido?" para clientes que regresan.
2. "¿Cómo va mi pedido?" para consultar el estado en tiempo real.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Se llama desde:** M01_BIENVENIDA (cliente frecuente) y M02_CONSULTAS (estado de pedido)

## Tarea 1 — Cliente frecuente en M01_BIENVENIDA

En `lib/modulos/m01-bienvenida.ts` (Agente 13 lo crea, este agente define la lógica):

```typescript
// Al ejecutar M01:
const perfil = await obtenerPerfilCliente(mensaje.cliente);

if (perfil?.recentOrders?.length > 0) {
  const ultimoPedido = perfil.recentOrders[0];
  const resumenItems = ultimoPedido.itemsSummary.join(', ');
  
  // Agregar al contexto del prompt:
  const contextoCliente = `
    Cliente frecuente: ${perfil.customer.fullName}
    Último pedido (${new Date(ultimoPedido.createdAt).toLocaleDateString('es-CL')}):
    ${resumenItems} — Total: $${ultimoPedido.total.toLocaleString('es-CL')}
    
    Puedes ofrecerle repetir su último pedido si es relevante.
  `;
}
```

Si el cliente acepta repetir el pedido, pre-cargar la sesión con los items:

```typescript
// Resolver los nombres de items del pedido anterior a UUIDs actuales
const itemsAnterior = ultimoPedido.itemsSummary.map(nombre => ({ nombre, cantidad: 1, notas: '' }));
const { resueltos, noEncontrados } = await resolverItemsCarrito(itemsAnterior);

// Pre-cargar en sesión y saltar a M05_ORDEN_COMPRA
await upsertSesionPedido(conversacion.id, {
  moduloActual: 'ORDEN_COMPRA',
  items: resueltos,
});
```

## Tarea 2 — "¿Cómo va mi pedido?" en M02_CONSULTAS

Detectar la consulta en el módulo CONSULTAS:

```typescript
const PALABRAS_ESTADO_PEDIDO = [
  'como va', 'cómo va', 'mi pedido', 'estado del pedido',
  'cuanto falta', 'cuánto falta', 'ya está', 'cuando llega', 'listo'
];

if (PALABRAS_ESTADO_PEDIDO.some(p => texto.toLowerCase().includes(p))) {
  // Buscar sesión activa con externalOrderId
  const sesionActiva = await obtenerSesionPedido(conversacionId);
  
  if (sesionActiva?.externalOrderId) {
    const orden = await consultarEstadoOrden(sesionActiva.externalOrderId);
    
    const ESTADOS_LEGIBLES = {
      pendiente: 'Tu pedido está en cola, pronto comenzamos a prepararlo.',
      en_preparacion: 'Tu pedido está siendo preparado en cocina.',
      listo: 'Tu pedido está listo.',
      entregado: 'Tu pedido ha sido entregado.',
      cancelado: 'Tu pedido fue cancelado.',
    };
    
    return {
      respuesta: `${orden.number}: ${ESTADOS_LEGIBLES[orden.status] ?? 'Consultando...'}`,
    };
  }
}
```

## Entregables

- Lógica de cliente frecuente documentada para que Agente 13 la implemente en M01
- Lógica de consulta de estado documentada para que Agente 13 la implemente en M02
- `consultarEstadoOrden()` ya existe en `lib/supabase-pedidos.ts` (Agente 05)
