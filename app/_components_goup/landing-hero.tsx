"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";

const demoConversations = [
  {
    user: "¿Qué promociones tienen para retiro hoy?",
    ai: "Adjunto el catálogo completo y te recomiendo las promos activas. ¿Lo quieres para retiro o delivery?"
  },
  {
    user: "¿Hacen delivery a Providencia?",
    ai: "Sí, cubrimos toda la RM. El tiempo estimado es 35–50 min. ¿Te armo el pedido?"
  },
  {
    user: "Quiero 2 rolls de salmón y un bowl mediano.",
    ai: "¡Anotado! Total $14.800 con despacho incluido. ¿Confirmas o ajusto algo antes de enviarlo?"
  }
];

const canales = ["WhatsApp", "Instagram", "Facebook"];

export function LandingHero() {
  const rootRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return;

    const ctx = gsap.context(() => {
      // ── Entry: copy stack ──
      gsap.from(".goup-animate-in", {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out"
      });

      // ── Entry: product shell messages ──
      gsap.from(".goup-demo-message", {
        x: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.14,
        delay: 0.55,
        ease: "power3.out"
      });

      // ── Counter for proof stat "3" ──
      const countObj = { val: 0 };
      const counterEl = root.querySelector<HTMLElement>(".goup-proof-count");
      if (counterEl) {
        gsap.to(countObj, {
          val: 3,
          duration: 1.4,
          delay: 1.1,
          ease: "power2.out",
          snap: { val: 1 },
          onUpdate() {
            counterEl.textContent = String(Math.round(countObj.val));
          }
        });
      }

      // ── Demo conversation loop (after initial hold) ──
      const userMsg = root.querySelector<HTMLElement>(".goup-demo-message.user");
      const aiMsg = root.querySelector<HTMLElement>(".goup-demo-message.ai");
      const userP = root.querySelector<HTMLElement>(".goup-demo-message.user p");
      const aiP = root.querySelector<HTMLElement>(".goup-demo-message.ai p");
      const typingEl = root.querySelector<HTMLElement>(".goup-typing-indicator");
      const typingDots = root.querySelectorAll<HTMLElement>(".goup-typing-indicator span");

      if (userMsg && aiMsg && userP && aiP && typingEl && typingDots.length) {
        const loopTl = gsap.timeline({ delay: 4, repeat: -1 });

        demoConversations.forEach((_, i) => {
          const next = demoConversations[(i + 1) % demoConversations.length];

          loopTl
            .to({}, { duration: 2.8 })
            // fade out current
            .to([userMsg, aiMsg], {
              opacity: 0, y: -10,
              duration: 0.28, stagger: 0.07,
              ease: "power2.in"
            })
            // swap content
            .call(() => {
              userP.textContent = next.user;
              aiP.textContent = next.ai;
            })
            // show typing indicator
            .set(typingEl, { display: "flex" })
            .to(typingDots, {
              keyframes: [
                { y: -5, duration: 0.16 },
                { y: 0, duration: 0.16 }
              ],
              stagger: 0.12,
              repeat: 2
            })
            .set(typingEl, { display: "none" })
            // fade in new conversation
            .set([userMsg, aiMsg], { opacity: 0, y: 10 })
            .to(userMsg, { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" })
            .to(aiMsg, { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" }, "+=0.18");
        });
      }

      // ── Mouse parallax on product shell ──
      const onMove = (e: MouseEvent) => {
        const rect = root.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(visual, {
          rotateY: x * 6, rotateX: y * -4,
          y: y * 12, x: x * 10,
          duration: 0.7, ease: "power3.out"
        });
      };

      root.addEventListener("mousemove", onMove);
      return () => root.removeEventListener("mousemove", onMove);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="goup-hero goup-landing-section" ref={rootRef}>
      <div className="goup-hero-backdrop" aria-hidden="true" />
      <div className="goup-hero-scrim" aria-hidden="true" />

      <nav className="goup-landing-nav goup-animate-in" aria-label="Principal">
        <Link href="/" className="goup-nav-brand">
          <Image src="/images/goup.png" alt="Goup Soluciones" width={102} height={34} priority />
        </Link>
        <div className="goup-nav-links">
          <a href="#features">Producto</a>
          <a href="#workflow">Flujo</a>
          <a href="#control">Control</a>
        </div>
        <Link href="/login" className="goup-nav-login">Acceder</Link>
      </nav>

      <div className="goup-hero-layout">
        <div className="goup-hero-copy">
          <div className="goup-hero-badge goup-animate-in">
            <span className="goup-badge-dot" />
            SaaS de agentes IA para negocios con alto flujo
          </div>

          <h1 className="goup-hero-title goup-animate-in">
            Automatiza atención y ventas con agentes IA.
          </h1>

          <p className="goup-hero-description goup-animate-in">
            Goup centraliza WhatsApp, Instagram y Facebook con agentes entrenados en tu catálogo, reglas comerciales y protocolos de atención.
          </p>

          <div className="goup-hero-actions goup-animate-in">
            <Link href="/login" className="goup-btn-hero-primary">
              Entrar a la plataforma
              <ArrowRight size={16} />
            </Link>
            <a href="#features" className="goup-btn-hero-secondary">
              Ver cómo funciona
            </a>
          </div>

          <div className="goup-hero-proof goup-animate-in">
            <div>
              <strong><span className="goup-proof-count">3</span> canales</strong>
              <span>en una bandeja operativa</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>respuestas con reglas de negocio</span>
            </div>
            <div>
              <strong>Auditable</strong>
              <span>decisiones y escalamiento humano</span>
            </div>
          </div>
        </div>

        <div className="goup-hero-product goup-animate-in" ref={visualRef}>
          <div className="goup-product-shell">
            <div className="goup-product-topbar">
              <span /><span /><span />
              <strong>Agent Console</strong>
            </div>

            <div className="goup-product-header">
              <div>
                <span>Respuesta sugerida</span>
                <strong>Pedido con catálogo validado</strong>
              </div>
              <div className="goup-product-status">
                <ShieldCheck size={14} />
                Aprobado
              </div>
            </div>

            <div className="goup-demo-thread">
              <div className="goup-demo-message user">
                <MessageCircle size={14} />
                <p>{demoConversations[0].user}</p>
              </div>
              <div className="goup-typing-indicator" aria-hidden="true">
                <span /><span /><span />
              </div>
              <div className="goup-demo-message ai">
                <Bot size={14} />
                <p>{demoConversations[0].ai}</p>
              </div>
            </div>

            <div className="goup-product-grid">
              {canales.map((canal) => (
                <div className="goup-channel-pill" key={canal}>
                  <Sparkles size={13} />
                  {canal}
                </div>
              ))}
            </div>

            <div className="goup-product-metric">
              <Zap size={15} />
              <div>
                <strong>Automatización con control humano</strong>
                <span>Escala reclamos, pedidos sensibles y datos incompletos.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
