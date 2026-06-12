import { NextResponse } from "next/server";
import { Canal } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const canalParam = searchParams.get("canal");
  const limite = Math.min(parseInt(searchParams.get("limite") ?? "30"), 50);

  const canalValido = canalParam && Object.values(Canal).includes(canalParam as Canal)
    ? (canalParam as Canal)
    : undefined;
  const localId = session.user.localId;
  const where = {
    ...(canalValido ? { canal: canalValido } : {}),
    ...(session.user.rol !== "super_admin" ? { localId: localId ?? "__sin_local__" } : {})
  };

  try {
    const conversacionesRaw = await prisma.conversacion.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true, whatsappId: true, instagramId: true, facebookId: true } },
        mensajes: { orderBy: { creadoEn: "desc" }, take: 80 },
        decisiones: { orderBy: { creadoEn: "desc" }, take: 1 }
      },
      orderBy: { actualizadoEn: "desc" },
      take: limite * 8
    });

    // IDs de cuentas propias del negocio — no deben aparecer como clientes
    // Usa ig_page_id / fb_page_id de la DB como fuente principal (más fiable que env vars)
    const locales = await prisma.local.findMany({
      where: session.user.rol === "super_admin" ? undefined : { id: localId ?? "__sin_local__" },
      select: { igPageId: true, fbPageId: true }
    });
    const idsNegocio = new Set([
      ...locales.map((l) => l.igPageId),
      ...locales.map((l) => l.fbPageId),
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
      process.env.FACEBOOK_PAGE_ID,
    ].filter(Boolean) as string[]);

    const grupos = new Map<string, typeof conversacionesRaw>();

    for (const conversacion of conversacionesRaw) {
      const igId = conversacion.cliente.instagramId;
      const fbId = conversacion.cliente.facebookId;
      if ((igId && idsNegocio.has(igId)) || (fbId && idsNegocio.has(fbId))) continue;
      const key = [conversacion.canal, conversacion.clienteId].join(":");
      const grupo = grupos.get(key) ?? [];
      grupo.push(conversacion);
      grupos.set(key, grupo);
    }

    const conversaciones = Array.from(grupos.values())
      .map((grupo) => {
        const ordenadas = [...grupo].sort(
          (a, b) => b.actualizadoEn.getTime() - a.actualizadoEn.getTime()
        );
        const base = ordenadas[0];
        const mensajes = grupo
          .flatMap((conversacion) => conversacion.mensajes)
          .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime())
          .slice(-120);
        const decisiones = grupo
          .flatMap((conversacion) => conversacion.decisiones)
          .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())
          .slice(0, 1);

        return {
          ...base,
          estado: base.estado,
          requiereHumano: base.requiereHumano,
          ultimaIntencion:
            ordenadas.find((conversacion) => conversacion.ultimaIntencion)?.ultimaIntencion ??
            base.ultimaIntencion,
          mensajes,
          decisiones
        };
      })
      .sort((a, b) => b.actualizadoEn.getTime() - a.actualizadoEn.getTime())
      .slice(0, limite);

    return NextResponse.json({ ok: true, conversaciones });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error al obtener conversaciones" },
      { status: 500 }
    );
  }
}
