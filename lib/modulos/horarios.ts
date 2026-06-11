// ============================================================
// lib/modulos/horarios.ts — Verifica si el restaurante está en horario de atención
// ============================================================

export interface InfoHorario {
  puedeRecibir: boolean;
  minutosCierre?: number;  // minutos hasta el cierre, si está próximo
  mensaje?: string;         // mensaje a mostrar si está cerrado o cerrando pronto
}

export function verificarHorario(
  horariosConfig: { diaSemana: number; apertura: string; cierre: string }[]
): InfoHorario {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0=domingo, 1=lunes...
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // minutos desde medianoche

  const horarioHoy = horariosConfig.find(h => h.diaSemana === diaSemana);

  if (!horarioHoy) {
    return {
      puedeRecibir: false,
      mensaje: 'Hoy no tenemos atención. Puedes revisar nuestros horarios en nuestras redes.',
    };
  }

  const [hA, mA] = horarioHoy.apertura.split(':').map(Number);
  const [hC, mC] = horarioHoy.cierre.split(':').map(Number);
  const apertura = hA * 60 + mA;
  const cierre = hC * 60 + mC;

  if (horaActual < apertura) {
    return {
      puedeRecibir: false,
      mensaje: `Aún no abrimos. Comenzamos a atender a las ${horarioHoy.apertura} hrs.`,
    };
  }

  if (horaActual >= cierre) {
    return {
      puedeRecibir: false,
      mensaje: 'Ya cerramos por hoy. ¡Te esperamos mañana! 🍣',
    };
  }

  const minutosCierre = cierre - horaActual;

  if (minutosCierre <= 30) {
    return {
      puedeRecibir: true,
      minutosCierre,
      mensaje: `¡Hola! Quiero avisarte que el restaurante cierra en ${minutosCierre} minutos. Podemos tomar tu pedido, pero dependiendo de lo que elijas puede que no alcancemos a prepararlo antes del cierre. ¿Quieres continuar igual? 😊`,
    };
  }

  return { puedeRecibir: true };
}
