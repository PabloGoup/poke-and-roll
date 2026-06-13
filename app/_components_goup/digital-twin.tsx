"use client";

import {
  Bot,
  Database,
  Instagram,
  LayoutDashboard,
  MessageCircle,
  TrendingUp,
  User
} from "lucide-react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

gsap.registerPlugin(MotionPathPlugin);

/*
  Gemelo digital: HTML para los nodos (glassmorphism + iconos) y SVG para
  aristas y pulsos. Comparten sistema de coordenadas porque el contenedor
  fija aspect-ratio 1000/540.
*/

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  hint: string;
};

const NODES: Node[] = [
  { id: "cliente", x: 80, y: 270, label: "Cliente", icon: User, hint: "Escribe a cualquier hora, por su canal favorito" },
  { id: "instagram", x: 270, y: 120, label: "Instagram", icon: Instagram, hint: "DMs y comentarios respondidos al instante" },
  { id: "whatsapp", x: 270, y: 420, label: "WhatsApp", icon: MessageCircle, hint: "API oficial de WhatsApp Business" },
  { id: "ia", x: 500, y: 270, label: "Agente IA", icon: Bot, hint: "Entiende, decide y ejecuta con tus reglas de negocio" },
  { id: "crm", x: 730, y: 120, label: "CRM", icon: Database, hint: "Cada cliente y conversación, registrado solo" },
  { id: "ventas", x: 880, y: 270, label: "Ventas", icon: TrendingUp, hint: "Pedidos y reservas cerrados sin intervención" },
  { id: "dashboard", x: 730, y: 420, label: "Dashboard", icon: LayoutDashboard, hint: "Tú ves todo en tiempo real" }
];

// Aristas como paths SVG; las rutas las recorren los pulsos en orden
const EDGES: Record<string, string> = {
  "cliente-instagram": "M80,270 C150,215 185,155 270,120",
  "cliente-whatsapp": "M80,270 C150,325 185,385 270,420",
  "instagram-ia": "M270,120 C360,150 425,205 500,270",
  "whatsapp-ia": "M270,420 C360,390 425,335 500,270",
  "ia-crm": "M500,270 C575,205 640,150 730,120",
  "crm-ventas": "M730,120 C805,150 855,205 880,270",
  "ventas-dashboard": "M880,270 C855,335 805,390 730,420",
  "dashboard-cliente": "M730,420 C480,545 200,500 80,270"
};

type Leg = { edge: string; from: string; to: string; payload: string };

const ROUTE_IG: Leg[] = [
  { edge: "cliente-instagram", from: "cliente", to: "instagram", payload: "“¿Tienen disponible para hoy?”" },
  { edge: "instagram-ia", from: "instagram", to: "ia", payload: "Mensaje entrante → intención detectada" },
  { edge: "ia-crm", from: "ia", to: "crm", payload: "Cliente identificado y registrado" },
  { edge: "crm-ventas", from: "crm", to: "ventas", payload: "Pedido confirmado: +$18.990" },
  { edge: "ventas-dashboard", from: "ventas", to: "dashboard", payload: "Venta reflejada en métricas" },
  { edge: "dashboard-cliente", from: "dashboard", to: "cliente", payload: "Seguimiento automático post-venta" }
];

const ROUTE_WA: Leg[] = [
  { edge: "cliente-whatsapp", from: "cliente", to: "whatsapp", payload: "“Quiero reservar para 4 personas”" },
  { edge: "whatsapp-ia", from: "whatsapp", to: "ia", payload: "Audio transcrito → reserva solicitada" },
  { edge: "ia-crm", from: "ia", to: "crm", payload: "Reserva agendada en el sistema" },
  { edge: "crm-ventas", from: "crm", to: "ventas", payload: "Mesa asegurada · recordatorio activo" },
  { edge: "ventas-dashboard", from: "ventas", to: "dashboard", payload: "Ocupación actualizada en vivo" },
  { edge: "dashboard-cliente", from: "dashboard", to: "cliente", payload: "Confirmación enviada al cliente" }
];

export function DigitalTwin() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState("El ciclo completo, sin que nadie toque un teclado.");
  const [litNode, setLitNode] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tl: gsap.core.Timeline | null = null;

    const light = (id: string) => {
      setLitNode(id);
      const el = stage.querySelector<HTMLElement>(`[data-node="${id}"]`);
      if (!el) return;
      gsap.fromTo(
        el,
        { scale: 1 },
        { scale: 1.12, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    };

    const buildRoute = (timeline: gsap.core.Timeline, route: Leg[], dotSel: string, glowSel: string) => {
      route.forEach((leg) => {
        const path = `#goup-edge-${leg.edge}`;
        timeline
          .set([dotSel, glowSel], { opacity: 1 })
          .call(() => {
            light(leg.from);
            setCaption(leg.payload);
          })
          .to([dotSel, glowSel], {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            duration: 1.15,
            ease: "power1.inOut"
          })
          .call(() => light(leg.to));
      });
      timeline.to([dotSel, glowSel], { opacity: 0, duration: 0.3 });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!tl) {
            tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
            buildRoute(tl, ROUTE_IG, "#goup-pulse-a", "#goup-pulse-a-glow");
            buildRoute(tl, ROUTE_WA, "#goup-pulse-b", "#goup-pulse-b-glow");
          }
          tl.play();
        } else {
          tl?.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, []);

  return (
    <section className="goup-twin-section goup-landing-section" id="gemelo" ref={sectionRef}>
      <div className="goup-twin-layout">
        <div className="goup-section-head">
          <span className="goup-section-kicker">Gemelo digital</span>
          <h2 className="goup-section-title">
            Así se ve tu negocio <span className="goup-title-gradient">funcionando solo.</span>
          </h2>
          <p className="goup-section-sub">
            Cada mensaje recorre este circuito en segundos: entra por Instagram o WhatsApp,
            la IA lo resuelve, el CRM lo registra y tú lo ves en el dashboard.
          </p>
        </div>

        <div className="goup-twin-visual">
          <div className="goup-twin-scroll">
            <div className="goup-twin-stage" ref={stageRef}>
          <svg
            className="goup-twin-svg"
            viewBox="0 0 1000 540"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="goup-edge-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
                <stop offset="50%" stopColor="rgba(254,139,2,0.28)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
              <radialGradient id="goup-pulse-grad">
                <stop offset="0%" stopColor="#FE8B02" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FE8B02" stopOpacity="0" />
              </radialGradient>
            </defs>

            {Object.entries(EDGES).map(([id, d]) => (
              <path
                key={id}
                id={`goup-edge-${id}`}
                d={d}
                stroke="url(#goup-edge-grad)"
                strokeWidth="1.5"
                strokeDasharray="3 6"
                className="goup-twin-edge"
              />
            ))}

            {/* Pulsos de datos: núcleo + halo */}
            <circle id="goup-pulse-a-glow" r="14" fill="url(#goup-pulse-grad)" opacity="0" />
            <circle id="goup-pulse-a" r="4" fill="#FE8B02" opacity="0" />
            <circle id="goup-pulse-b-glow" r="14" fill="url(#goup-pulse-grad)" opacity="0" />
            <circle id="goup-pulse-b" r="4" fill="#FFFFFF" opacity="0" />
          </svg>

          {NODES.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                data-node={n.id}
                className={`goup-twin-node ${n.id === "ia" ? "goup-twin-node-core" : ""} ${litNode === n.id ? "lit" : ""}`}
                style={{ left: `${(n.x / 1000) * 100}%`, top: `${(n.y / 540) * 100}%` }}
                aria-label={`${n.label}: ${n.hint}`}
              >
                <span className="goup-twin-node-icon"><Icon size={n.id === "ia" ? 20 : 15} /></span>
                <span className="goup-twin-node-label">{n.label}</span>
              </div>
            );
          })}
            </div>
          </div>

          <p className="goup-twin-caption" aria-live="polite">
            <span className="goup-crm-pulse" /> {caption}
          </p>
        </div>
      </div>
    </section>
  );
}
