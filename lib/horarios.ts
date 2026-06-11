import { prisma } from '@/lib/prisma';

export interface EstadoHorario {
  abierto: boolean;
  mensaje?: string;
  proximaApertura?: string;
  minutosCierre?: number;
}

/**
 * Convierte un string "HH:MM" a minutos desde medianoche.
 */
function horaAMinutos(horaStr: string): number {
  const [hh, mm] = horaStr.split(':').map(Number);
  return hh * 60 + mm;
}

/**
 * Verifica si el restaurante está en horario de atención en este momento.
 *
 * Nota: HorarioAtencion es global (no tiene localId). Si en el futuro se
 * necesita segmentar por local, habrá que agregar ese campo al modelo.
 *
 * @param localId - parámetro reservado para compatibilidad futura; ignorado.
 */
export async function verificarHorarioAtencion(
  localId?: string,
): Promise<EstadoHorario> {
  const ahora = new Date();
  // getDay() → 0 = domingo … 6 = sábado, igual que diaSemana en el schema
  const diaSemana = ahora.getDay();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  const horarios = await prisma.horarioAtencion.findMany({
    where: {
      diaSemana,
      activo: true,
    },
  });

  // Sin configuración para este día → asumir abierto (no bloquear por falta de datos)
  if (!horarios.length) {
    return { abierto: true };
  }

  const h = horarios[0];
  const apertura = horaAMinutos(h.horaApertura);
  const cierre = horaAMinutos(h.horaCierre);

  const dentroDeHorario = horaActual >= apertura && horaActual < cierre;
  const minutosCierre = dentroDeHorario ? cierre - horaActual : undefined;
  const AVISO_CIERRE_MIN = 30;

  if (dentroDeHorario) {
    if (minutosCierre !== undefined && minutosCierre <= AVISO_CIERRE_MIN) {
      return {
        abierto: true,
        mensaje: `¡Atención! Cerramos en ${minutosCierre} minutos (${h.horaCierre}).`,
        minutosCierre,
      };
    }
    return { abierto: true };
  }

  // Fuera de horario — calcular próxima apertura
  let proximaApertura: string | undefined;

  if (horaActual < apertura) {
    // Aún no abrimos hoy
    proximaApertura = h.horaApertura;
  } else {
    // Ya cerramos — buscar el próximo día con horario activo
    for (let delta = 1; delta <= 7; delta++) {
      const proximoDia = (diaSemana + delta) % 7;
      const proximosHorarios = await prisma.horarioAtencion.findMany({
        where: { diaSemana: proximoDia, activo: true },
      });
      if (proximosHorarios.length) {
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        proximaApertura = `${diasSemana[proximoDia]} a las ${proximosHorarios[0].horaApertura}`;
        break;
      }
    }
  }

  return {
    abierto: false,
    mensaje: proximaApertura
      ? `Estamos cerrados. Abrimos el ${proximaApertura}.`
      : 'Estamos cerrados por hoy.',
    proximaApertura,
  };
}
