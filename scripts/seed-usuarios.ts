/**
 * Crea los usuarios iniciales del sistema Goup.
 * Uso: npx tsx scripts/seed-usuarios.ts
 */

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const usuarios = [
  {
    email:   "admin@goup.cl",
    password: "goup2024",
    nombre:  "Admin Goup",
    rol:     "super_admin" as const,
    localSlug: null,
  },
  {
    email:    "admin@pokeyroll.cl",
    password: "poke2024",
    nombre:   "Admin Poke & Roll",
    rol:      "admin_local" as const,
    localSlug: "poke-and-roll",
  },
];

async function main() {
  for (const u of usuarios) {
    const passwordHash = await hash(u.password, 12);

    const local = u.localSlug
      ? await prisma.local.findUnique({ where: { slug: u.localSlug } })
      : null;

    await prisma.usuario.upsert({
      where:  { email: u.email },
      create: {
        email: u.email,
        passwordHash,
        nombre: u.nombre,
        rol:    u.rol,
        activo: true,
        ...(local ? { localId: local.id } : {}),
      },
      update: {
        passwordHash,
        nombre: u.nombre,
        rol:    u.rol,
        activo: true,
        ...(local ? { localId: local.id } : {}),
      },
    });

    console.log(`✓ ${u.email}  [${u.rol}]${local ? `  → ${local.nombre}` : "  → todos los locales"}`);
  }

  await prisma.$disconnect();
  console.log("\nUsuarios iniciales creados correctamente.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
