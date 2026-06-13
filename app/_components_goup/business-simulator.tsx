"use client";

import {
  Building2,
  HeartPulse,
  MessageSquare,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  UtensilsCrossed,
  Wrench,
  CalendarCheck,
  DollarSign
} from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

type Metric = {
  icon: ComponentType<{ size?: number | string }>;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

type Vertical = {
  id: string;
  name: string;
  icon: ComponentType<{ size?: number | string }>;
  tagline: string;
  metrics: Metric[];
  events: string[];
};

const fmt = new Intl.NumberFormat("es-CL");

const VERTICALS: Vertical[] = [
  {
    id: "restaurante",
    name: "Restaurante",
    icon: UtensilsCrossed,
    tagline: "Un día normal con tu agente IA atendiendo:",
    metrics: [
      { icon: MessageSquare, value: 37, prefix: "+", label: "conversaciones atendidas" },
      { icon: TrendingUp, value: 12, prefix: "+", label: "ventas cerradas" },
      { icon: CalendarCheck, value: 4, prefix: "+", label: "reservas generadas" },
      { icon: DollarSign, value: 420000, prefix: "+$", label: "en ingresos" }
    ],
    events: [
      "12:40 · Pedido para retiro confirmado por WhatsApp",
      "13:05 · Mesa para 4 reservada desde Instagram",
      "13:18 · Cliente frecuente recibió promo personalizada",
      "13:31 · Reclamo escalado al encargado con contexto completo"
    ]
  },
  {
    id: "clinica",
    name: "Clínica",
    icon: Stethoscope,
    tagline: "Tu agenda se llena sola, sin secretaria al teléfono:",
    metrics: [
      { icon: MessageSquare, value: 52, prefix: "+", label: "consultas respondidas" },
      { icon: CalendarCheck, value: 18, prefix: "+", label: "horas agendadas" },
      { icon: HeartPulse, value: 9, prefix: "+", label: "recordatorios enviados" },
      { icon: DollarSign, value: 680000, prefix: "+$", label: "en atenciones" }
    ],
    events: [
      "09:12 · Hora agendada con confirmación automática",
      "10:02 · Paciente reagendó sin intervención humana",
      "11:45 · Recordatorio redujo una inasistencia",
      "12:20 · Pregunta de cobertura respondida al instante"
    ]
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    icon: ShoppingCart,
    tagline: "Carritos recuperados y clientes respondidos 24/7:",
    metrics: [
      { icon: MessageSquare, value: 84, prefix: "+", label: "consultas de producto" },
      { icon: TrendingUp, value: 23, prefix: "+", label: "ventas cerradas" },
      { icon: ShoppingCart, value: 11, prefix: "+", label: "carritos recuperados" },
      { icon: DollarSign, value: 1240000, prefix: "+$", label: "en ingresos" }
    ],
    events: [
      "02:14 · Venta cerrada mientras dormías",
      "08:30 · Cliente recibió seguimiento de su despacho",
      "11:08 · Carrito abandonado recuperado con descuento",
      "15:47 · Cambio de talla gestionado sin tickets"
    ]
  },
  {
    id: "inmobiliaria",
    name: "Inmobiliaria",
    icon: Building2,
    tagline: "Cada lead calificado antes de llegar a tu equipo:",
    metrics: [
      { icon: MessageSquare, value: 45, prefix: "+", label: "leads atendidos" },
      { icon: TrendingUp, value: 14, prefix: "+", label: "leads calificados" },
      { icon: CalendarCheck, value: 6, prefix: "+", label: "visitas agendadas" },
      { icon: DollarSign, value: 8, prefix: "+", suffix: " UF", label: "promedio por cierre" }
    ],
    events: [
      "10:05 · Lead de portal respondido en 4 segundos",
      "11:32 · Visita coordinada según disponibilidad real",
      "13:50 · Ficha de propiedad enviada con financiamiento",
      "16:21 · Lead frío reactivado con seguimiento automático"
    ]
  },
  {
    id: "servicios",
    name: "Servicios",
    icon: Wrench,
    tagline: "Cotizaciones y agenda resueltas sin llamadas perdidas:",
    metrics: [
      { icon: MessageSquare, value: 29, prefix: "+", label: "solicitudes atendidas" },
      { icon: TrendingUp, value: 9, prefix: "+", label: "cotizaciones enviadas" },
      { icon: CalendarCheck, value: 7, prefix: "+", label: "visitas agendadas" },
      { icon: DollarSign, value: 560000, prefix: "+$", label: "en trabajos cerrados" }
    ],
    events: [
      "08:55 · Cotización generada con precios actualizados",
      "10:40 · Urgencia priorizada y derivada al técnico",
      "12:15 · Cliente recibió hora de visita confirmada",
      "17:02 · Seguimiento post-servicio enviado solo"
    ]
  }
];

export function BusinessSimulator() {
  const [active, setActive] = useState<Vertical>(VERTICALS[0]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Re-anima contadores y feed cada vez que cambia el rubro o entra en viewport
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const m = active.metrics[Number(el.dataset.counter)];
        el.textContent = `${m.prefix ?? ""}${fmt.format(m.value)}${m.suffix ?? ""}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      panel.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const m = active.metrics[Number(el.dataset.counter)];
        const obj = { val: 0 };
        gsap.to(obj, {
          val: m.value,
          duration: 1.4,
          ease: "power3.out",
          snap: { val: 1 },
          onUpdate() {
            el.textContent = `${m.prefix ?? ""}${fmt.format(Math.round(obj.val))}${m.suffix ?? ""}`;
          }
        });
      });

      gsap.from(".goup-sim-metric", {
        y: 18,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all"
      });

      gsap.from(".goup-sim-event", {
        x: -14,
        opacity: 0,
        duration: 0.45,
        stagger: 0.22,
        delay: 0.3,
        ease: "power2.out",
        clearProps: "all"
      });
    }, panel);

    return () => ctx.revert();
  }, [active]);

  return (
    <section className="goup-sim-section goup-landing-section" id="simulador">
      <div className="goup-section-head">
        <span className="goup-section-kicker">Simulador</span>
        <h2 className="goup-section-title">
          ¿Qué tipo de negocio <span className="goup-title-gradient">tienes?</span>
        </h2>
        <p className="goup-section-sub">
          Elige tu rubro y mira lo que un agente IA de Goup haría por ti en un día cualquiera.
        </p>
      </div>

      <div className="goup-sim-picker" role="tablist" aria-label="Tipo de negocio">
        {VERTICALS.map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active.id === v.id}
              className={`goup-sim-tab ${active.id === v.id ? "active" : ""}`}
              onClick={() => setActive(v)}
            >
              <Icon size={16} />
              {v.name}
            </button>
          );
        })}
      </div>

      <div className="goup-sim-panel" ref={panelRef} key={active.id}>
        <div className="goup-sim-left">
          <p className="goup-sim-tagline">{active.tagline}</p>
          <div className="goup-sim-metrics">
            {active.metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div className="goup-sim-metric" key={m.label}>
                  <span className="goup-sim-metric-icon"><Icon size={16} /></span>
                  <strong data-counter={i}>0</strong>
                  <span className="goup-sim-metric-label">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="goup-sim-feed">
          <header className="goup-sim-feed-head">Actividad del día</header>
          {active.events.map((e) => (
            <div className="goup-sim-event" key={e}>
              <span className="goup-crm-pulse" />
              {e}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
