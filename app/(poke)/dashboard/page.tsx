import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/app/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let localNombre = session.user.localNombre ?? null;
  let localSlug   = session.user.localSlug   ?? null;
  const rol       = session.user.rol         ?? null;

  // Si el JWT no trae los datos del local (sesión pre-migración),
  // los recargamos desde DB usando el id del usuario
  if (!localNombre || !localSlug) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where:   { id: session.user.id },
        include: { local: { select: { nombre: true, slug: true } } },
      });
      localNombre = usuario?.local?.nombre ?? null;
      localSlug   = usuario?.local?.slug   ?? null;
    } catch {
      // Continuar sin datos del local — AppShell usa el fallback
    }
  }

  return (
    <DashboardClient
      localNombre={localNombre}
      localSlug={localSlug}
      rol={rol}
    />
  );
}
