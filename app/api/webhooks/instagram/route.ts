import { NextResponse } from "next/server";
import { generarRespuesta } from "@/lib/agente";
import { enviarInstagramImagenConToken, enviarInstagramTextoConToken, verificarWebhook } from "@/lib/meta";
import { guardarDecision, guardarMensaje, obtenerOCrearConversacion, resolverNombreMetaCliente, upsertCliente } from "@/lib/db-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const challenge = verificarWebhook(new URL(request.url).searchParams);
  if (!challenge) {
    return NextResponse.json({ ok: false, error: "Verificacion invalida" }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  // ── Identificar a qué local pertenece este evento ──────────────────────────
  const igPageId: string | undefined = payload?.entry?.[0]?.id;

  // Buscar el local por su Instagram Page ID
  const local = igPageId
    ? await prisma.local.findUnique({ where: { igPageId } })
    : null;

  // Fallback: si no hay local configurado aún, usar token de entorno
  const igToken = local?.fbToken ?? local?.igToken ?? process.env.META_ACCESS_TOKEN ?? null;

  if (!igToken) {
    return NextResponse.json({ ok: false, error: "Local no encontrado o sin token IG" }, { status: 400 });
  }

  // ── Log del evento raw ─────────────────────────────────────────────────────
  try {
    await prisma.eventoMeta.create({
      data: {
        idEventoMeta: `ig_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tipo: "instagram_message",
        payload: payload as never
      }
    });
  } catch {
    // continuar aunque falle el log
  }

  const messaging = payload?.entry?.[0]?.messaging?.[0];
  const texto = messaging?.message?.text;

  if (!texto) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const senderId: string = messaging?.sender?.id ?? "ig_unknown";

  // ── Generar respuesta con el agente del local ──────────────────────────────
  const decision = await generarRespuesta({
    canal: "instagram",
    cliente: senderId,
    texto,
    localId: local?.id
  });

  // ── Persistir conversación, mensajes y decisión ────────────────────────────
  try {
    const cliente = await upsertCliente({
      canal: "instagram",
      canalId: senderId,
      localId: local?.id
    });

    if (!cliente.nombre && igToken) {
      resolverNombreMetaCliente({ clienteId: cliente.id, userId: senderId, token: igToken, canal: "instagram" });
    }

    const conversacion = await obtenerOCrearConversacion({
      clienteId: cliente.id,
      canal: "instagram",
      threadId: messaging?.thread?.id,
      localId: local?.id
    });

    await guardarMensaje({
      conversacionId: conversacion.id,
      canal: "instagram",
      direccion: "entrante",
      texto,
      idMensajeMeta: messaging?.message?.mid,
      payloadMeta: messaging
    });

    await guardarDecision({
      conversacionId: conversacion.id,
      agente: decision.agente,
      intencion: decision.intencion,
      entrada: texto,
      salida: decision.respuesta,
      decisionSeguridad: decision.decisionSeguridad,
      requiereHumano: decision.requiereHumano
    });

    const envio = await enviarInstagramTextoConToken({
      recipientId: senderId,
      texto: decision.respuesta,
      token: igToken,
      fbPageId: local?.fbPageId,
      igPageId: local?.igPageId
    });

    if (envio.ok) {
      await guardarMensaje({
        conversacionId: conversacion.id,
        canal: "instagram",
        direccion: "saliente",
        texto: decision.respuesta
      });

      // Enviar imagen del catálogo si existe y no es PDF
      const catalogo = decision.catalogoVisual;
      const esPdf = catalogo?.url?.includes("/api/catalogo/pdf") || catalogo?.nombre?.toLowerCase().endsWith(".pdf");
      if (catalogo?.url && !esPdf) {
        await enviarInstagramImagenConToken({
          recipientId: senderId,
          imageUrl: catalogo.url,
          token: igToken,
          fbPageId: local?.fbPageId,
          igPageId: local?.igPageId
        });
      }
    }
  } catch (err) {
    console.error("[IG webhook] Error en persistencia, intentando enviar igual:", err);
    await enviarInstagramTextoConToken({
      recipientId: senderId,
      texto: decision.respuesta,
      token: igToken,
      fbPageId: local?.fbPageId,
      igPageId: local?.igPageId
    });
  }

  return NextResponse.json({
    ok: true,
    canal: "instagram",
    local: local?.slug ?? "fallback-env",
    decision
  });
}
