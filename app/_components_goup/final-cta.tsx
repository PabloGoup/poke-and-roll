"use client";

import { ArrowRight, CalendarClock, Sparkles } from "lucide-react";

export function FinalCta() {
  return (
    <section className="goup-cta-section goup-landing-section" id="contacto">
      <div className="goup-cta-glow" aria-hidden="true" />
      <div className="goup-cta-inner">
        <span className="goup-section-kicker">El siguiente paso</span>
        <h2 className="goup-ctafinal-title">
          Si esto te impresionó, imagina lo que podemos
          <span className="goup-title-gradient"> hacer por tu negocio.</span>
        </h2>
        <p className="goup-section-sub">
          En una reunión de 30 minutos te mostramos tu agente IA funcionando con
          tus productos, tus precios y tus clientes reales.
        </p>
        <div className="goup-cta-actions">
          <a
            href="mailto:contacto@goupevents.cl?subject=Quiero%20una%20demo%20de%20Goup%20Soluciones"
            className="goup-btn-hero-primary"
          >
            <CalendarClock size={16} />
            Agendar reunión
          </a>
          <a href="#demo" className="goup-btn-hero-secondary">
            <Sparkles size={15} />
            Volver a probar la IA
            <ArrowRight size={15} />
          </a>
        </div>
        <p className="goup-cta-note">Sin compromiso · Implementación guiada · Soporte en español</p>
      </div>
    </section>
  );
}
