// ============================================================
// lib/modulos/m08-tipo-entrega.ts — Tipo de entrega
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_TIPO_ENTREGA } from './prompts/m08';

const FALLBACK: RespuestaModulo = {
  respuesta: '¿Cómo prefieres recibir tu pedido, retiro en el local o delivery a domicilio?',
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

  const contexto = `Mensaje del cliente: "${msg.texto}"`;

  if (!openai) {
    const textoLower = msg.texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const esRetiro = ['retiro', 'retirar', 'local', 'buscar', 'paso a buscar'].some((p) =>
      textoLower.includes(p)
    );
    const esDespacho = ['delivery', 'despacho', 'envio', 'domicilio', 'llevar', 'mandar'].some((p) =>
      textoLower.includes(p)
    );

    if (esRetiro) {
      return {
        respuesta: 'Perfecto, retiro en local. Te pedimos el método de pago para continuar.',
        moduloSiguiente: 'FORMAS_PAGO',
        actualizarSesion: { modalidad: 'retiro_local' },
      };
    }
    if (esDespacho) {
      return {
        respuesta: '¿A qué dirección enviamos el pedido? Por favor indícanos calle, número y comuna.',
        moduloSiguiente: 'DIRECCION',
        actualizarSesion: { modalidad: 'despacho' },
      };
    }
    return FALLBACK;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_TIPO_ENTREGA },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
      modalidad?: 'retiro_local' | 'despacho' | null;
    };

    const moduloSiguiente = (parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente']) ?? undefined;
    const actualizarSesion: Partial<SesionPedidoCtx> | undefined =
      parsed.modalidad ? { modalidad: parsed.modalidad } : undefined;

    return {
      respuesta: parsed.respuesta ?? FALLBACK.respuesta,
      moduloSiguiente,
      actualizarSesion,
    };
  } catch {
    return FALLBACK;
  }
}
