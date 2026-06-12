import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-security";

function estaConfigurada(nombre: string) {
  return Boolean(process.env[nombre]?.trim());
}

export async function GET() {
  const { response } = await requireApiUser();
  if (response) return response;

  let baseDatos = {
    configurada: estaConfigurada("DATABASE_URL"),
    conectada: false,
    error: null as string | null
  };

  if (baseDatos.configurada) {
    try {
      await prisma.$queryRawUnsafe("select 1 as ok");
      baseDatos = { ...baseDatos, conectada: true };
    } catch {
      baseDatos = {
        ...baseDatos,
        error: "No se pudo conectar a la base de datos"
      };
    }
  }

  return NextResponse.json({
    ok: baseDatos.conectada,
    servicio: "poke-and-roll-agente",
    baseDatos,
    integraciones: {
      openai: estaConfigurada("GEMINI_API_KEY") || estaConfigurada("GROQ_API_KEY") || estaConfigurada("OPENAI_API_KEY"),
      metaApp: estaConfigurada("META_APP_ID") && estaConfigurada("META_APP_SECRET"),
      metaToken: estaConfigurada("META_ACCESS_TOKEN"),
      instagram: estaConfigurada("INSTAGRAM_BUSINESS_ACCOUNT_ID"),
      whatsapp:
        estaConfigurada("WHATSAPP_ACCESS_TOKEN") &&
        estaConfigurada("WHATSAPP_PHONE_NUMBER_ID") &&
        estaConfigurada("WHATSAPP_BUSINESS_ACCOUNT_ID"),
      facebook:
        estaConfigurada("FACEBOOK_PAGE_ID") &&
        estaConfigurada("FACEBOOK_PAGE_ACCESS_TOKEN"),
      alertas: estaConfigurada("ALERT_PHONE_NUMBER")
    }
  });
}
