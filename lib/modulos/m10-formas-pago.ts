// ============================================================
// lib/modulos/m10-formas-pago.ts — Formas de pago y creación de orden
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_FORMAS_PAGO } from './prompts/m10';
import { crearOrdenWhatsApp } from '@/lib/supabase-pedidos';
import { detectarMetodoPago } from './flujo-utils';

const FALLBACK: RespuestaModulo = {
  respuesta: '¿Cómo deseas pagar? Aceptamos efectivo, tarjeta o transferencia. También necesito tu nombre y teléfono para registrar el pedido.',
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
  const metodoDetectado = detectarMetodoPago(msg.texto);

  const contextoActual = [
    `Método de pago actual: ${sesion.metodoPago ?? 'no definido'}`,
    `Nombre del cliente actual: ${sesion.nombreCliente ?? 'no definido'}`,
    `Teléfono del cliente actual: ${sesion.telefonoCliente ?? 'no definido'}`,
    `Mensaje del cliente: "${msg.texto}"`,
  ].join('\n');

  if (!openai) {
    const metodoPagoFinal = metodoDetectado ?? sesion.metodoPago ?? null;
    const telefonoFinal = msg.telefonoCliente ?? sesion.telefonoCliente ?? undefined;

    if (!metodoPagoFinal || !sesion.nombreCliente) {
      return {
        respuesta: metodoPagoFinal
          ? 'Perfecto. ¿A nombre de quién dejamos el pedido?'
          : FALLBACK.respuesta,
        actualizarSesion: {
          ...(metodoPagoFinal ? { metodoPago: metodoPagoFinal } : {}),
          ...(telefonoFinal ? { telefonoCliente: telefonoFinal } : {}),
        },
      };
    }

    try {
      const resultado = await crearOrdenWhatsApp({
        ...sesion,
        metodoPago: metodoPagoFinal,
        telefonoCliente: telefonoFinal,
      });
      return {
        respuesta: `¡Pedido recibido! Tu número de orden es ${resultado.number}. En breve lo estaremos preparando.`,
        moduloSiguiente: 'DAR_GRACIAS',
        actualizarSesion: {
          metodoPago: metodoPagoFinal,
          telefonoCliente: telefonoFinal,
          externalOrderId: resultado.orderId,
          externalOrderNumber: resultado.number,
        },
      };
    } catch {
      return {
        respuesta: 'Hubo un problema al registrar tu pedido. Te conectamos con nuestro equipo para resolverlo.',
        moduloSiguiente: 'ATENCION',
        requiereHumano: true,
      };
    }
  }

  // Paso 1: LLM extrae métodoPago, nombreCliente, telefonoCliente
  let metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto' | null = null;
  let nombreCliente: string | null = null;
  let telefonoCliente: string | null = null;
  let respuestaLLM: string = FALLBACK.respuesta;
  let moduloLLM: string | undefined;

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_FORMAS_PAGO },
        { role: 'user', content: contextoActual },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string;
      metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia' | null;
      nombreCliente?: string | null;
      telefonoCliente?: string | null;
    };

    respuestaLLM = parsed.respuesta ?? FALLBACK.respuesta;
    moduloLLM = parsed.moduloSiguiente;
    metodoPago = parsed.metodoPago ?? metodoDetectado ?? null;
    nombreCliente = parsed.nombreCliente ?? null;
    telefonoCliente = parsed.telefonoCliente ?? null;
  } catch {
    return FALLBACK;
  }

  // El teléfono de WhatsApp del remitente es siempre el autoritativo
  // msg.telefonoCliente viene de Meta con código de país (ej: 56951320548)
  const telefonoWA = msg.telefonoCliente ?? null;

  // Combinar datos nuevos con datos existentes en sesión
  const metodoPagoFinal = metodoPago ?? metodoDetectado ?? sesion.metodoPago ?? null;
  const nombreFinal = nombreCliente ?? sesion.nombreCliente ?? null;
  // Prioridad: número WA de origen > lo que dijo el cliente > sesión previa
  const telefonoFinal = telefonoWA ?? telefonoCliente ?? sesion.telefonoCliente ?? undefined;

  // Paso 2: solo bloqueamos si faltan método de pago o nombre (teléfono siempre disponible vía WA)
  if (!metodoPagoFinal || !nombreFinal) {
    return {
      respuesta: respuestaLLM,
      moduloSiguiente: moduloLLM !== 'DAR_GRACIAS' ? (moduloLLM as RespuestaModulo['moduloSiguiente']) : undefined,
      actualizarSesion: {
        ...(metodoPagoFinal ? { metodoPago: metodoPagoFinal } : {}),
        ...(nombreFinal ? { nombreCliente: nombreFinal } : {}),
        ...(telefonoFinal ? { telefonoCliente: telefonoFinal } : {}),
      },
    };
  }

  // Paso 3: todos los datos disponibles — construir sesión actualizada
  const sesionCompleta: SesionPedidoCtx = {
    ...sesion,
    metodoPago: metodoPagoFinal,
    nombreCliente: nombreFinal,
    telefonoCliente: telefonoFinal,
  };

  // Paso 4: crear la orden en Supabase
  try {
    const resultado = await crearOrdenWhatsApp(sesionCompleta);

    return {
      respuesta: `¡Pedido recibido! Tu número de orden es ${resultado.number}. En breve lo estaremos preparando.`,
      moduloSiguiente: 'DAR_GRACIAS',
      actualizarSesion: {
        metodoPago: metodoPagoFinal,
        nombreCliente: nombreFinal,
        telefonoCliente: telefonoFinal,
        externalOrderId: resultado.orderId,
        externalOrderNumber: resultado.number,
      },
    };
  } catch (err) {
    const detalle = err instanceof Error ? err.message : 'error desconocido';
    console.error('[m10-formas-pago] Error al crear orden en Supabase:', detalle);

    return {
      respuesta: 'Hubo un problema al registrar tu pedido. Te conectamos con nuestro equipo para resolverlo.',
      moduloSiguiente: 'ATENCION',
      requiereHumano: true,
      actualizarSesion: {
        metodoPago: metodoPagoFinal,
        nombreCliente: nombreFinal,
        telefonoCliente: telefonoFinal,
      },
    };
  }
}
