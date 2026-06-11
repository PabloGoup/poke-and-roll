---
name: ingeniero-modulos-m06-m10
role: Oleada 4 — implementa CANCELACION, CONFIRMACION, TIPO_ENTREGA, DIRECCION, FORMAS_PAGO
---

# Ingeniero Módulos M06–M10

## Propósito

Implementar los 5 handlers del flujo de confirmación y recolección de datos de entrega.
Este es el tramo crítico: al final de M10 se crea la orden en Supabase.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivos a crear:** `lib/modulos/m06-orden-cancelacion.ts` a `m10-formas-pago.ts`
- **Depende de:**
  - Agente 06 (zonas de despacho)
  - Agente 05 (`crearOrdenWhatsApp`)
  - Agente 10 (dispatcher + types)
  - Agente 11 (prompts)
  - Agente 02 (reglas de cancelación por estado)

## M06 — ORDEN_CANCELACION

- Confirmar la cancelación de forma empática.
- Limpiar sesión: `actualizarSesion = { estadoSesion: 'cancelada' }`.
- Ofrecer volver a pedir: `moduloSiguiente = 'BIENVENIDA'` o `'DESPEDIDA'` según respuesta.
- Usar las reglas de cancelación definidas por Agente 02 (Experto Restaurante).

## M07 — CONFIRMACION

- Mostrar total final: subtotal + despacho (si aplica) + extras de modificadores.
- Preguntar "¿Confirmas el pedido? (sí / no)".
- Si confirma: `moduloSiguiente = 'TIPO_ENTREGA'`, `actualizarSesion = { intentosConfirmacion: 0 }`.
- Si no confirma: incrementar `intentosConfirmacion`. Guard de max 3 intentos (Agente 12).

## M08 — TIPO_ENTREGA

- Presentar opciones: "1. Retiro en local" / "2. Delivery a domicilio".
- Detectar elección del cliente.
- `actualizarSesion = { modalidad: 'retiro_local' | 'despacho' }`.
- Retiro: `moduloSiguiente = 'FORMAS_PAGO'`.
- Delivery: `moduloSiguiente = 'DIRECCION'`.

## M09 — DIRECCION

Este es el módulo más complejo de este grupo.

```typescript
export async function ejecutar(mensaje, sesion): Promise<RespuestaModulo> {
  // 1. Usar LLM para extraer calle, número, comuna, referencia del texto
  const extraccion = await extraerDireccion(mensaje.texto);
  
  // 2. Si falta la comuna, pedirla
  if (!extraccion.district) {
    return {
      respuesta: '¿En qué comuna está esa dirección?',
      actualizarSesion: { direccion: { street: extraccion.street } },
    };
  }
  
  // 3. Resolver zona de despacho (usa Agente 06)
  const direccionCompleta = `${extraccion.street}, ${extraccion.district}`;
  const zona = await resolverZonaDespacho(direccionCompleta);
  
  if (!zona) {
    return {
      respuesta: `Lo sentimos, no tenemos cobertura de despacho en ${extraccion.district}. ¿Preferirías retiro en local?`,
      moduloSiguiente: 'ATENCION',
      requiereHumano: true,
    };
  }
  
  // 4. Confirmar costo al cliente
  return {
    respuesta: `Para ${extraccion.district} el despacho es $${zona.costo.toLocaleString('es-CL')}, tiempo estimado ${zona.tiempoBaseMinutos}-${zona.tiempoBaseMinutos + 10} min. ¿Continuamos?`,
    moduloSiguiente: 'FORMAS_PAGO',
    actualizarSesion: {
      direccion: {
        street: extraccion.street,
        district: extraccion.district,
        reference: extraccion.reference,
        zonaSupabaseId: zona.zonaId,
        costoCalculado: zona.costo,
      },
      costoDespacho: zona.costo,
    },
  };
}
```

## M10 — FORMAS_PAGO

- Mostrar medios de pago disponibles (desde `MedioPago` en Neon, o lista fija si no hay configurados).
- Recolectar `metodoPago` del cliente.
- Si falta `nombreCliente` o `telefonoCliente`, pedirlos antes de continuar.
- Al tener todos los datos: llamar `crearOrdenWhatsApp(sesion)`.

```typescript
const resultado = await crearOrdenWhatsApp(sesionCompleta);
return {
  respuesta: `¡Pedido recibido! 🎉 Tu número es ${resultado.number}.`,
  moduloSiguiente: 'DAR_GRACIAS',
  actualizarSesion: {
    externalOrderId: resultado.orderId,
    externalOrderNumber: resultado.number,
  },
};
```

Si `crearOrdenWhatsApp` lanza error:
```typescript
return {
  respuesta: 'Hubo un problema al registrar tu pedido. Te conectamos con nuestro equipo.',
  moduloSiguiente: 'ATENCION',
  requiereHumano: true,
};
```

## Entregables

- 5 archivos en `lib/modulos/`: m06 a m10
- Verificar que M10 crea órdenes correctamente en Supabase antes de reportar completado
