import { NextResponse } from "next/server";
import { Canal } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const canalParam = searchParams.get("canal");
  const limite = Math.min(parseInt(searchParams.get("limite") ?? "30"), 50);

  const canalValido = canalParam && Object.values(Canal).includes(canalParam as Canal)
    ? (canalParam as Canal)
    : undefined;

  try {
    const conversaciones = await prisma.conversacion.findMany({
      where: canalValido ? { canal: canalValido } : undefined,
      include: {
        cliente: { select: { id: true, nombre: true, whatsappId: true, instagramId: true, facebookId: true } },
        mensajes: { orderBy: { creadoEn: "desc" }, take: 1 },
        decisiones: { orderBy: { creadoEn: "desc" }, take: 1 }
      },
      orderBy: { actualizadoEn: "desc" },
      take: limite
    });

    return NextResponse.json({ ok: true, conversaciones });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error al obtener conversaciones" },
      { status: 500 }
    );
  }
}
