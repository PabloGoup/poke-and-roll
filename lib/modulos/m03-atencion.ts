// ============================================================
// lib/modulos/m03-atencion.ts — Módulo de atención humana
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_ATENCION } from './prompts/m03';

const FALLBACK: RespuestaModulo = {
  respuesta: 'Un miembro del equipo te atenderá en breve. Gracias por tu paciencia.',
  moduloSiguiente: 'DESPEDIDA',
  requiereHumano: true,
  actualizarSesion: { estadoSesion: 'esperando_humano' },
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

  const nombreCliente = sesion?.nombreCliente ?? '';
  const contexto = [
    nombreCliente ? `Nombre del cliente: ${nombreCliente}` : 'Nombre del cliente: desconocido',
    `Mensaje del cliente: "${msg.texto}"`,
  ].join('\n');

  if (!openai) {
    return FALLBACK;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_ATENCION },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
      requiereHumano?: boolean;
    };

    if (!parsed.respuesta) return FALLBACK;

    return {
      respuesta: parsed.respuesta,
      moduloSiguiente: 'DESPEDIDA',
      requiereHumano: true,
      actualizarSesion: { estadoSesion: 'esperando_humano' },
    };
  } catch {
    return FALLBACK;
  }
}
