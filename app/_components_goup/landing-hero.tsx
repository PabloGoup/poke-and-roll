"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export function LandingHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".goup-animate-in", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "all"
      });

      // Aurora del hero respira lentamente
      gsap.to(".goup-hero-aurora", {
        opacity: 0.85,
        scale: 1.06,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="goup-hero goup-landing-section" ref={rootRef} id="inicio">
      <div className="goup-hero-aurora" aria-hidden="true" />
      <div className="goup-hero-scrim" aria-hidden="true" />

      <div className="goup-hero-center">
        <div className="goup-hero-badge goup-animate-in">
          <span className="goup-badge-dot" />
          Empleados digitales impulsados por IA · 24/7
        </div>

        <h1 className="goup-hero-title goup-hero-title-xl goup-animate-in">
          Tu negocio no necesita más personal.
          <span className="goup-title-gradient"> Necesita inteligencia artificial.</span>
        </h1>

        <p className="goup-hero-description goup-hero-description-center goup-animate-in">
          Automatizamos ventas, atención al cliente, reservas y operaciones con
          agentes IA entrenados específicamente para tu negocio.
        </p>

        <div className="goup-hero-actions goup-hero-actions-center goup-animate-in">
          <a href="#demo" className="goup-btn-hero-primary">
            <Sparkles size={16} />
            Probar IA en vivo
          </a>
          <a href="#gemelo" className="goup-btn-hero-secondary">
            Ver demostración
            <ArrowRight size={15} />
          </a>
        </div>

        <div className="goup-hero-proof goup-hero-proof-center goup-animate-in">
          <div>
            <strong>24/7</strong>
            <span>atención sin pausas ni turnos</span>
          </div>
          <div>
            <strong>&lt; 5 seg</strong>
            <span>tiempo de respuesta promedio</span>
          </div>
          <div>
            <strong>WhatsApp + Instagram</strong>
            <span>integración oficial con Meta</span>
          </div>
        </div>
      </div>

      <a href="#demo" className="goup-hero-scrollcue goup-animate-in" aria-label="Bajar a la demo">
        <span className="goup-scrollcue-track"><span className="goup-scrollcue-dot" /></span>
        Desliza para ver la IA trabajando
      </a>
    </section>
  );
}
