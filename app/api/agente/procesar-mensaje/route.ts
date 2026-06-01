import { NextResponse } from "next/server";
import { mensajeEntranteSchema, redactarRespuestaBase } from "@/lib/agente";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = mensajeEntranteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Payload invalido", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const decision = redactarRespuestaBase(parsed.data);

  return NextResponse.json({
    ok: true,
    entrada: parsed.data,
    decision
  });
}
