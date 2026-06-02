"use client";

import { Bot, ChartNoAxesCombined, ClipboardList, DatabaseZap, MessagesSquare, ShieldAlert, Workflow } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

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

const stackLogos = [
  { name: "WhatsApp",  src: "https://cdn.simpleicons.org/whatsapp/25D366",           ring: 0, angle: -24  },
  { name: "Instagram", src: "https://cdn.simpleicons.org/instagram/E4405F",           ring: 0, angle: 142  },
  { name: "Facebook",  src: "https://cdn.simpleicons.org/facebook/0866FF",            ring: 0, angle: 238  },
  { name: "Meta",      src: "https://cdn.simpleicons.org/meta/0866FF",                ring: 1, angle: 32   },
  { name: "Supabase",  src: "https://cdn.simpleicons.org/supabase/3FCF8E",            ring: 1, angle: 126  },
  { name: "Prisma",    src: "https://cdn.simpleicons.org/prisma/ffffff",              ring: 1, angle: 220  },
  { name: "Vercel",    src: "https://cdn.simpleicons.org/vercel/ffffff",              ring: 2, angle: -8   },
  { name: "GitHub",    src: "https://cdn.simpleicons.org/github/ffffff",              ring: 2, angle: 64   },
  { name: "Gemini",    src: "https://cdn.simpleicons.org/googlegemini/8E75B7",        ring: 2, angle: 154  },
  { name: "Anthropic", src: "https://cdn.simpleicons.org/anthropic/ffffff",           ring: 2, angle: 228  },
  { name: "OpenAI",    src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg", monochrome: true, ring: 2, angle: 304 }
];

const orbitGroups = [
  { radius: 115, duration: 18 },
  { radius: 195, duration: 28 },
  { radius: 278, duration: 40 }
];

export function LandingFeatures() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {

      // ── Orbit rings: continuous rotation ──
      gsap.to(".goup-tech-ring-track", {
        rotate: 360,
        duration: (i) => orbitGroups[i]?.duration ?? 26,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%"
      });

      // ── Ecosystem: reveal copy ──
      gsap.from(".goup-ecosystem-copy > *", {
        scrollTrigger: { trigger: ".goup-ecosystem", start: "top 78%" },
        y: 22,
        opacity: 0,
        duration: 0.72,
        stagger: 0.1,
        ease: "power3.out"
      });

      // ── Ecosystem: convergence entry ──
      // Orbit system starts expanded (2.2×) and contracts into GoUp center.
      // overflow:hidden on .goup-ecosystem clips the expanded state cleanly.
      const stOrbit = { trigger: ".goup-ecosystem", start: "top 68%" };

      // Whole core shrinks from expanded scale — animating core only keeps
      // the 330px element within viewport bounds at 2.2× (726px < 1280px)
      gsap.fromTo(".goup-ecosystem .goup-tech-core",
        { scale: 2.2, opacity: 0.7, transformOrigin: "center center" },
        { scale: 1, opacity: 1, duration: 1.5,
          ease: "power3.out", scrollTrigger: stOrbit }
      );

      // Center GoUp: pops in, then starts pulse loop after entry
      gsap.fromTo(".goup-tech-center",
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.85,
          ease: "back.out(1.6)", scrollTrigger: stOrbit,
          onComplete: () => {
            gsap.to(".goup-tech-center", {
              scale: 1.04, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut"
            });
          }
        }
      );

      // Planets pop in one by one after the system starts converging
      gsap.fromTo(".goup-tech-planet",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.48,
          stagger: 0.07, delay: 0.45,
          ease: "back.out(2)", scrollTrigger: stOrbit }
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

      {/* ── Ecosystem: stack visual with orbit ── */}
      <section className="goup-ecosystem">
        <div className="goup-ecosystem-copy">
          <span>Integraciones</span>
          <h2>Conectado al stack que ya usas.</h2>
          <p>Canales oficiales de Meta, modelos de IA y tu infraestructura de datos en una sola plataforma operativa.</p>
        </div>

        <div className="goup-ecosystem-orbit goup-tech-system" aria-label="Stack tecnológico Goup">
          <div className="goup-tech-core">
            <div className="goup-tech-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/goup.png" alt="Goup Soluciones" width={84} height={28} style={{ width: 84, height: "auto", filter: "brightness(0) invert(1)" }} />
            </div>
            {orbitGroups.map((orbit, ringIndex) => (
              <div
                className="goup-tech-ring"
                key={orbit.radius}
                style={{ "--orbit-radius": `${orbit.radius}px` } as CSSProperties}
              >
                <span className="goup-tech-ring-line" />
                <div className="goup-tech-ring-tilt">
                <div className="goup-tech-ring-track">
                  {stackLogos
                    .filter((logo) => logo.ring === ringIndex)
                    .map((logo) => (
                      <div
                        className="goup-tech-planet"
                        key={logo.name}
                        title={logo.name}
                        style={{ "--planet-angle": `${logo.angle}deg` } as CSSProperties}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={logo.name}
                          src={logo.src}
                          width={22}
                          height={22}
                          className={logo.monochrome ? "is-monochrome" : undefined}
                          loading="lazy"
                        />
                        <span>{logo.name}</span>
                      </div>
                    ))}
                </div>
                </div>{/* /goup-tech-ring-tilt */}
              </div>
            ))}
          </div>
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
