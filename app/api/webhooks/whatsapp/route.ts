import { NextResponse } from "next/server";
import { redactarRespuestaBase } from "@/lib/agente";
import { verificarWebhook } from "@/lib/meta";

export async function GET(request: Request) {
  const challenge = verificarWebhook(new URL(request.url).searchParams);

  if (!challenge) {
    return NextResponse.json({ ok: false, error: "Verificacion invalida" }, { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const contact = value?.contacts?.[0];

  if (!message) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const texto = message.text?.body ?? "";
  const cliente = contact?.profile?.name ?? message.from ?? "cliente_whatsapp";
  const decision = redactarRespuestaBase({
    canal: "whatsapp",
    cliente,
    texto
  });

  return NextResponse.json({
    ok: true,
    canal: "whatsapp",
    idMensajeWhatsapp: message.id,
    cliente,
    decision,
    nota: "Webhook recibido. Persistencia y envio real se activan al conectar Neon y tokens de Meta."
  });
}
