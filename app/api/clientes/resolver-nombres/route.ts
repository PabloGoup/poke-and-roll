import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolverNombreMetaCliente } from "@/lib/db-helpers";

// POST /api/clientes/resolver-nombres
// Resuelve nombres para clientes de IG/FB que aún no tienen nombre guardado
export async function POST() {
  const local = await prisma.local.findFirst({
    select: { fbToken: true, igToken: true }
  });

  const token = local?.fbToken ?? local?.igToken ?? process.env.META_ACCESS_TOKEN ?? null;
  if (!token) return NextResponse.json({ ok: false, error: "Sin token Meta" }, { status: 400 });

  const sinNombre = await prisma.cliente.findMany({
    where: {
      nombre: null,
      OR: [{ instagramId: { not: null } }, { facebookId: { not: null } }]
    },
    take: 50
  });

  let resueltos = 0;
  for (const cliente of sinNombre) {
    if (cliente.instagramId) {
      await resolverNombreMetaCliente({ clienteId: cliente.id, userId: cliente.instagramId, token, canal: "instagram" });
      resueltos++;
    } else if (cliente.facebookId) {
      await resolverNombreMetaCliente({ clienteId: cliente.id, userId: cliente.facebookId, token, canal: "facebook" });
      resueltos++;
    }
  }

  return NextResponse.json({ ok: true, resueltos, total: sinNombre.length });
}
