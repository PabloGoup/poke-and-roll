import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function estaConfigurada(nombre: string) {
  return Boolean(process.env[nombre]?.trim());
}

export async function GET() {
  let baseDatos = {
    configurada: estaConfigurada("DATABASE_URL"),
    conectada: false,
    error: null as string | null
  };

  if (baseDatos.configurada) {
    try {
      await prisma.$queryRawUnsafe("select 1 as ok");
      baseDatos = { ...baseDatos, conectada: true };
    } catch (error) {
      baseDatos = {
        ...baseDatos,
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }

  return NextResponse.json({
    ok: baseDatos.conectada,
    servicio: "poke-and-roll-agente",
    baseDatos,
    integraciones: {
      openai: estaConfigurada("OPENAI_API_KEY"),
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
      n8n: estaConfigurada("N8N_WEBHOOK_ALERTAS_URL")
    }
  });
}
