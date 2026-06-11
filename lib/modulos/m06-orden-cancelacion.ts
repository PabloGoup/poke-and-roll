// ============================================================
// lib/modulos/m06-orden-cancelacion.ts — Cancelación de orden
// ============================================================

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_ORDEN_CANCELACION } from './prompts/m06';
import { consultarEstadoOrden } from '@/lib/supabase-pedidos';

const FALLBACK: RespuestaModulo = {
  respuesta: 'Entendido, tu pedido ha sido cancelado. ¿Puedo ayudarte con algo más?',
  moduloSiguiente: 'DESPEDIDA',
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

async function cancelarOrdenEnSupabase(orderId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.SUPABASE_PEDIDOS_URL!,
    process.env.SUPABASE_PEDIDOS_ANON_KEY!
  );
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelado' })
    .eq('id', orderId);
  return !error;
}

export async function ejecutar(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const openai = getOpenAI();

  // Determinar el estado de la orden antes de llamar al LLM
  let estadoOrden: string | null = null;
  let cancelacionRealizada = false;

  if (sesion?.externalOrderId) {
    // POST-M10: hay una orden en Supabase
    const orden = await consultarEstadoOrden(sesion.externalOrderId).catch(() => null);
    estadoOrden = orden?.status ?? null;

    if (estadoOrden === 'pendiente') {
      // Cancelable
      cancelacionRealizada = await cancelarOrdenEnSupabase(sesion.externalOrderId).catch(() => false);
    }
  }

  // Si está en preparación o listo → escalar sin LLM
  if (estadoOrden === 'en_preparacion' || estadoOrden === 'listo') {
    return {
      respuesta: 'Tu orden ya está siendo preparada y no podemos cancelarla en este momento. Te conecto con nuestro equipo para que te ayuden.',
      moduloSiguiente: 'ATENCION',
      requiereHumano: true,
    };
  }

  const contexto = [
    sesion?.externalOrderId
      ? `Orden en Supabase: ${sesion.externalOrderId}. Estado: ${estadoOrden ?? 'desconocido'}. Cancelación realizada: ${cancelacionRealizada}.`
      : 'Orden sin registro en Supabase (cancelación local únicamente).',
    `Mensaje del cliente: "${msg.texto}"`,
    `Items en carrito: ${sesion?.items?.length ?? 0}`,
  ].filter(Boolean).join('\n');

  if (!openai) {
    const actualizarSesion: Partial<SesionPedidoCtx> = {
      estadoSesion: 'cancelada',
      items: [],
    };
    return {
      ...FALLBACK,
      actualizarSesion,
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_ORDEN_CANCELACION },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
    };

    const moduloSiguiente = (parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente']) ?? 'DESPEDIDA';
    const actualizarSesion: Partial<SesionPedidoCtx> = {
      estadoSesion: 'cancelada',
      items: [],
    };

    return {
      respuesta: parsed.respuesta ?? FALLBACK.respuesta,
      moduloSiguiente,
      actualizarSesion,
    };
  } catch {
    return {
      ...FALLBACK,
      actualizarSesion: { estadoSesion: 'cancelada', items: [] },
    };
  }
}
