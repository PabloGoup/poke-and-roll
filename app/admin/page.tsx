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
    select: {
      id: true,
      nombre: true,
      slug: true,
      activo: true,
      igPageId: true,
      fbPageId: true
    }
  });

  return (
    <main className="goup-admin-page">
      <section className="goup-admin-hero">
        <span>Panel SaaS</span>
        <h1>Locales Goup</h1>
        <p>Administra las conexiones oficiales de Meta por negocio sin mezclar tokens ni conversaciones entre clientes.</p>
        <Link className="goup-admin-primary" href="/onboarding/instagram">
          Conectar Instagram de un local
        </Link>
      </section>

      <section className="goup-local-grid">
        {locales.map((local) => (
          <article className="goup-local-card" key={local.id}>
            <div>
              <span className="goup-local-status">{local.activo ? "Activo" : "Inactivo"}</span>
              <h2>{local.nombre}</h2>
              <p>{local.slug}</p>
            </div>
            <div className="goup-local-meta">
              <span>Instagram: {local.igPageId ? "conectado" : "pendiente"}</span>
              <span>Facebook: {local.fbPageId ? "conectado" : "pendiente"}</span>
            </div>
            <Link className="goup-local-action" href={`/api/meta/connect?localId=${local.id}`}>
              {local.igPageId ? "Reconectar Meta" : "Conectar Meta"}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
