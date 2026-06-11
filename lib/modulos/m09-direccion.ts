// ============================================================
// lib/modulos/m09-direccion.ts — Recolección de dirección de delivery
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx, DireccionCliente } from './types';
import { PROMPT_DIRECCION } from './prompts/m09';
import { resolverZonaDespacho } from '@/lib/zonas-despacho';

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

    // Paso 2: si falta la comuna, pedir al cliente
    if (!district) {
      return {
        respuesta: parsed.respuesta ?? '¿En qué comuna necesitas el despacho?',
      };
    }

    // Paso 3: resolver la zona de despacho
    const direccionTexto = [street, district].filter(Boolean).join(', ');
    const zona = await resolverZonaDespacho(direccionTexto).catch(() => null);

    // Paso 4: sin cobertura → escalar a ATENCION
    if (!zona) {
      return {
        respuesta: `Lamentablemente no tenemos cobertura en ${district}. ¿Prefieres retiro en el local?`,
        moduloSiguiente: 'ATENCION',
        requiereHumano: true,
      };
    }

    // Paso 5: zona encontrada → confirmar costo y avanzar
    const tiempoMax = zona.tiempoBaseMinutos + 10;
    const direccion: DireccionCliente = {
      street: street ?? '',
      district,
      reference: reference ?? undefined,
      zonaSupabaseId: zona.zonaId,
      costoCalculado: zona.costo,
    };

    return {
      respuesta: `Para ${district} el despacho es $${zona.costo.toLocaleString('es-CL')}, tiempo estimado ${zona.tiempoBaseMinutos}–${tiempoMax} min. ¿Continuamos?`,
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
