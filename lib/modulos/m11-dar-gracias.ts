// ============================================================
// lib/modulos/m11-dar-gracias.ts — Confirmación de orden creada
// Activado tras la creación exitosa de la orden.
// No llama al LLM para el mensaje inicial — usa texto predefinido.
// Puede recibir mensajes del cliente mientras espera (consultas).
// ============================================================

import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';

// Palabras que indican inicio de una conversación nueva (cerrar sesión actual)
const palabrasNuevoInicio = [
  'hola', 'buenos', 'buenas', 'buen dia', 'buendia', 'hi', 'hey',
  'quiero pedir', 'nuevo pedido', 'otra vez', 'quiero otro',
];

// Palabras que indican una consulta del cliente esperando su pedido
const palabrasConsulta = [
  'cuánto', 'cuanto', 'tiempo', 'demora', 'tarda', 'cuando', 'cuándo',
  'estado', 'pedido', 'cómo va', 'como va', 'listo', 'donde', 'dónde',
  'consulta', 'pregunta', 'cambiar', 'cancelar', 'agregar',
];

function detectaConsulta(texto: string): boolean {
  const n = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return palabrasConsulta.some((p) => n.includes(p));
}

function formatearHoraChilena(fecha: Date): string {
  // Formato HH:MM en zona horaria de Chile (America/Santiago)
  try {
    return fecha.toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    // Fallback si el entorno no soporta la timezone
    const h = String(fecha.getHours()).padStart(2, '0');
    const m = String(fecha.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

// Detecta si el mensaje es la activación inicial (sistema confirmando la orden)
// En ese caso el texto viene vacío o con un marcador especial de sistema.
function esActivacionInicial(texto: string): boolean {
  const t = texto.trim();
  return (
    t === '' ||
    t === '__ORDEN_CONFIRMADA__' ||
    t.startsWith('[sistema]') ||
    t.startsWith('[order_confirmed]')
  );
}

export async function ejecutar(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const numero = sesion?.externalOrderNumber ?? 'tu pedido';
  const esDelivery = sesion?.modalidad === 'despacho';

  // ── Activación inicial — sin mensaje del cliente ────────────
  if (esActivacionInicial(msg.texto)) {
    // Formatear tiempo estimado si está disponible
    let tiempoTexto = '';
    const estimatedRaw = (sesion as (SesionPedidoCtx & { estimatedReadyAt?: string | Date }) | null)
      ?.estimatedReadyAt;

    if (estimatedRaw) {
      const fecha = estimatedRaw instanceof Date ? estimatedRaw : new Date(estimatedRaw);
      if (!isNaN(fecha.getTime())) {
        const horaFormateada = formatearHoraChilena(fecha);
        const ahora = new Date();
        const diffMin = Math.round((fecha.getTime() - ahora.getTime()) / 60_000);

        if (diffMin > 0 && diffMin <= 120) {
          if (diffMin > 45) {
            tiempoTexto = `Tenemos alta demanda y el tiempo estimado sería de aproximadamente ${diffMin} minutos (listo a las ${horaFormateada}). `;
          } else {
            tiempoTexto = esDelivery
              ? `Llegará aproximadamente a las ${horaFormateada} (en ~${diffMin} min). `
              : `Estará listo aproximadamente a las ${horaFormateada} (en ~${diffMin} min). `;
          }
        } else {
          tiempoTexto = esDelivery
            ? `Tiempo estimado de llegada: ${horaFormateada}. `
            : `Listo aprox. a las ${horaFormateada}. `;
        }
      }
    }

    const respuestaInicial = esDelivery
      ? `¡Tu pedido ${numero} fue confirmado! 🎉 ${tiempoTexto}Si tienes alguna consulta mientras esperas, escríbeme.`
      : `¡Tu pedido ${numero} fue confirmado! 🎉 ${tiempoTexto}Puedes pasar a retirarlo en unos momentos. Si tienes alguna consulta, escríbeme.`;

    // NO retornar moduloSiguiente — esperar el webhook pedido-listo
    return {
      respuesta: respuestaInicial.replace(/\s{2,}/g, ' ').trim(),
    };
  }

  // ── Cliente escribe mientras espera ─────────────────────────

  // "¿Cómo va mi pedido?" → responder con estado actual sin salir del módulo
  const n = msg.texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const preguntaEstado =
    n.includes('como va') ||
    n.includes('cómo va') ||
    n.includes('estado') ||
    (n.includes('listo') && (n.includes('pedido') || n.includes('ya')));

  if (preguntaEstado) {
    const respuesta = esDelivery
      ? `Tu pedido ${numero} está siendo preparado. Te avisaré cuando salga a despacho. 🛵`
      : `Tu pedido ${numero} está siendo preparado. Te avisaré cuando esté listo para retirar.`;
    // Permanecer en DAR_GRACIAS
    return { respuesta };
  }

  // Consulta general → derivar a CONSULTAS para respuesta más completa
  if (detectaConsulta(msg.texto)) {
    return {
      respuesta: `Claro, con gusto te ayudo con eso. Un momento…`,
      moduloSiguiente: 'CONSULTAS',
    };
  }

  // Detectar nuevo inicio de conversación → cerrar sesión actual y empezar de nuevo
  const nTexto = msg.texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const esNuevoInicio = palabrasNuevoInicio.some(p => nTexto === p || nTexto.startsWith(p + ' ') || nTexto.startsWith(p + ','));

  if (esNuevoInicio) {
    return {
      respuesta: `¡Hola de nuevo! ¿En qué te puedo ayudar?`,
      moduloSiguiente: 'BIENVENIDA',
      actualizarSesion: { estadoSesion: 'completada' },
    };
  }

  // Mensaje genérico → confirmar y permanecer en DAR_GRACIAS
  return {
    respuesta: `Recibido. Si tienes alguna duda sobre tu pedido ${numero}, no dudes en escribirme.`,
  };
}
