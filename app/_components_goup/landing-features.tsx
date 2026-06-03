"use client";

import React from "react";
import { Bot, ChartNoAxesCombined, ClipboardList, DatabaseZap, MessagesSquare, ShieldAlert, Workflow } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: MessagesSquare,
    title: "Bandeja omnicanal",
    description: "Centraliza WhatsApp, Instagram y Facebook para que el equipo vea conversaciones, intención, estado y prioridad."
  },
  {
    icon: DatabaseZap,
    title: "Catálogo conectado",
    description: "El agente responde usando productos, precios, promociones, reglas comerciales y catálogo visual o PDF completo."
  },
  {
    icon: ShieldAlert,
    title: "Escalamiento seguro",
    description: "Reclamos, datos incompletos, cancelaciones y casos sensibles pasan a humano con trazabilidad."
  },
  {
    icon: ChartNoAxesCombined,
    title: "Métricas operativas",
    description: "Mide canales activos, respuestas IA, casos urgentes, contenido pendiente y salud de integraciones."
  }
];

const workflow = [
  ["01", "Recibe", "El mensaje entra desde Meta por canales oficiales."],
  ["02", "Clasifica", "La IA detecta venta, consulta, reclamo o pedido sensible."],
  ["03", "Responde", "Usa catálogo y reglas vigentes para sugerir una respuesta útil."],
  ["04", "Controla", "Escala a humano cuando corresponde y registra la decisión."]
];

const integrationGroups = [
  {
    id: "channels",
    label: "Canales Meta",
    sublabel: "Mensajería oficial",
    accent: "#1877F2",
    items: [
      { name: "WhatsApp",  src: "https://cdn.simpleicons.org/whatsapp/25D366"  },
      { name: "Instagram", src: "https://cdn.simpleicons.org/instagram/E4405F" },
      { name: "Facebook",  src: "https://cdn.simpleicons.org/facebook/1877F2"  },
      { name: "Meta",      src: "https://cdn.simpleicons.org/meta/0866FF"      },
    ],
  },
  {
    id: "ai",
    label: "Modelos IA",
    sublabel: "Razonamiento y respuesta",
    accent: "#8E75B7",
    items: [
      { name: "Gemini",    src: "https://cdn.simpleicons.org/googlegemini/8E75B7" },
      { name: "Claude",    src: "https://cdn.simpleicons.org/anthropic/D4A27F"    },
      { name: "OpenAI",    src: "https://cdn.simpleicons.org/openai/ffffff"        },
    ],
  },
  {
    id: "infra",
    label: "Stack técnico",
    sublabel: "Datos, deploy y control",
    accent: "#3FCF8E",
    items: [
      { name: "Supabase", src: "https://cdn.simpleicons.org/supabase/3FCF8E"   },
      { name: "Prisma",   src: "https://cdn.simpleicons.org/prisma/ffffff"     },
      { name: "Vercel",   src: "https://cdn.simpleicons.org/vercel/ffffff"     },
      { name: "GitHub",   src: "https://cdn.simpleicons.org/github/ffffff"     },
    ],
  },
];

export function LandingFeatures() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {

      // ── Ecosystem: section copy ──
      gsap.from(".goup-ecosystem-copy > *", {
        scrollTrigger: { trigger: ".goup-ecosystem", start: "top 78%" },
        y: 22,
        opacity: 0,
        duration: 0.72,
        stagger: 0.1,
        ease: "power3.out"
      });

      // ── Ecosystem: integration groups stagger in ──
      gsap.from(".goup-integration-group", {
        scrollTrigger: { trigger: ".goup-ecosystem-visual", start: "top 82%" },
        y: 28,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      });

      // ── Ecosystem: tiles pop in ──
      gsap.from(".goup-integration-tile", {
        scrollTrigger: { trigger: ".goup-ecosystem-visual", start: "top 78%" },
        scale: 0.88,
        opacity: 0,
        duration: 0.42,
        stagger: 0.04,
        delay: 0.18,
        ease: "back.out(1.8)"
      });

      // ── Ecosystem: center hub pops in ──
      gsap.fromTo(".goup-ecosystem-hub",
        { scale: 0.5, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.7,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ".goup-ecosystem-visual", start: "top 76%" },
          onComplete: () => {
            gsap.to(".goup-ecosystem-hub", {
              scale: 1.03, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut"
            });
          }
        }
      );

      // ── Features: section headers ──
      gsap.from(".goup-reveal", {
        scrollTrigger: { trigger: ".goup-features", start: "top 74%" },
        y: 24,
        opacity: 0,
        duration: 0.68,
        stagger: 0.08,
        ease: "power3.out"
      });

      // ── Features: cards with scale + clip reveal ──
      gsap.from(".goup-feature-card", {
        scrollTrigger: { trigger: ".goup-features-grid", start: "top 80%" },
        y: 36,
        opacity: 0,
        scale: 0.95,
        duration: 0.65,
        stagger: 0.09,
        ease: "power3.out"
      });

      // ── Workflow: steps stagger ──
      gsap.from(".goup-flow-step", {
        scrollTrigger: { trigger: ".goup-workflow", start: "top 74%" },
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out"
      });

      // ── Control: panel parallax ──
      gsap.to(".goup-control-panel", {
        scrollTrigger: {
          trigger: ".goup-control",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8
        },
        y: -34,
        ease: "none"
      });

      // ── Control: rows slide in from right ──
      gsap.from(".goup-control-row", {
        scrollTrigger: { trigger: ".goup-control", start: "top 76%" },
        x: 28,
        opacity: 0,
        duration: 0.55,
        stagger: 0.11,
        ease: "power3.out"
      });

      // ── Control: cycle active state to show it's live ──
      const rows = root.querySelectorAll<HTMLElement>(".goup-control-row");
      if (rows.length) {
        let activeIdx = 0;
        const cycleTl = gsap.timeline({
          scrollTrigger: { trigger: ".goup-control", start: "top 60%" },
          delay: 1.2,
          repeat: -1,
          repeatDelay: 0
        });

        rows.forEach((_, i) => {
          const nextIdx = (i + 1) % rows.length;
          cycleTl
            .to({}, { duration: 2.2 })
            .call(() => {
              rows[activeIdx].classList.remove("active");
              activeIdx = nextIdx;
              rows[activeIdx].classList.add("active");
            });
        });
      }

    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="goup-info" ref={rootRef}>

      {/* ── Ecosystem: integration hub ── */}
      <section className="goup-ecosystem">
        <div className="goup-ecosystem-copy">
          <span>Integraciones</span>
          <h2>Conectado al stack que ya usas.</h2>
          <p>Canales oficiales de Meta, modelos de IA de última generación y tu infraestructura de datos en una sola plataforma operativa.</p>
          <ul className="goup-ecosystem-bullets">
            <li>Mensajería vía API oficial de Meta — sin intermediarios</li>
            <li>Modelos con instrucciones, temperatura y reglas propias</li>
            <li>Stack propio: sin vendor lock-in en datos ni lógica</li>
          </ul>
        </div>

        <div className="goup-ecosystem-visual" aria-label="Stack tecnológico Goup">
          {/* Center hub */}
          <div className="goup-ecosystem-hub" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/goup.png" alt="" width={88} height={28} />
          </div>

          {integrationGroups.map((group) => (
            <div
              key={group.id}
              className="goup-integration-group"
              style={{ "--group-accent": group.accent } as React.CSSProperties}
            >
              <div className="goup-integration-label">
                <span className="goup-integration-dot" />
                <strong>{group.label}</strong>
                <span>{group.sublabel}</span>
              </div>
              <div className="goup-integration-tiles">
                {group.items.map((item) => (
                  <div className="goup-integration-tile" key={item.name} title={item.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={item.name} width={28} height={28} loading="lazy" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product features ── */}
      <section className="goup-features goup-landing-section" id="features">
        <div className="goup-section-kicker goup-reveal">Producto</div>
        <div className="goup-section-heading goup-reveal">
          <h2>Un sistema de atención diseñado para vender sin perder control.</h2>
          <p>
            La plataforma combina IA, catálogo, reglas de negocio y supervisión humana para que la operación comercial responda rápido sin prometer datos falsos.
          </p>
        </div>

        <div className="goup-features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="goup-feature-card" key={feature.title}>
                <div className="goup-feature-icon">
                  <Icon size={20} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Operational workflow ── */}
      <section className="goup-workflow goup-landing-section" id="workflow">
        <div className="goup-workflow-copy">
          <span>Flujo operativo</span>
          <h2>Del mensaje entrante a una respuesta lista para enviar.</h2>
        </div>
        <div className="goup-flow-grid">
          {workflow.map(([number, title, description]) => (
            <article className="goup-flow-step" key={number}>
              <strong>{number}</strong>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Commercial control ── */}
      <section className="goup-control goup-landing-section" id="control">
        <div className="goup-control-copy">
          <span>Control comercial</span>
          <h2>Edita promociones, catálogo visual y criterios del agente.</h2>
          <p>
            Configura promociones del día, productos destacados, catálogo PDF, imágenes prioritarias y reglas de respuesta sin tocar el prompt base.
          </p>
        </div>

        <div className="goup-control-panel">
          <div className="goup-control-row active">
            <ClipboardList size={16} />
            <div>
              <strong>Catálogo completo</strong>
              <span>PDF o imagen enviada como primera opción</span>
            </div>
          </div>
          <div className="goup-control-row">
            <Bot size={16} />
            <div>
              <strong>Reglas del agente</strong>
              <span>Promos, roll del día, extras y escalamiento</span>
            </div>
          </div>
          <div className="goup-control-row">
            <Workflow size={16} />
            <div>
              <strong>Auditoría de decisiones</strong>
              <span>Respuesta, intención y seguridad registradas</span>
            </div>
          </div>
        </div>
      </section>

    </section>
  );
}
