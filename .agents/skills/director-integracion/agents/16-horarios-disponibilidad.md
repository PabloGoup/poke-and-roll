---
name: ingeniero-horarios-disponibilidad
role: Oleada 4 — gate de horarios antes de aceptar pedidos
---

# Ingeniero de Horarios y Disponibilidad

## Propósito

Implementar el gate que bloquea la toma de pedidos fuera del horario de atención.
Actualmente el agente responde consultas de horario pero no verifica si puede recibir pedidos.

## Contexto

- **Proyecto:** `/Users/ptoledos/Documents/Poke and roll`
- **Archivo a crear:** `lib/horarios.ts`
- **Se llama desde:** M04_PEDIDOS (Agente 13)

## Tarea — Crear `lib/horarios.ts`

```typescript
import { prisma } from '@/lib/prisma';

export interface EstadoHorario {
  abierto: boolean;
  mensaje?: string;     // si está cerrado, mensaje para el cliente
  proximaApertura?: string;
}

export async function verificarHorarioAtencion(localId: string): Promise<EstadoHorario> {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0=domingo, 1=lunes, ... 6=sábado
  const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

  const horarios = await prisma.horarioAtencion.findMany({
    where: { localId, diaSemana },
  });

  if (!horarios.length) {
    // Sin configuración de horarios → asumir abierto (no bloquear)
    return { abierto: true };
  }

  const horarioHoy = horarios[0];
  const estaAbierto = horaActual >= horarioHoy.horaApertura && horaActual < horarioHoy.horaCierre;

  if (estaAbierto) return { abierto: true };

  // Calcular próxima apertura
  const estaCerradoTemporalmente = horaActual < horarioHoy.horaApertura;
  const proximaApertura = estaCerradoTemporalmente
    ? `hoy a las ${horarioHoy.horaApertura}`
    : await proximaDia(localId, diaSemana);

  return {
    abierto: false,
    mensaje: `En este momento no estamos recibiendo pedidos. Abrimos ${proximaApertura}. ¡Te esperamos! 🍣`,
    proximaApertura,
  };
}

async function proximaDia(localId: string, diaActual: number): Promise<string> {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  
  for (let i = 1; i <= 7; i++) {
    const proximoDia = (diaActual + i) % 7;
    const horario = await prisma.horarioAtencion.findFirst({
      where: { localId, diaSemana: proximoDia },
    });
    if (horario) {
      const nombreDia = i === 1 ? 'mañana' : `el ${dias[proximoDia]}`;
      return `${nombreDia} a las ${horario.horaApertura}`;
    }
  }
  return 'próximamente';
}
```

## Uso en M04_PEDIDOS

```typescript
// Al inicio de ejecutar() en m04-pedidos.ts:
const horario = await verificarHorarioAtencion(mensaje.localId ?? '');
if (!horario.abierto) {
  return {
    respuesta: horario.mensaje!,
    moduloSiguiente: 'DESPEDIDA',
  };
}
// ... continuar con toma de pedido
```

## Entregables

- `lib/horarios.ts` con `verificarHorarioAtencion()`
- Confirmar a Agente 13 (Módulos M01-M05) que la función está lista para M04
