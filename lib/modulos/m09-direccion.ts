// ============================================================
// lib/modulos/m09-direccion.ts — Recolección de dirección de delivery
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx, DireccionCliente } from './types';
import { PROMPT_DIRECCION } from './prompts/m09';
import { resolverCoberturaDespacho } from '@/lib/zonas-despacho';

const FALLBACK: RespuestaModulo = {
  respuesta: 'Por favor indícanos tu dirección de despacho: calle con número y comuna.',
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

export async function ejecutar(
  msg: MensajeDespacho,
  _sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const openai = getOpenAI();

  if (!openai) {
    return FALLBACK;
  }

  // Paso 1: usar LLM para extraer los campos de la dirección
  let street: string | null = null;
  let district: string | null = null;
  let reference: string | null = null;

  try {
    const extraction = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_DIRECCION },
        { role: 'user', content: `Mensaje del cliente: "${msg.texto}"` },
      ],
    });

    const raw = extraction.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
      direccionCompleta?: {
        street?: string | null;
        district?: string | null;
        reference?: string | null;
      };
    };

    // Si el LLM decidió una transición directa (cancelación u otro)
    if (parsed.moduloSiguiente && parsed.moduloSiguiente !== 'FORMAS_PAGO') {
      return {
        respuesta: parsed.respuesta ?? FALLBACK.respuesta,
        moduloSiguiente: parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente'],
      };
    }

    street = parsed.direccionCompleta?.street ?? null;
    district = parsed.direccionCompleta?.district ?? null;
    reference = parsed.direccionCompleta?.reference ?? null;

    // Paso 2: si falta calle/número o comuna, pedir solo el dato faltante.
    if (!street) {
      return {
        respuesta: parsed.respuesta ?? 'Perfecto, ¿me puedes dar la calle con número y la comuna para calcular el despacho?',
      };
    }

    if (!district) {
      return {
        respuesta: parsed.respuesta ?? '¿En qué comuna necesitas el despacho?',
      };
    }

    // Paso 3: resolver la cobertura de despacho con las tarifas configuradas.
    const direccionTexto = [street, district].filter(Boolean).join(', ');
    const cobertura = await resolverCoberturaDespacho(direccionTexto).catch(() => ({
      estado: 'direccion_no_geocodificada' as const,
    }));

    if (cobertura.estado !== 'cubierto') {
      if (cobertura.estado === 'fuera_cobertura') {
        const distancia = cobertura.distanciaKm != null
          ? ` La distancia calculada es aprox. ${cobertura.distanciaKm.toFixed(1)} km.`
          : '';
        return {
          respuesta: `Para esa dirección no tengo cobertura automática configurada.${distancia} Puedo dejarlo para retiro o derivarte con el equipo para revisar si se puede coordinar un despacho especial.`,
          moduloSiguiente: 'ATENCION',
          requiereHumano: true,
          actualizarSesion: {
            direccion: { street, district, reference: reference ?? undefined },
          },
        };
      }

      return {
        respuesta: 'Recibí la dirección, pero no pude calcular el costo de despacho automáticamente. Te derivo con el equipo para confirmar cobertura y valor antes de cerrar el pedido.',
        moduloSiguiente: 'ATENCION',
        requiereHumano: true,
        actualizarSesion: {
          direccion: { street, district, reference: reference ?? undefined },
        },
      };
    }

    // Paso 5: zona encontrada → confirmar costo y avanzar
    const zona = cobertura.zona;
    const direccion: DireccionCliente = {
      street: street ?? '',
      district,
      reference: reference ?? undefined,
      zonaSupabaseId: zona.zonaId,
      costoCalculado: zona.costo,
      tiempoEstimadoMin: zona.tiempoBaseMinutos,
      lat: cobertura.lat,
      lng: cobertura.lng,
    };

    return {
      respuesta: `Para esa dirección el despacho es $${zona.costo.toLocaleString('es-CL')} y el tiempo estimado es ${zona.tiempoBaseMinutos}–${zona.tiempoEstimadoMax} min. ¿Continuamos con delivery a ${street}, ${district}?`,
      moduloSiguiente: 'FORMAS_PAGO',
      actualizarSesion: {
        direccion,
        costoDespacho: zona.costo,
      },
    };
  } catch {
    return FALLBACK;
  }
}
