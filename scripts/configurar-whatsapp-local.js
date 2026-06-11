/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Configura credenciales WhatsApp por local sin imprimir secretos.
 *
 * Uso:
 * LOCAL_SLUG="poke-and-roll" \
 * WA_PHONE_ID="<phone_number_id>" \
 * WA_TOKEN="<whatsapp_access_token>" \
 * node scripts/configurar-whatsapp-local.js
 */

const fs = require("fs");

function cargarEnvSiExiste(path) {
  if (!fs.existsSync(path)) return;

  const contenido = fs.readFileSync(path, "utf8");
  for (const linea of contenido.split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;

    const indice = limpia.indexOf("=");
    if (indice === -1) continue;

    const key = limpia.slice(0, indice).trim();
    let value = limpia.slice(indice + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

cargarEnvSiExiste(".env.local");
cargarEnvSiExiste(".env");

const { PrismaClient } = require("@prisma/client");

const localSlug = (process.env.LOCAL_SLUG || "poke-and-roll").trim();
const waPhoneId = (process.env.WA_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
const waToken = (process.env.WA_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || "").trim();

function fallar(mensaje) {
  console.error(mensaje);
  process.exit(1);
}

if (!waPhoneId) {
  fallar("Falta WA_PHONE_ID o WHATSAPP_PHONE_NUMBER_ID.");
}

if (!waToken) {
  fallar("Falta WA_TOKEN o WHATSAPP_ACCESS_TOKEN.");
}

const prisma = new PrismaClient();

async function main() {
  const local = await prisma.local.findUnique({
    where: { slug: localSlug },
    select: { id: true, nombre: true, slug: true },
  });

  if (!local) {
    fallar(`No existe un local con slug "${localSlug}".`);
  }

  const actualizado = await prisma.local.update({
    where: { id: local.id },
    data: {
      waPhoneId,
      waToken,
    },
    select: {
      nombre: true,
      slug: true,
      waPhoneId: true,
      waToken: true,
    },
  });

  console.log(JSON.stringify({
    ok: true,
    local: actualizado.nombre,
    slug: actualizado.slug,
    waPhoneIdConfigurado: Boolean(actualizado.waPhoneId),
    waTokenConfigurado: Boolean(actualizado.waToken),
  }, null, 2));
}

main()
  .catch((error) => {
    if (error?.code === "P2002") {
      fallar("El WA_PHONE_ID ya está asociado a otro local.");
    }

    fallar(error instanceof Error ? error.message : String(error));
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
