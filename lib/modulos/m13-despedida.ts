// ============================================================
// lib/modulos/m13-despedida.ts — Cierre final de la conversación
// Usa LLM para variar el mensaje de despedida.
// Marca la sesión como completada.
// NO hay moduloSiguiente — fin del flujo.
// ============================================================

import OpenAI from 'openai';
import { PROMPT_DESPEDIDA } from './prompts/m13';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';

// ── Respuesta de fallback sin LLM ────────────────────────────
const DESPEDIDAS_FALLBACK = [
  '¡Gracias por elegir Poke & Roll! Fue un placer atenderte. ¡Hasta pronto! 🎉',
  '¡Muchas gracias por tu pedido! Esperamos verte pronto en Poke & Roll.',
  '¡Gracias por preferirnos! Ha sido un placer. ¡Buen provecho y hasta la próxima!',
];

function despedidaAleatoria(): string {
  return DESPEDIDAS_FALLBACK[Math.floor(Math.random() * DESPEDIDAS_FALLBACK.length)];
}

// ── Cliente OpenAI (reutiliza la misma lógica que agente.ts) ─
let _client: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (process.env.GEMINI_API_KEY) {
    if (!_client) {
      _client = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
    }
    return _client;
  }
  if (process.env.GROQ_API_KEY) {
    if (!_client) {
      _client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return _client;
  }
  if (process.env.OPENAI_API_KEY) {
    if (!_client) _client = new OpenAI();
    return _client;
  }
  return null;
}

function getModel(): string {
  if (process.env.GEMINI_API_KEY) return 'gemini-2.5-flash';
  if (process.env.GROQ_API_KEY) return 'llama-3.3-70b-versatile';
  return 'gpt-4o-mini';
}

// ── Handler principal ────────────────────────────────────────

export async function ejecutar(
  _msg: MensajeDespacho,
  _sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const actualizarSesion: Partial<SesionPedidoCtx> = { estadoSesion: 'completada' };

  const openai = getOpenAI();
  if (!openai) {
    return {
      respuesta: despedidaAleatoria(),
      actualizarSesion,
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_DESPEDIDA },
        { role: 'user', content: 'Cierra la conversación con una despedida amable.' },
      ],
    });

    const parsed = JSON.parse(
      completion.choices[0]?.message?.content ?? '{}'
    ) as { respuesta?: string };

    const respuesta = parsed.respuesta?.trim() || despedidaAleatoria();

    return {
      respuesta,
      actualizarSesion,
      // NO moduloSiguiente — fin del flujo
    };
  } catch {
    return {
      respuesta: despedidaAleatoria(),
      actualizarSesion,
    };
  }
}
