import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/app/dashboard-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminLocalPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.rol !== "super_admin") redirect("/dashboard");

  const { slug } = await params;

  const local = await prisma.local.findUnique({
    where: { slug },
    select: { id: true, nombre: true, slug: true, activo: true }
  });

  if (!local) notFound();

  return (
    <DashboardClient
      localNombre={local.nombre}
      localSlug={local.slug}
      rol="super_admin"
    />
  );
}
