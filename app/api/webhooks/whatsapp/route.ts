import { NextResponse } from "next/server";
import { enviarWhatsAppMedia, enviarWhatsAppTexto, verificarWebhook } from "@/lib/meta";
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
import { cargarMediaCatalogoVisual, detectarIntencionVisual } from "@/lib/catalogo-visual";
import { clasificarTipoReclamo, pareceReclamo } from "@/lib/modulos/flujo-utils";
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
          type?: string;
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

type MediaWebhook = { tipo: "imagen" | "documento"; url: string; caption?: string; nombre?: string };

function construirFallbackMedia(mediaItems: MediaWebhook[]) {
  if (mediaItems.length === 0) return "";
  const links = mediaItems
    .map((media, index) => {
      const nombre = media.nombre || media.caption || (media.tipo === "documento" ? "documento" : "imagen");
      return `${index + 1}. ${nombre}: ${media.url}`;
    })
    .join("\n");

  return `\n\nSi el archivo no se abre en WhatsApp, puedes verlo aquí:\n${links}`;
}

function textoParaMensajeNoTextual(tipo?: string) {
  if (tipo === "audio") {
    return "Recibí tu audio. Para evitar errores con el pedido, ¿me puedes escribirlo en texto? Si es un reclamo o algo urgente, te derivo con el equipo.";
  }
  if (tipo === "image") {
    return "Recibí tu imagen. Si es comprobante de pago o un problema con el pedido, te derivo con el equipo para revisarlo. Si quieres pedir, escríbeme el detalle en texto.";
  }
  if (tipo === "location") {
    return "Recibí tu ubicación. Para calcular bien el despacho, envíame también calle, número y comuna en texto.";
  }
  if (tipo === "document") {
    return "Recibí tu documento. Para avanzar sin errores, dime en texto qué necesitas revisar o confirmar.";
  }
  return "Recibí tu mensaje, pero necesito que me escribas el detalle en texto para poder ayudarte bien.";
}

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

  const texto = message.text?.body?.trim() || textoParaMensajeNoTextual(message.type);
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

  if (!message.text?.body?.trim()) {
    const requiereHumanoNoTextual = message.type === "image" || message.type === "audio" || message.type === "document";
    await prisma.conversacion.update({
      where: { id: conversacion.id },
      data: {
        requiereHumano: requiereHumanoNoTextual,
        estado: requiereHumanoNoTextual ? EstadoConversacion.esperando_humano : EstadoConversacion.activa,
      },
    });

    await enviarWhatsAppTexto({
      telefono,
      texto,
      waToken: local?.waToken ?? undefined,
      waPhoneId: local?.waPhoneId ?? undefined,
    });

    await guardarMensaje({
      conversacionId: conversacion.id,
      canal: "whatsapp",
      direccion: "saliente",
      texto,
    });

    return NextResponse.json({ ok: true, canal: "whatsapp", nonText: true });
  }

  // ── Pipeline modular ───────────────────────────────────────────────────

  // Cargar sesión activa — ignorar sesiones completadas/canceladas
  const sesionDbRaw = await obtenerSesionPedido(conversacion.id);
  const sesionDb = sesionDbRaw && !['completada', 'cancelada'].includes(sesionDbRaw.estadoSesion)
    ? sesionDbRaw
    : null;
  const sesionCtx = sesionDb ? mapearSesionACtx(sesionDb) : null;

  // Evaluar guards (cancelación, timeout, max intentos)
  const guardResult = evaluarGuards(texto, sesionCtx);

  let respuestaFinal: string;
  let requiereHumano = false;
  let mediaAEnviar: MediaWebhook[] = [];

  if (guardResult.accion === "cancelar") {
    if (sesionDb) await cerrarSesionPedido(conversacion.id, "cancelada");
    respuestaFinal =
      MENSAJES_CANCELACION[guardResult.motivo] ?? "¡Entendido! Pedido cancelado.";
  } else {
    // Cargar historial reciente para dar contexto a los módulos
    const mensajesRecientes = await prisma.mensaje.findMany({
      where: { conversacionId: conversacion.id },
      orderBy: { creadoEn: "desc" },
      take: 8,
    });
    const historial = mensajesRecientes
      .reverse()
      .filter((m) => m.texto !== texto)
      .map((m) => ({
        rol: m.direccion === "entrante" ? ("cliente" as const) : ("agente" as const),
        texto: m.texto,
      }));

    // Preparar mensaje para el dispatcher
    const mensajeDespacho = {
      canal: "whatsapp" as const,
      texto,
      conversacionId: conversacion.id,
      localId: localId ?? "",
      cliente: nombreCliente,
      telefonoCliente: telefono,
      idMensajeMeta: message.id,
      historial: historial.length > 0 ? historial : undefined,
    };

    // Despachar al módulo correspondiente
    const resultado = await despacharModulo(mensajeDespacho, sesionCtx);
    respuestaFinal = resultado.respuesta;
    requiereHumano = resultado.requiereHumano ?? false;
    if (resultado.mediaAEnviar && resultado.mediaAEnviar.length > 0) {
      mediaAEnviar = resultado.mediaAEnviar;
    } else {
      const intencionVisual = detectarIntencionVisual(texto);
      if (intencionVisual) mediaAEnviar = await cargarMediaCatalogoVisual(intencionVisual).catch(() => []);
    }

    // Aplicar actualizaciones de sesión
    const updates: Record<string, unknown> = {};
    if (resultado.actualizarSesion) Object.assign(updates, resultado.actualizarSesion);
    if (resultado.moduloSiguiente) updates.moduloActual = resultado.moduloSiguiente;

    // FIX pérdida de contexto: persistir SIEMPRE el módulo donde quedó la conversación.
    // Si el módulo ejecutado no es BIENVENIDA (ej. PEDIDOS preguntó una aclaración),
    // crear/actualizar la sesión para que el próximo mensaje ("si", "esa") llegue
    // al módulo correcto y no vuelva a saludar desde cero.
    if (!updates.moduloActual && resultado.moduloEjecutado && resultado.moduloEjecutado !== "BIENVENIDA") {
      updates.moduloActual = resultado.moduloEjecutado;
    }

    // Refrescar ultimaActividadEn aunque no haya otros cambios (evita timeouts falsos)
    if (Object.keys(updates).length > 0 || sesionDb) {
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

  if (requiereHumano || pareceReclamo(texto)) {
    await prisma.reclamo.create({
      data: {
        clienteId: cliente.id,
        conversacionId: conversacion.id,
        tipo: clasificarTipoReclamo(texto),
        descripcion: texto,
        prioridad: pareceReclamo(texto) ? "alta" : "media",
      },
    }).catch(() => null);
  }

  const mediaItems = mediaAEnviar;
  const mediaFallida: MediaWebhook[] = [];

  if (Array.isArray(mediaItems) && mediaItems.length > 0) {
    for (const media of mediaItems) {
      const envioMedia = await enviarWhatsAppMedia({
        telefono,
        tipo: media.tipo,
        url: media.url,
        caption: media.caption,
        nombre: media.nombre,
        waToken: local?.waToken ?? undefined,
        waPhoneId: local?.waPhoneId ?? undefined,
      }).catch((error) => ({
        ok: false,
        modo: "error",
        detalle: error instanceof Error ? error.message : "Error enviando media",
      }));

      if (!envioMedia?.ok) {
        console.error("[WhatsApp media] No se pudo enviar archivo", {
          tipo: media.tipo,
          url: media.url,
          status: "status" in envioMedia ? envioMedia.status : undefined,
          detalle: "detalle" in envioMedia ? envioMedia.detalle : undefined,
        });
        mediaFallida.push(media);
      }
    }
  }

  if (mediaFallida.length > 0 || (mediaItems.length === 0 && detectarIntencionVisual(texto))) {
    const mediaFallback = mediaFallida.length > 0
      ? mediaFallida
      : await cargarMediaCatalogoVisual(detectarIntencionVisual(texto)!).catch(() => []);
    respuestaFinal = `${respuestaFinal}${construirFallbackMedia(mediaFallback)}`;
  }

  // Enviar texto de respuesta
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
