import { NextResponse } from "next/server";
import { enviarWhatsAppTexto, verificarWebhook } from "@/lib/meta";
import {
  guardarMensaje,
  obtenerOCrearConversacion,
  upsertCliente,
  obtenerSesionPedido,
  upsertSesionPedido,
  cerrarSesionPedido,
} from "@/lib/db-helpers";
import { prisma } from "@/lib/prisma";
import { evaluarGuards, MENSAJES_CANCELACION } from "@/lib/modulos/guards";
import { despacharModulo } from "@/lib/modulos/dispatcher";
import type {
  SesionPedidoCtx,
  ItemCarritoWA,
  DireccionCliente,
  ModuloAgente,
} from "@/lib/modulos/types";
import { EstadoConversacion, Prisma } from "@prisma/client";

type WhatsAppWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        metadata?: {
          phone_number_id?: string;
        };
        messages?: {
          id?: string;
          from?: string;
          text?: {
            body?: string;
          };
        }[];
        contacts?: {
          profile?: {
            name?: string;
          };
        }[];
      };
    }[];
  }[];
};

type SesionPedidoDb = Prisma.SesionPedidoGetPayload<{
  include: { logs: true };
}>;

// ─── Mapeador sesión DB → SesionPedidoCtx ─────────────────────────────────

function mapearSesionACtx(sesion: SesionPedidoDb): SesionPedidoCtx {
  return {
    id: sesion.id,
    conversacionId: sesion.conversacionId,
    moduloActual: (sesion.moduloActual as ModuloAgente) ?? "BIENVENIDA",
    estadoSesion: (sesion.estadoSesion as SesionPedidoCtx["estadoSesion"]) ?? "activa",
    items: Array.isArray(sesion.items) ? (sesion.items as unknown as ItemCarritoWA[]) : [],
    modalidad: sesion.modalidad as SesionPedidoCtx["modalidad"],
    nombreCliente: sesion.nombreCliente ?? undefined,
    telefonoCliente: sesion.telefonoCliente ?? undefined,
    direccion: sesion.direccion ? (sesion.direccion as unknown as DireccionCliente) : undefined,
    costoDespacho: sesion.costoDespacho ?? undefined,
    metodoPago: sesion.metodoPago as SesionPedidoCtx["metodoPago"],
    externalOrderId: sesion.externalOrderId ?? undefined,
    externalOrderNumber: sesion.externalOrderNumber ?? undefined,
    intentosConfirmacion: sesion.intentosConfirmacion ?? 0,
    ultimaActividadEn: sesion.ultimaActividadEn ?? new Date(),
  };
}

// ─── GET — verificación de webhook Meta ───────────────────────────────────

export async function GET(request: Request) {
  const challenge = verificarWebhook(new URL(request.url).searchParams);

  if (!challenge) {
    return NextResponse.json(
      { ok: false, error: "Verificacion invalida" },
      { status: 403 }
    );
  }
  return new Response(challenge, { status: 200 });
}

// ─── POST — recepción de mensajes WhatsApp ────────────────────────────────

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as WhatsAppWebhookPayload | null;

  // Log del evento Meta (no bloqueante)
  try {
    await prisma.eventoMeta.create({
      data: {
        idEventoMeta: `wa_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tipo: "whatsapp_message",
        payload: payload as never,
      },
    });
  } catch {
    // continuar aunque falle el log
  }

  // Parseo del body de WhatsApp
  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const contact = value?.contacts?.[0];
  const phoneNumberId = value?.metadata?.phone_number_id ?? null;

  if (!message) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const texto = message.text?.body ?? "";
  const telefono = message.from ?? "";
  const nombreCliente = contact?.profile?.name ?? telefono;
  const local = phoneNumberId
    ? await prisma.local.findUnique({ where: { waPhoneId: phoneNumberId } })
    : null;
  const localId = local?.id;

  // Upsert cliente y conversación
  const cliente = await upsertCliente({
    canal: "whatsapp",
    canalId: telefono,
    nombre: nombreCliente,
    localId,
  });

  const conversacion = await obtenerOCrearConversacion({
    clienteId: cliente.id,
    canal: "whatsapp",
    threadId: telefono,
    localId,
  });

  // Guardar mensaje entrante
  await guardarMensaje({
    conversacionId: conversacion.id,
    canal: "whatsapp",
    direccion: "entrante",
    texto,
    idMensajeWhatsapp: message.id,
    payloadMeta: message,
  });

  // ── Pipeline modular ───────────────────────────────────────────────────

  // Cargar sesión activa
  const sesionDb = await obtenerSesionPedido(conversacion.id);
  const sesionCtx = sesionDb ? mapearSesionACtx(sesionDb) : null;

  // Evaluar guards (cancelación, timeout, max intentos)
  const guardResult = evaluarGuards(texto, sesionCtx);

  let respuestaFinal: string;
  let requiereHumano = false;

  if (guardResult.accion === "cancelar") {
    if (sesionDb) await cerrarSesionPedido(conversacion.id, "cancelada");
    respuestaFinal =
      MENSAJES_CANCELACION[guardResult.motivo] ?? "¡Entendido! Pedido cancelado.";
  } else {
    // Preparar mensaje para el dispatcher
    const mensajeDespacho = {
      canal: "whatsapp" as const,
      texto,
      conversacionId: conversacion.id,
      localId: localId ?? "",
      cliente: nombreCliente,
      telefonoCliente: telefono,
      idMensajeMeta: message.id,
    };

    // Despachar al módulo correspondiente
    const resultado = await despacharModulo(mensajeDespacho, sesionCtx);
    respuestaFinal = resultado.respuesta;
    requiereHumano = resultado.requiereHumano ?? false;

    // Aplicar actualizaciones de sesión
    const updates: Record<string, unknown> = {};
    if (resultado.actualizarSesion) Object.assign(updates, resultado.actualizarSesion);
    if (resultado.moduloSiguiente) updates.moduloActual = resultado.moduloSiguiente;
    if (Object.keys(updates).length > 0) {
      await upsertSesionPedido(conversacion.id, updates as Parameters<typeof upsertSesionPedido>[1]);
    }

    // Cerrar sesión si el módulo lo indica
    const estadoFinal = resultado.actualizarSesion?.estadoSesion;
    if (estadoFinal === "cancelada") {
      await cerrarSesionPedido(conversacion.id, "cancelada");
    } else if (estadoFinal === "completada") {
      await cerrarSesionPedido(conversacion.id, "completada");
    }
  }

  // Actualizar conversación (requiereHumano / estado)
  await prisma.conversacion.update({
    where: { id: conversacion.id },
    data: {
      requiereHumano,
      estado: requiereHumano
        ? EstadoConversacion.esperando_humano
        : EstadoConversacion.activa,
    },
  });

  // Enviar respuesta al cliente
  if (respuestaFinal) {
    const envio = await enviarWhatsAppTexto({
      telefono,
      texto: respuestaFinal,
      waToken: local?.waToken ?? undefined,
      waPhoneId: local?.waPhoneId ?? undefined,
    });

    if (envio.ok) {
      await guardarMensaje({
        conversacionId: conversacion.id,
        canal: "whatsapp",
        direccion: "saliente",
        texto: respuestaFinal,
      });
    }
  }

  return NextResponse.json({ ok: true, canal: "whatsapp" });
}
