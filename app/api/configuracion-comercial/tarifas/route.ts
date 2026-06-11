import { NextResponse } from "next/server";
import { z } from "zod";
import { geocodificarDireccion } from "@/lib/geocodificacion";
import { guardarTarifasDespacho, obtenerConfiguracionComercial } from "@/lib/configuracion-comercial";

const tarifaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  distanciaMinKm: z.number().min(0),
  distanciaMaxKm: z.number().min(0),
  costoPesos: z.number().min(0),
  tiempoMinMin: z.number().min(0),
  tiempoMaxMin: z.number().min(0),
  activa: z.boolean()
});

const restauranteSchema = z.object({
  direccion: z.string(),
  latitud: z.number().nullable().optional(),
  longitud: z.number().nullable().optional()
});

const bodySchema = z.object({
  tarifas: z.array(tarifaSchema),
  restaurante: restauranteSchema
});

export async function GET() {
  try {
    const config = await obtenerConfiguracionComercial();
    const tarifas = config.tarifas.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      distanciaMinKm: t.distanciaMinKm ?? 0,
      distanciaMaxKm: t.distanciaMaxKm ?? 0,
      costoPesos: t.costo,
      tiempoMinMin: t.tiempoEstimadoMin,
      tiempoMaxMin: t.tiempoEstimadoMax,
      activa: t.activa
    }));
    return NextResponse.json({ ok: true, tarifas, restaurante: config.restaurante ?? null });
  } catch (err) {
    console.error("[tarifas GET]", err);
    return NextResponse.json({ ok: false, error: "Error obteniendo tarifas" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
    }

    const { tarifas, restaurante } = parsed.data;
    let restauranteConCoords = { ...restaurante };

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey && restaurante.direccion.trim()) {
      const coords = await geocodificarDireccion(restaurante.direccion, apiKey);
      if (coords) {
        restauranteConCoords = { ...restaurante, latitud: coords.lat, longitud: coords.lng };
      }
    }

    await guardarTarifasDespacho(tarifas, restauranteConCoords);

    return NextResponse.json({ ok: true, restaurante: restauranteConCoords });
  } catch (err) {
    console.error("[tarifas PUT]", err);
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Error guardando tarifas"
    }, { status: 500 });
  }
}
