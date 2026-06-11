// ============================================================
// lib/modulos/m05-orden-compra.ts — Módulo de resumen y confirmación de orden
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_ORDEN_COMPRA } from './prompts/m05';

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

function formatearPrecio(pesos: number): string {
  return `$${pesos.toLocaleString('es-CL')}`;
}

export async function ejecutar(
  msg: MensajeDespacho,
  sesion: SesionPedidoCtx | null
): Promise<RespuestaModulo> {
  const openai = getOpenAI();

  const items = sesion?.items ?? [];

  // Si no hay items, redirigir a PEDIDOS
  if (items.length === 0) {
    return {
      respuesta: 'No tienes productos en el carrito aún. ¿Qué quieres pedir?',
      moduloSiguiente: 'PEDIDOS',
    };
  }

  // Calcular subtotal
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // Construir resumen numerado del carrito
  const resumenItems = items
    .map((item, idx) =>
      `${idx + 1}. ${item.quantity}x ${item.productName}${item.notes ? ` (${item.notes})` : ''} — ${formatearPrecio(item.unitPrice * item.quantity)}`
    )
    .join('\n');

  const resumenCarrito = `Carrito:\n${resumenItems}\n\nSubtotal: ${formatearPrecio(subtotal)}`;

  const contexto = [
    resumenCarrito,
    `Mensaje del cliente: "${msg.texto}"`,
  ].join('\n\n');

  if (!openai) {
    return {
      respuesta: `Aquí está tu resumen:\n\n${resumenItems}\n\nSubtotal: ${formatearPrecio(subtotal)}\n\n¿Confirmas el pedido o quieres modificar algo?`,
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_ORDEN_COMPRA },
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
    };
  } catch {
    return FALLBACK;
  }
}
