import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin — Goup Soluciones",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.rol !== "super_admin") redirect("/dashboard");

  const locales = await prisma.local.findMany({
    orderBy: { nombre: "asc" },
    include: {
      usuarios: {
        where: { rol: "admin_local", activo: true },
        select: { email: true, nombre: true },
        take: 1
      },
      _count: { select: { conversaciones: true } }
    }
  });

  return (
    <main className="goup-admin-page">
      <section className="goup-admin-hero">
        <span>Panel SaaS</span>
        <h1>Locales Goup</h1>
        <p>
          Gestiona conexiones Meta y accede al dashboard operativo de cada negocio.
        </p>
        <Link className="goup-admin-primary" href="/onboarding/instagram">
          + Conectar Instagram de un local
        </Link>
      </section>

      <section className="goup-local-grid">
        {locales.map((local) => (
          <article className="goup-local-card" key={local.id}>
            <div className="goup-local-card-header">
              <span className={`goup-local-status ${local.activo ? "ok" : "off"}`}>
                {local.activo ? "Activo" : "Inactivo"}
              </span>
              <h2>{local.nombre}</h2>
              <p className="goup-local-slug">{local.slug}</p>
            </div>

            <div className="goup-local-meta">
              <div>
                <span className={local.igPageId ? "meta-ok" : "meta-pending"}>
                  Instagram {local.igPageId ? "✓" : "—"}
                </span>
                <span className={local.fbPageId ? "meta-ok" : "meta-pending"}>
                  Facebook {local.fbPageId ? "✓" : "—"}
                </span>
              </div>
              <span className="goup-local-convs">
                {local._count.conversaciones} conv.
              </span>
            </div>

            {local.usuarios[0] && (
              <p className="goup-local-admin-email">
                Admin: {local.usuarios[0].email}
              </p>
            )}

            <div className="goup-local-actions">
              <Link
                className="goup-local-action-primary"
                href={`/admin/local/${local.slug}`}
              >
                Gestionar local →
              </Link>
              <Link
                className="goup-local-action-secondary"
                href={`/api/meta/connect?localId=${local.id}`}
              >
                {local.igPageId ? "Reconectar Meta" : "Conectar Meta"}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
