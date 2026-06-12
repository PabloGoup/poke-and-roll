import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const alcanceLocal = session.user.rol === "super_admin"
      ? {}
      : { localId: session.user.localId ?? "__sin_local__" };

    const [totalHoy, ventasHoy, casosHumano, contenidoPendiente, porCanal] = await Promise.all([
      prisma.conversacion.count({ where: { ...alcanceLocal, creadoEn: { gte: hoy } } }),
      prisma.decisionAgente.count({
        where: {
          intencion: "venta",
          creadoEn: { gte: hoy },
          ...(session.user.rol === "super_admin"
            ? {}
            : { conversacion: { localId: session.user.localId ?? "__sin_local__" } })
        }
      }),
      prisma.conversacion.count({
        where: { ...alcanceLocal, requiereHumano: true, estado: "esperando_humano" }
      }),
      prisma.contenido.count({ where: { estado: { in: ["programado", "aprobado"] } } }),
      prisma.conversacion.groupBy({
        by: ["canal"],
        _count: { canal: true },
        where: { ...alcanceLocal, creadoEn: { gte: hoy } }
      })
    ]);

    const canalMap = Object.fromEntries(
      porCanal.map((r) => [r.canal, r._count.canal])
    );

    return NextResponse.json({
      ok: true,
      metricas: {
        totalHoy,
        ventasHoy,
        casosHumano,
        contenidoPendiente,
        porCanal: {
          whatsapp: canalMap.whatsapp ?? 0,
          instagram: canalMap.instagram ?? 0,
          facebook: canalMap.facebook ?? 0
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error al obtener metricas" },
      { status: 500 }
    );
  }
}
