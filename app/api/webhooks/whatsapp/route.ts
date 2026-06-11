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
import type {
  SesionPedidoCtx,
  ItemCarritoWA,
  DireccionCliente,
  ModuloAgente,
  MediaAEnviar,
} from "@/lib/modulos/types";
import { EstadoConversacion, Prisma } from "@prisma/client";

// Detecta si el mensaje pide el catálogo visual o las promociones
function detectarSolicitudCatalogo(texto: string): "menu" | "promos" | null {
  const n = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const esPromos =
    /\b(promo|promos|promocion|promociones)\b/.test(n) &&
    (
      /\b(que|cuales|ver|manda|envia|tienen|hay|muestrame|mostrar|quiero|necesito|todas?|dime|enviame)\b/.test(n) ||
      /^(las?\s+)?(promos?|promociones?)[\s?!.]*$/.test(n.trim())
    );
  const esMenu =
    /\b(menu|carta|catalogo)\b/.test(n) ||
    /\b(necesito|enviame|manda|puedes enviar|puedes mandar)\b.*\b(menu|carta)\b/.test(n);
  if (esPromos) return "promos";
  if (esMenu) return "menu";
  return null;
}

async function cargarImagenesParaEnviar(filtro: "menu" | "promos"): Promise<MediaAEnviar[]> {
  try {
    const imagenes = await prisma.catalogoVisualAgente.findMany({ where: { activo: true }, orderBy: { creadoEn: "asc" } });
    const fuente = imagenes.filter(i => i.url.startsWith("http"));
    const seleccionadas = filtro === "promos"
      ? fuente.filter(i => i.nombre.toLowerCase().includes("promo"))
      : fuente;
    return seleccionadas.map(img => ({
      tipo: "imagen" as const,
      url: img.url,
      caption: img.nombre.replace(/\.(png|jpg|jpeg|webp)$/i, "").replace(/_/g, " "),
    }));
  } catch {
    return [];
  }
}

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
  let mediaAEnviar: { tipo: "imagen" | "documento"; url: string; caption?: string; nombre?: string }[] = [];

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
      // Si el módulo no cargó imágenes (ej. M01 enrutando al primer mensaje),
      // detectar aquí y cargarlas directamente en el webhook
      const solicitud = detectarSolicitudCatalogo(texto);
      if (solicitud) mediaAEnviar = await cargarImagenesParaEnviar(solicitud);
    }

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

  const mediaItems = mediaAEnviar;

  if (Array.isArray(mediaItems) && mediaItems.length > 0) {
    for (const media of mediaItems as { tipo: "imagen" | "documento"; url: string; caption?: string; nombre?: string }[]) {
      await enviarWhatsAppMedia({
        telefono,
        tipo: media.tipo,
        url: media.url,
        caption: media.caption,
        nombre: media.nombre,
        waToken: local?.waToken ?? undefined,
        waPhoneId: local?.waPhoneId ?? undefined,
      }).catch(() => null); // fail silently por imagen individual
    }
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
