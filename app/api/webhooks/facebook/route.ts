import { NextResponse } from "next/server";
import { generarRespuesta } from "@/lib/agente";
import { enviarFacebookTexto, verificarFirmaWebhookMeta, verificarWebhook } from "@/lib/meta";
import { guardarDecision, guardarMensaje, obtenerOCrearConversacion, resolverNombreMetaCliente, upsertCliente } from "@/lib/db-helpers";
import { prisma } from "@/lib/prisma";
import { enviarAlertaOperativa } from "@/lib/alertas";

export async function GET(request: Request) {
  const challenge = verificarWebhook(new URL(request.url).searchParams);

  if (!challenge) {
    return NextResponse.json({ ok: false, error: "Verificacion invalida" }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await request.text().catch(() => "");
  if (!verificarFirmaWebhookMeta(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 403 });
  }
  const payload = rawBody ? await Promise.resolve().then(() => JSON.parse(rawBody)).catch(() => null) : null;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
  }

  if (payload?.object !== "page") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await prisma.eventoMeta.create({
      data: {
        idEventoMeta: `fb_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tipo: "facebook_message",
        payload: payload as never
      }
    });
  } catch {
    // continuar aunque falle el log
  }

  const messaging = payload?.entry?.[0]?.messaging?.[0];
  const texto = messaging?.message?.text;

  if (!texto || messaging?.message?.is_echo) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const senderId: string = messaging?.sender?.id ?? "fb_unknown";
  const pageId: string = payload?.entry?.[0]?.id ?? "";
  const local = pageId
    ? await prisma.local.findFirst({ where: { fbPageId: pageId } })
    : null;
  const fbToken = local?.fbToken ?? undefined;

  if (!local || !fbToken) {
    return NextResponse.json({ ok: true, ignored: true, reason: "unknown-facebook-page" });
  }

  const decision = await generarRespuesta({
    canal: "facebook",
    cliente: senderId,
    texto,
    localId: local.id
  });

  try {
    const cliente = await upsertCliente({
      canal: "facebook",
      canalId: senderId,
      localId: local.id
    });

    if (!cliente.nombre && fbToken) {
      resolverNombreMetaCliente({ clienteId: cliente.id, userId: senderId, token: fbToken, canal: "facebook" });
    }

    const conversacion = await obtenerOCrearConversacion({
      clienteId: cliente.id,
      canal: "facebook",
      localId: local.id
    });

    await guardarMensaje({
      conversacionId: conversacion.id,
      canal: "facebook",
      direccion: "entrante",
      texto,
      idMensajeMeta: messaging?.message?.mid,
      payloadMeta: messaging
    });

    const yaEsperabaHumano = conversacion.estado === "esperando_humano";

    await guardarDecision({
      conversacionId: conversacion.id,
      agente: decision.agente,
      intencion: decision.intencion,
      entrada: texto,
      salida: decision.respuesta,
      decisionSeguridad: decision.decisionSeguridad,
      requiereHumano: decision.requiereHumano
    });

    if (decision.requiereHumano && !yaEsperabaHumano) {
      enviarAlertaOperativa({
        canal: "Facebook",
        nombreCliente: cliente.nombre ?? senderId,
        ultimoMensaje: texto,
      }).catch(() => null);
    }

    const envio = await enviarFacebookTexto({ recipientId: senderId, texto: decision.respuesta, fbToken });

    if (envio.ok) {
      await guardarMensaje({
        conversacionId: conversacion.id,
        canal: "facebook",
        direccion: "saliente",
        texto: decision.respuesta
      });
    }
  } catch {
    await enviarFacebookTexto({ recipientId: senderId, texto: decision.respuesta, fbToken });
  }

  return NextResponse.json({ ok: true, canal: "facebook", decision });
}
