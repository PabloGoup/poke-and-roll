"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const successBrands = [
  {
    name: "Sushi Poke & Roll",
    logo: "/images/Poke_n_Roll.png",
    width: 100,
    height: 100,
    metric: "+42%",
    metricLabel: "pedidos vía WhatsApp",
    result: "100% de pedidos gestionados por el agente sin operadores adicionales."
  },
  {
    name: "EntreAmigos Gourmet",
    logo: "/casos-exito/entreamigos-gourmet.png",
    width: 150,
    height: 80,
    metric: "3×",
    metricLabel: "más pedidos confirmados",
    result: "Triplicaron pedidos confirmados sin sumar personal al equipo de atención."
  },
  {
    name: "A la Romana Pizzería",
    logo: "/casos-exito/a-la-romana-pizzeria.png",
    width: 150,
    height: 80,
    metric: "−65%",
    metricLabel: "tiempo de respuesta",
    result: "Pasaron de 12 min promedio por consulta a respuesta inmediata 24/7."
  },
  {
    name: "Fu-zion Restobar",
    logo: "/casos-exito/fu-zion-restobar.png",
    width: 150,
    height: 80,
    metric: "0",
    metricLabel: "pedidos perdidos en noche",
    result: "El agente cubre el horario nocturno y fines de semana sin supervisión humana."
  },
  {
    name: "ChorriBurgers",
    logo: "/casos-exito/chorriburgers.png",
    width: 150,
    height: 80,
    metric: "+38%",
    metricLabel: "ticket promedio",
    result: "El agente sugiere combos y promociones activas en cada conversación de venta."
  }
];

export function SuccessCases() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.from(".goup-success-title", {
        scrollTrigger: { trigger: root, start: "top 78%" },
        y: 16,
        opacity: 0,
        duration: 0.68,
        ease: "power3.out"
      });

      gsap.from(".goup-success-card", {
        scrollTrigger: { trigger: ".goup-success-cards", start: "top 82%" },
        y: 28,
        opacity: 0,
        scale: 0.96,
        duration: 0.62,
        stagger: 0.09,
        ease: "power3.out"
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="goup-success goup-landing-section" id="casos" ref={rootRef}>
      <p className="goup-success-title">Locales que ya operan con agentes Goup</p>

      <div className="goup-success-cards" aria-label="Casos de éxito">
        {successBrands.map((brand) => (
          <article className="goup-success-card" key={brand.name}>
            <div className="goup-success-card-logo">
              <Image
                alt={brand.name}
                height={brand.height}
                src={brand.logo}
                width={brand.width}
                sizes="120px"
              />
            </div>
            <div className="goup-success-card-info">
              <div className="goup-success-card-metric">
                <strong>{brand.metric}</strong>
                <span>{brand.metricLabel}</span>
              </div>
              <p className="goup-success-card-result">{brand.result}</p>
              <footer className="goup-success-card-name">{brand.name}</footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
