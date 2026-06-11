// ============================================================
// lib/modulos/m02-consultas.ts — Módulo de consultas
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, MediaAEnviar, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_CONSULTAS } from './prompts/m02';
import { consultarEstadoOrden } from '@/lib/supabase-pedidos';
import { obtenerContextoNegocio, serializarContextoNegocio } from '@/lib/catalogo';
import { prisma } from '@/lib/prisma';
import { cargarMediaCatalogoVisual, detectarIntencionVisual, resolverUrlCatalogoPdfFallback } from '@/lib/catalogo-visual';

const FALLBACK: RespuestaModulo = {
  respuesta: 'Perdona, tuve un problema técnico. ¿Puedes repetir lo que necesitas?',
};

function getOpenAI(): OpenAI | null {
  if (process.env.GEMINI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }
  if (process.env.GROQ_API_KEY) {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI();
  }
  return null;
}

function getModel(): string {
  if (process.env.GEMINI_API_KEY) return 'gemini-2.5-flash';
  if (process.env.GROQ_API_KEY) return 'llama-3.3-70b-versatile';
  return 'gpt-4o-mini';
}

function normalizarTexto(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function esSolicitudProductos(texto: string): boolean {
  const n = normalizarTexto(texto);
  return /\b(precio|vale|cuesta|cuanto|opciones|tiene|hay|recomien|recomienda|roll|poke|sushi|burger|aperitivo|promo|promocion|combo|hand roll|piezas)\b/.test(n);
}

const ESTADOS_ORDEN: Record<string, string> = {
  pending:    'pendiente de confirmar',
  confirmed:  'confirmado y en preparación',
  preparing:  'en preparación',
  ready:      'listo para entrega',
  dispatched: 'en camino',
  delivered:  'entregado',
  cancelled:  'cancelado',
};

export async function ejecutar(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const openai = getOpenAI();

  // Detectar si el cliente pregunta por su pedido
  const preguntaEstado = /c[oó]mo\s+(va|est[aá])\s+(mi\s+)?pedido|estado\s+del\s+pedido|mi\s+pedido/i.test(msg.texto);
  let infoEstadoOrden = '';

  if (preguntaEstado && sesion?.externalOrderId) {
    try {
      const orden = await consultarEstadoOrden(sesion.externalOrderId);
      if (orden) {
        const estadoLegible = ESTADOS_ORDEN[orden.status as string] ?? orden.status;
        infoEstadoOrden = `Estado actual del pedido #${(orden as { number?: string; status: string; id: string; estimated_ready_at: string | null }).number ?? sesion.externalOrderNumber ?? sesion.externalOrderId}: ${estadoLegible}.`;
        const eta = (orden as { estimated_ready_at: string | null }).estimated_ready_at;
        if (eta) {
          const horaEta = new Date(eta).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          });
          infoEstadoOrden += ` Tiempo estimado de entrega: ${horaEta} hrs.`;
        }
      }
    } catch {
      // fail silently
    }
  }

  // Obtener info del local: horarios, zonas, medios de pago
  let infoLocal = '';
  try {
    const [horarios, zonas, mediosPago] = await Promise.all([
      prisma.horarioAtencion.findMany({ where: { activo: true } }),
      prisma.zonaDespacho.findMany({ where: { activa: true }, orderBy: { costo: 'asc' } }),
      prisma.medioPago.findMany({ where: { activo: true } }),
    ]);
    const partes: string[] = [];

    if (horarios.length > 0) {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const horariosTexto = horarios
        .map(h => `${dias[h.diaSemana] ?? h.diaSemana}: ${h.horaApertura} - ${h.horaCierre}`)
        .join(', ');
      partes.push(`Horarios: ${horariosTexto}`);
    }

    if (zonas.length > 0) {
      const zonasTexto = zonas
        .map(z => `${z.nombre}: $${z.costo.toLocaleString('es-CL')} (${z.tiempoEstimadoMin}-${z.tiempoEstimadoMax} min)`)
        .join(', ');
      partes.push(`Zonas de despacho: ${zonasTexto}`);
    }

    if (mediosPago.length > 0) {
      const mediosTexto = mediosPago.map(m => m.nombre).join(', ');
      partes.push(`Medios de pago: ${mediosTexto}`);
    }

    infoLocal = partes.join('\n');
  } catch {
    infoLocal = 'Información del local no disponible temporalmente.';
  }

  const historialTexto = msg.historial && msg.historial.length > 0
    ? `Historial reciente:\n${msg.historial.map(h => `[${h.rol === 'cliente' ? 'Cliente' : 'Agente'}]: ${h.texto}`).join('\n')}`
    : '';

  // Detectar si el cliente pide el catálogo visual y cargar imágenes
  const solicitudVisual = detectarIntencionVisual(msg.texto);
  const mediaAEnviar: MediaAEnviar[] = solicitudVisual ? await cargarMediaCatalogoVisual(solicitudVisual).catch(() => []) : [];

  if (solicitudVisual && mediaAEnviar.length > 0) {
    const respuesta =
      solicitudVisual === 'promocion'
        ? 'Te envío las promociones vigentes. ¿Quieres que te ayude a elegir una?'
        : solicitudVisual === 'catalogo'
          ? `Te envío la carta. Si no se abre el archivo, también puedes verla aquí: ${mediaAEnviar[0]?.url ?? resolverUrlCatalogoPdfFallback()}`
          : 'Te envío esas opciones. ¿Quieres que te ayude a armar el pedido?';

    return { respuesta, mediaAEnviar };
  }

  // Cargar catálogo de productos si la consulta lo requiere (precio, producto, promo, recomendación)
  let catalogoTexto = '';
  if (esSolicitudProductos(msg.texto)) {
    try {
      const ctx = await obtenerContextoNegocio(msg.texto);
      catalogoTexto = serializarContextoNegocio(ctx);
    } catch {
      // fail silently — Gemini responderá con lo que tenga
    }
  }

  const contexto = [
    infoLocal,
    infoEstadoOrden,
    catalogoTexto ? `Catálogo disponible:\n${catalogoTexto}` : '',
    historialTexto,
    mediaAEnviar.length > 0
      ? `(Se adjuntarán ${mediaAEnviar.length} imagen(es) del catálogo visual antes de este mensaje)`
      : '',
    `Mensaje del cliente: "${msg.texto}"`,
  ].filter(Boolean).join('\n\n');

  if (!openai) {
    const respuestaFallback = solicitudVisual
      ? 'Te muestro el catálogo. ¿Qué te llama la atención?'
      : (infoEstadoOrden || 'Puedo ayudarte con horarios, zonas de despacho y medios de pago. ¿Qué necesitas saber?');
    return { respuesta: respuestaFallback, mediaAEnviar: mediaAEnviar.length > 0 ? mediaAEnviar : undefined };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_CONSULTAS },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string | null;
    };

    if (!parsed.respuesta) return FALLBACK;

    return {
      respuesta: parsed.respuesta,
      ...(parsed.moduloSiguiente
        ? { moduloSiguiente: parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente'] }
        : {}),
      ...(mediaAEnviar.length > 0 ? { mediaAEnviar } : {}),
    };
  } catch {
    return FALLBACK;
  }
}
