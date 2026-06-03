import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Conectar Instagram — Goup Soluciones",
};

export default async function InstagramOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding/instagram");

  if (session.user.localId) {
    redirect("/api/meta/connect");
  }

  if (session.user.rol !== "super_admin") {
    redirect("/dashboard?vista=instagram");
  }

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
        <span>Onboarding Meta</span>
        <h1>Conectar Instagram por local</h1>
        <p>
          Selecciona el negocio que quieres vincular. La autorización se guarda en ese local y no se mezcla con otros clientes del SaaS.
        </p>
      </section>

      <section className="goup-local-grid">
        {locales.map((local) => (
          <article className="goup-local-card" key={local.id}>
            <div>
              <span className="goup-local-status">
                {local.igPageId ? "Instagram conectado" : local.activo ? "Pendiente de conexión" : "Local inactivo"}
              </span>
              <h2>{local.nombre}</h2>
              <p>{local.slug}</p>
            </div>

            <div className="goup-local-meta">
              <span>IG: {local.igPageId ? "listo" : "sin conectar"}</span>
              <span>FB: {local.fbPageId ? "listo" : "sin conectar"}</span>
            </div>

            <Link className="goup-local-action" href={`/api/meta/connect?localId=${local.id}`}>
              {local.igPageId ? "Reconectar Instagram" : "Conectar Instagram"}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
