import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-security";

const alertaSchema = z.object({
  tipo: z.string().min(1),
  mensaje: z.string().min(1),
  cliente: z.string().optional(),
  conversacionId: z.string().optional()
});

export async function POST(request: Request) {
  const { response: authResponse } = await requireApiUser();
  if (authResponse) return authResponse;

  const body = await request.json().catch(() => null);
  const parsed = alertaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Payload invalido", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const n8nUrl = process.env.N8N_WEBHOOK_ALERTAS_URL;

  if (!n8nUrl) {
    return NextResponse.json({
      ok: true,
      modo: "simulado",
      alerta: parsed.data,
      nota: "Configura N8N_WEBHOOK_ALERTAS_URL para enviar alertas reales."
    });
  }

  const response = await fetch(n8nUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data)
  });

  return NextResponse.json({
    ok: response.ok,
    status: response.status
  });
}
