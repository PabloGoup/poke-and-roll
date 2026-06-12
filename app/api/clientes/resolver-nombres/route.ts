import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolverNombreMetaCliente } from "@/lib/db-helpers";
import { auth } from "@/auth";

// POST /api/clientes/resolver-nombres
// Resuelve nombres para clientes de IG/FB que aún no tienen nombre guardado
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const localId = session.user.localId;
  if (session.user.rol !== "super_admin" && !localId) {
    return NextResponse.json({ ok: false, error: "Usuario sin local asignado" }, { status: 403 });
  }

  const local = await prisma.local.findFirst({
    where: localId ? { id: localId } : undefined,
    select: { fbToken: true, igToken: true }
  });

  const token = local?.fbToken ?? local?.igToken ?? null;
  if (!token) return NextResponse.json({ ok: false, error: "Sin token Meta" }, { status: 400 });

  const sinNombre = await prisma.cliente.findMany({
    where: {
      ...(localId ? { localId } : {}),
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
