// ============================================================
// lib/modulos/m04-pedidos.ts — Módulo de toma de pedidos
// ============================================================

import OpenAI from 'openai';
import type { MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from './types';
import { PROMPT_PEDIDOS } from './prompts/m04';
import { obtenerCatalogoProductos, resolverItemsCarrito } from '@/lib/supabase-pedidos';
import { verificarHorario } from './horarios';
import { prisma } from '@/lib/prisma';
import { construirResumenPedido, esCierreDePedido } from './flujo-utils';

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

  // GATE: verificar horario de atención
  try {
    const horariosDb = await prisma.horarioAtencion.findMany({ where: { activo: true } });
    if (horariosDb.length > 0) {
      const infoHorario = verificarHorario(
        horariosDb.map(h => ({
          diaSemana: h.diaSemana,
          apertura: h.horaApertura,
          cierre: h.horaCierre,
        }))
      );
      if (!infoHorario.puedeRecibir && infoHorario.mensaje) {
        return {
          respuesta: infoHorario.mensaje,
          moduloSiguiente: 'DESPEDIDA',
        };
      }
    }
  } catch {
    // Si no se puede verificar horario, seguimos adelante (fail open)
  }

  // Obtener catálogo de productos
  let catalogoTexto = '';
  try {
    const catalogo = await obtenerCatalogoProductos();
    const catalogoSimple = catalogo
      .filter(p => p.status === 'activo')
      .map(p => ({
        nombre: p.productName,
        precio: p.unitPrice,
        categoria: p.categoryName,
        ...(p.variants.length > 0
          ? { variantes: p.variants.map(v => `${v.name}: $${v.price.toLocaleString('es-CL')}`) }
          : {}),
      }));
    catalogoTexto = `Catálogo disponible:\n${JSON.stringify(catalogoSimple, null, 2)}`;
  } catch {
    catalogoTexto = 'Catálogo no disponible temporalmente.';
  }

  // Construir items actuales del carrito
  const itemsActuales = sesion?.items ?? [];
  if (itemsActuales.length > 0 && esCierreDePedido(msg.texto)) {
    return {
      respuesta: `Perfecto, tengo esto anotado:\n${construirResumenPedido({ ...sesion!, items: itemsActuales })}\n\n¿Confirmas que el pedido está correcto?`,
      moduloSiguiente: 'CONFIRMACION',
    };
  }

  const carritoTexto = itemsActuales.length > 0
    ? `Carrito actual:\n${itemsActuales.map(i => `- ${i.quantity}x ${i.productName}${i.notes ? ` (${i.notes})` : ''}: $${(i.unitPrice * i.quantity).toLocaleString('es-CL')}`).join('\n')}`
    : 'Carrito vacío.';

  const historialTexto = msg.historial && msg.historial.length > 0
    ? `Historial reciente:\n${msg.historial.map(h => `[${h.rol === 'cliente' ? 'Cliente' : 'Agente'}]: ${h.texto}`).join('\n')}`
    : '';

  const contexto = [
    catalogoTexto,
    carritoTexto,
    historialTexto,
    `Mensaje del cliente: "${msg.texto}"`,
  ].filter(Boolean).join('\n\n');

  if (!openai) {
    return {
      respuesta: 'Con gusto tomo tu pedido. ¿Qué productos te gustaría ordenar? Tenemos rolls, pokes y más.',
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT_PEDIDOS },
        { role: 'user', content: contexto },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      respuesta?: string;
      moduloSiguiente?: string | null;
      itemsIdentificados?: { nombre: string; cantidad: number; notas?: string }[];
    };

    if (!parsed.respuesta) return FALLBACK;

    // Resolver items identificados contra el catálogo real
    const itemsIdentificados = parsed.itemsIdentificados ?? [];
    if (itemsIdentificados.length > 0) {
      try {
        const { resueltos, noEncontrados } = await resolverItemsCarrito(itemsIdentificados);

        if (noEncontrados.length > 0) {
          // Hay items no encontrados — no avanzar, pedir alternativa
          const listaNoEncontrados = noEncontrados.join(', ');
          return {
            respuesta: `Lo siento, no encontré en el menú: ${listaNoEncontrados}. ¿Quieres elegir algo diferente o quizás te referías a otro nombre?`,
            moduloSiguiente: 'PEDIDOS',
          };
        }

        if (resueltos.length > 0) {
          // Agregar resueltos al carrito existente
          const itemsExistentes = sesion?.items ?? [];
          const itemsMerged = [...itemsExistentes, ...resueltos];

          return {
            respuesta: parsed.respuesta,
            moduloSiguiente: (parsed.moduloSiguiente as RespuestaModulo['moduloSiguiente']) ?? 'PEDIDOS',
            actualizarSesion: { items: itemsMerged },
          };
        }
      } catch {
        // Error resolviendo items — responder sin actualizar carrito
      }
    }

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
