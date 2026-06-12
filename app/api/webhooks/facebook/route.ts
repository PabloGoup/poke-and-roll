import { NextResponse } from "next/server";
import { generarRespuesta } from "@/lib/agente";
import { enviarFacebookTexto, verificarWebhook } from "@/lib/meta";
import { guardarDecision, guardarMensaje, obtenerOCrearConversacion, upsertCliente } from "@/lib/db-helpers";
import { prisma } from "@/lib/prisma";

async function getFbTokenParaPagina(pageId: string): Promise<string | undefined> {
  if (!pageId) return undefined;
  const local = await prisma.local.findFirst({ where: { fbPageId: pageId }, select: { fbToken: true } });
  return local?.fbToken ?? undefined;
}

export async function GET(request: Request) {
  const challenge = verificarWebhook(new URL(request.url).searchParams);

  if (!challenge) {
    return NextResponse.json({ ok: false, error: "Verificacion invalida" }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

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
  const fbToken = await getFbTokenParaPagina(pageId);

  const decision = await generarRespuesta({
    canal: "facebook",
    cliente: senderId,
    texto
  });

  try {
    const cliente = await upsertCliente({
      canal: "facebook",
      canalId: senderId
    });

    const conversacion = await obtenerOCrearConversacion({
      clienteId: cliente.id,
      canal: "facebook"
    });

    await guardarMensaje({
      conversacionId: conversacion.id,
      canal: "facebook",
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
