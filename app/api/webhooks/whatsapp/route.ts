import { NextResponse } from "next/server";
import { generarRespuesta } from "@/lib/agente";
import { enviarWhatsAppTexto, verificarWebhook } from "@/lib/meta";
import { guardarDecision, guardarMensaje, obtenerOCrearConversacion, upsertCliente } from "@/lib/db-helpers";
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

  try {
    await prisma.eventoMeta.create({
      data: {
        idEventoMeta: `wa_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tipo: "whatsapp_message",
        payload: payload as never
      }
    });
  } catch {
    // continuar aunque falle el log
  }

  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const contact = value?.contacts?.[0];

  if (!message) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const texto = message.text?.body ?? "";
  const telefono = message.from ?? "";
  const nombreCliente = contact?.profile?.name ?? telefono;

  const decision = await generarRespuesta({
    canal: "whatsapp",
    cliente: nombreCliente,
    texto
  });

  try {
    const cliente = await upsertCliente({
      canal: "whatsapp",
      canalId: telefono,
      nombre: nombreCliente
    });

    const conversacion = await obtenerOCrearConversacion({
      clienteId: cliente.id,
      canal: "whatsapp",
      threadId: telefono
    });

    await guardarMensaje({
      conversacionId: conversacion.id,
      canal: "whatsapp",
      direccion: "entrante",
      texto,
      idMensajeWhatsapp: message.id,
      payloadMeta: message
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

    const envio = await enviarWhatsAppTexto({ telefono, texto: decision.respuesta });

    if (envio.ok) {
      await guardarMensaje({
        conversacionId: conversacion.id,
        canal: "whatsapp",
        direccion: "saliente",
        texto: decision.respuesta
      });
    }
  } catch {
    // si la DB falla, igual respondemos al cliente
    await enviarWhatsAppTexto({ telefono, texto: decision.respuesta });
  }

  return NextResponse.json({ ok: true, canal: "whatsapp", decision });
}
