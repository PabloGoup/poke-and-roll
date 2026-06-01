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
  const messaging = payload?.entry?.[0]?.messaging?.[0];
  const texto = messaging?.message?.text;

  if (!texto) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const cliente = messaging?.sender?.id ?? "cliente_instagram";
  const decision = redactarRespuestaBase({
    canal: "instagram",
    cliente,
    texto
  });

  return NextResponse.json({
    ok: true,
    canal: "instagram",
    cliente,
    decision,
    nota: "Webhook recibido. Persistencia y envio real se activan al conectar Neon y tokens de Meta."
  });
}
