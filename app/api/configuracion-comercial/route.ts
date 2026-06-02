import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerConfiguracionComercial } from "@/lib/configuracion-comercial";

const reglaSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  activa: z.boolean(),
  prioridad: z.enum(["alta", "media", "baja"]),
  canal: z.enum(["todos", "whatsapp", "instagram", "facebook"])
});

const itemSchema = z.object({
  id: z.string().optional(),
  tipo: z.enum(["menu", "promocion"]),
  nombre: z.string().min(1),
  detalle: z.string().default(""),
  precioTexto: z.string().nullable().optional(),
  activo: z.boolean()
});

const imagenSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  url: z.string().min(1),
  storagePath: z.string().nullable().optional(),
  tipo: z.enum(["catalogo", "promocion", "roll_dia", "menu_dia"]),
  prioridadEnvio: z.boolean(),
  activo: z.boolean()
});

const configSchema = z.object({
  reglas: z.array(reglaSchema),
  items: z.array(itemSchema),
  imagenes: z.array(imagenSchema)
});

export async function GET() {
  const config = await obtenerConfiguracionComercial();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = configSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Payload invalido", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { reglas, items, imagenes } = parsed.data;

  await prisma.$transaction(async (tx) => {
    for (const regla of reglas) {
      await tx.reglaComercialAgente.upsert({
        where: { id: regla.id },
        create: regla,
        update: regla
      });
    }

    await tx.itemComercialDestacado.deleteMany({});
    if (items.length > 0) {
      await tx.itemComercialDestacado.createMany({
        data: items.map((item) => ({
          id: item.id,
          tipo: item.tipo,
          nombre: item.nombre,
          detalle: item.detalle,
          precioTexto: item.precioTexto,
          activo: item.activo
        }))
      });
    }

    await tx.catalogoVisualAgente.updateMany({ data: { prioridadEnvio: false, activo: false } });
    for (const imagen of imagenes) {
      await tx.catalogoVisualAgente.upsert({
        where: { id: imagen.id ?? "" },
        create: {
          id: imagen.id,
          nombre: imagen.nombre,
          url: imagen.url,
          storagePath: imagen.storagePath,
          tipo: imagen.tipo,
          prioridadEnvio: imagen.prioridadEnvio,
          activo: imagen.activo
        },
        update: {
          nombre: imagen.nombre,
          url: imagen.url,
          storagePath: imagen.storagePath,
          tipo: imagen.tipo,
          prioridadEnvio: imagen.prioridadEnvio,
          activo: imagen.activo
        }
      });
    }
  });

  const config = await obtenerConfiguracionComercial();
  return NextResponse.json({ ok: true, config });
}
