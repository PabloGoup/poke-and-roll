// ============================================================
// lib/modulos/m01-bienvenida.ts — Módulo de bienvenida
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_BIENVENIDA } from './prompts/m01';
import { obtenerPerfilCliente } from '@/lib/supabase-pedidos';

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

export async function ejecutar(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const openai = getOpenAI();

  // Obtener perfil del cliente si hay teléfono disponible
  const telefono = sesion?.telefonoCliente ?? msg.cliente ?? '';
  let perfilCtx = '';

  if (telefono) {
    try {
      const perfil = await obtenerPerfilCliente(telefono);
      if (perfil && perfil.customer) {
        const nombre = perfil.customer.fullName ?? '';
        const ultimoPedido = perfil.recentOrders?.[0];
        const resumenItems = ultimoPedido?.itemsSummary?.join(', ') ?? '';
        perfilCtx = nombre
          ? `Cliente frecuente: ${nombre}.${resumenItems ? ` Su último pedido fue: ${resumenItems}.` : ''}`
          : '';
      }
    } catch {
      // fail silently — no perfil disponible
    }
  }

  const contexto = [
    perfilCtx,
    `Mensaje del cliente: "${msg.texto}"`,
  ].filter(Boolean).join('\n');

  if (!openai) {
    return {
      respuesta: perfilCtx
        ? `¡Hola de nuevo! Bienvenido a Poke & Roll. ¿En qué te puedo ayudar hoy?`
        : '¡Hola! Bienvenido a Poke & Roll. ¿En qué te puedo ayudar hoy?',
      moduloSiguiente: 'CONSULTAS',
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_BIENVENIDA },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
    };

    if (!parsed.respuesta) return FALLBACK;

    return {
      respuesta: parsed.respuesta,
      moduloSiguiente: (parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente']) ?? 'CONSULTAS',
    };
  } catch {
    return FALLBACK;
  }
}
