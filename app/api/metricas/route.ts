import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [totalHoy, ventasHoy, casosHumano, contenidoPendiente, porCanal] = await Promise.all([
      prisma.conversacion.count({ where: { creadoEn: { gte: hoy } } }),
      prisma.decisionAgente.count({ where: { intencion: "venta", creadoEn: { gte: hoy } } }),
      prisma.conversacion.count({ where: { requiereHumano: true, estado: "esperando_humano" } }),
      prisma.contenido.count({ where: { estado: { in: ["programado", "aprobado"] } } }),
      prisma.conversacion.groupBy({
        by: ["canal"],
        _count: { canal: true },
        where: { creadoEn: { gte: hoy } }
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
