"use client";

import Link from "next/link";
import { Check, ArrowRight, Zap, MessageSquare, BarChart2, Shield } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mes",
    description: "Para locales que quieren automatizar su primer canal.",
    features: [
      "1 canal (WhatsApp, Instagram o Facebook)",
      "Hasta 500 conversaciones / mes",
      "Catálogo básico de productos",
      "Escalamiento a humano",
      "Dashboard de métricas básico",
    ],
    cta: "Empezar gratis 14 días",
    href: "/login",
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/mes",
    description: "Para negocios con flujo real y múltiples canales activos.",
    features: [
      "3 canales simultáneos (WA + IG + FB)",
      "Conversaciones ilimitadas",
      "Catálogo avanzado + PDF visual",
      "Reglas comerciales y promociones",
      "Métricas operativas completas",
      "Auditoría de decisiones del agente",
    ],
    cta: "Activar plan Pro",
    href: "/login",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "A consultar",
    period: "",
    description: "Para cadenas y operaciones con requerimientos personalizados.",
    features: [
      "Todo lo de Pro, sin límites",
      "Integración personalizada",
      "Soporte dedicado con SLA",
      "Onboarding asistido",
      "Multi-marca / multi-local",
      "Contrato anual con descuento",
    ],
    cta: "Hablar con ventas",
    href: "mailto:hola@goup.cl",
    popular: false,
  },
];

const ctaStats = [
  { icon: MessageSquare, value: "3 canales", label: "en una bandeja operativa" },
  { icon: Zap,           value: "24/7",      label: "respuestas automáticas" },
  { icon: BarChart2,     value: "100%",      label: "auditable y escalable" },
  { icon: Shield,        value: "0 riesgos", label: "control humano siempre" },
];

export function LandingPricing() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.from(".goup-pricing-header > *", {
        scrollTrigger: { trigger: ".goup-pricing-header", start: "top 78%" },
        y: 22,
        opacity: 0,
        duration: 0.68,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.from(".goup-pricing-card", {
        scrollTrigger: { trigger: ".goup-pricing-grid", start: "top 80%" },
        y: 32,
        opacity: 0,
        scale: 0.96,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".goup-cta-banner > *", {
        scrollTrigger: { trigger: ".goup-cta-banner", start: "top 78%" },
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="goup-pricing goup-landing-section" id="pricing" ref={rootRef}>

      {/* Header */}
      <div className="goup-pricing-header">
        <span className="goup-section-kicker">Precios</span>
        <h2 className="goup-pricing-title">
          Un plan para cada etapa de tu operación.
        </h2>
        <p className="goup-pricing-subtitle">
          Sin comisiones por venta, sin límites de agentes humanos. Solo el canal automatizado que necesitas.
        </p>
      </div>

      {/* Cards */}
      <div className="goup-pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`goup-pricing-card${plan.popular ? " goup-pricing-card--popular" : ""}`}
          >
            {plan.popular && (
              <div className="goup-pricing-badge">Más elegido</div>
            )}

            <div className="goup-pricing-card-top">
              <h3 className="goup-pricing-name">{plan.name}</h3>
              <p className="goup-pricing-desc">{plan.description}</p>
              <div className="goup-pricing-price">
                <strong>{plan.price}</strong>
                {plan.period && <span>{plan.period}</span>}
              </div>
            </div>

            <ul className="goup-pricing-features" aria-label={`Características de ${plan.name}`}>
              {plan.features.map((feat) => (
                <li key={feat}>
                  <Check size={14} aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`goup-pricing-cta${plan.popular ? " goup-pricing-cta--primary" : ""}`}
            >
              {plan.cta}
              <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="goup-cta-banner">
        <div className="goup-cta-banner-copy">
          <span className="goup-section-kicker">¿Listo?</span>
          <h2 className="goup-cta-title">Automatiza tu atención hoy.</h2>
          <p className="goup-cta-desc">
            Configura tu agente en menos de un día. Sin código, sin integración compleja, sin contratos anuales obligatorios.
          </p>
          <div className="goup-cta-actions">
            <Link href="/login" className="goup-btn-hero-primary">
              Entrar a la plataforma
              <ArrowRight size={16} />
            </Link>
            <a href="#features" className="goup-btn-hero-secondary">
              Ver cómo funciona
            </a>
          </div>
        </div>

        <ul className="goup-cta-stats" aria-label="Indicadores clave">
          {ctaStats.map(({ icon: Icon, value, label }) => (
            <li key={value} className="goup-cta-stat">
              <Icon size={18} aria-hidden="true" />
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
}
