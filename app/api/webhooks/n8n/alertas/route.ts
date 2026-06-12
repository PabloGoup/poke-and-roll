import { NextResponse } from "next/server";
import { secretMatches } from "@/lib/api-security";

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-webhook-secret"), process.env.N8N_CALLBACK_SECRET)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    recibido: true
  });
}
