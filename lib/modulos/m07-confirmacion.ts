// ============================================================
// lib/modulos/m07-confirmacion.ts — Confirmación del pedido
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_CONFIRMACION } from './prompts/m07';

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

function calcularTotal(sesion: SesionPedidoCtx): number {
  const subtotal = sesion.items.reduce((acc, item) => {
    const modTotal = item.modifiers.reduce((m, mod) => m + mod.priceDelta, 0);
    return acc + (item.unitPrice + modTotal) * item.quantity;
  }, 0);
  return subtotal + (sesion.costoDespacho ?? 0);
}

function construirResumenPedido(sesion: SesionPedidoCtx): string {
  const lineas = sesion.items.map((item) => {
    const mods = item.modifiers.length > 0
      ? ` (${item.modifiers.map((m) => m.name).join(', ')})`
      : '';
    const precio = (item.unitPrice + item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) * item.quantity;
    return `• ${item.quantity}x ${item.productName}${mods} — $${precio.toLocaleString('es-CL')}`;
  });

  const total = calcularTotal(sesion);
  const despachoLinea = sesion.costoDespacho
    ? `\n• Despacho: $${sesion.costoDespacho.toLocaleString('es-CL')}`
    : '';

  return `${lineas.join('\n')}${despachoLinea}\n\nTotal: $${total.toLocaleString('es-CL')}`;
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

  const contexto = [
    `Resumen del pedido:\n${resumen}`,
    `Intentos de confirmación: ${sesion.intentosConfirmacion}`,
    `Mensaje del cliente: "${msg.texto}"`,
  ].join('\n');

  if (!openai) {
    // Fallback: asumir que el cliente confirma si el mensaje tiene señales positivas
    const textoLower = msg.texto.toLowerCase();
    const confirma = ['sí', 'si', 'confirmo', 'dale', 'ok', 'bueno', 'listo', 'sip'].some((p) =>
      textoLower.includes(p)
    );
    const cancela = ['no', 'cancelar', 'cancela'].some((p) => textoLower.includes(p));

    if (confirma) {
      return {
        respuesta: 'Perfecto, pedido confirmado. ¿Lo necesitas para delivery o retiro en local?',
        moduloSiguiente: 'TIPO_ENTREGA',
        actualizarSesion: { intentosConfirmacion: 0 },
      };
    }
    if (cancela) {
      return {
        respuesta: 'Entendido, cancelamos el pedido.',
        moduloSiguiente: 'ORDEN_CANCELACION',
      };
    }
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
