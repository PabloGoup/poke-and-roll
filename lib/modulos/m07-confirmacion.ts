// ============================================================
// lib/modulos/m07-confirmacion.ts — Confirmación del pedido
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_CONFIRMACION } from './prompts/m07';
import {
  construirResumenPedido,
  esConfirmacionExplicita,
  esNegacionOCancelacion,
  esCierreDePedido,
} from './flujo-utils';

const FALLBACK: RespuestaModulo = {
  respuesta: 'Perdona, tuve un problema técnico. ¿Puedes confirmar si deseas continuar con tu pedido?',
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
  if (!sesion || sesion.items.length === 0) {
    return {
      respuesta: 'No encuentro items en tu pedido. ¿Quieres volver a armar tu orden?',
      moduloSiguiente: 'PEDIDOS',
    };
  }

  const openai = getOpenAI();
  const resumen = construirResumenPedido(sesion);

  if (esConfirmacionExplicita(msg.texto)) {
    return {
      respuesta: 'Perfecto, pedido confirmado. ¿Lo prefieres para retiro en local o delivery?',
      moduloSiguiente: 'TIPO_ENTREGA',
      actualizarSesion: { intentosConfirmacion: 0 },
    };
  }

  if (esNegacionOCancelacion(msg.texto)) {
    return {
      respuesta: 'Entendido, cancelamos este pedido.',
      moduloSiguiente: 'ORDEN_CANCELACION',
    };
  }

  if (esCierreDePedido(msg.texto)) {
    return {
      respuesta: `Tengo esto anotado:\n${resumen}\n\nPara avanzar necesito que me confirmes con "sí" si el pedido está correcto.`,
      actualizarSesion: { intentosConfirmacion: sesion.intentosConfirmacion + 1 },
    };
  }

  const contexto = [
    `Resumen del pedido:\n${resumen}`,
    `Intentos de confirmación: ${sesion.intentosConfirmacion}`,
    `Mensaje del cliente: "${msg.texto}"`,
  ].join('\n');

  if (!openai) {
    return {
      respuesta: `Aquí está tu resumen:\n${resumen}\n\n¿Confirmas el pedido?`,
      actualizarSesion: { intentosConfirmacion: sesion.intentosConfirmacion + 1 },
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_CONFIRMACION },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
      confirmado?: boolean | null;
    };

    const moduloSiguiente = (parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente']) ?? undefined;

    // Calcular actualización del contador de intentos
    const nuevoIntentos =
      parsed.confirmado === true
        ? 0
        : parsed.confirmado === false
        ? sesion.intentosConfirmacion // se canceló, no incrementar
        : sesion.intentosConfirmacion + 1; // null = no confirmado aún

    const actualizarSesion: Partial<SesionPedidoCtx> = {
      intentosConfirmacion: nuevoIntentos,
    };

    return {
      respuesta: parsed.respuesta ?? FALLBACK.respuesta,
      moduloSiguiente,
      actualizarSesion,
    };
  } catch {
    return FALLBACK;
  }
}
