import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  return NextResponse.json({
    ok: true,
    recibido: payload,
    nota: "Endpoint reservado para callbacks de n8n."
  });
}
