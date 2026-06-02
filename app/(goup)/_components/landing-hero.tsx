import Image from "next/image";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="goup-hero">
      <div className="goup-hero-noise" aria-hidden="true" />

      <div className="goup-hero-content">
        <div className="goup-hero-badge">
          <span className="goup-badge-dot" />
          IA para negocios en Chile
        </div>

        <div className="goup-hero-logo">
          <Image
            src="/images/goup.png"
            alt="Goup Soluciones"
            width={200}
            height={68}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        <h1 className="goup-hero-title">
          Tu negocio,<br />
          <span className="goup-hero-title-accent">siempre activo.</span>
        </h1>

        <p className="goup-hero-description">
          Automatiza tu atención al cliente en WhatsApp, Instagram y Facebook.
          Responde al instante, sin perder ventas, sin perder tiempo.
        </p>

        <div className="goup-hero-actions">
          <Link href="/login" className="goup-btn-hero-primary">
            Ir a mi plataforma
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a href="#features" className="goup-btn-hero-secondary">
            Ver funciones
          </a>
        </div>

        <div className="goup-hero-stats">
          <div className="goup-stat">
            <span className="goup-stat-number">3</span>
            <span className="goup-stat-label">Canales</span>
          </div>
          <div className="goup-stat-divider" />
          <div className="goup-stat">
            <span className="goup-stat-number">24/7</span>
            <span className="goup-stat-label">Disponible</span>
          </div>
          <div className="goup-stat-divider" />
          <div className="goup-stat">
            <span className="goup-stat-number">IA</span>
            <span className="goup-stat-label">Powered</span>
          </div>
        </div>
      </div>

      <div className="goup-hero-gradient" aria-hidden="true" />
    </section>
  );
}
