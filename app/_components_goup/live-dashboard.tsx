"use client";

import {
  Activity,
  Bot,
  DollarSign,
  MessageSquare,
  ShoppingBag,
  UserPlus,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/*
  Centro de operaciones simulado. Un solo intervalo alimenta KPIs, feed y
  sparkline; se detiene fuera del viewport y con prefers-reduced-motion.
*/

const FEED_POOL = [
  { icon: MessageSquare, text: "Nueva conversación desde Instagram", tag: "IG" },
  { icon: ShoppingBag, text: "Pedido #1048 confirmado · $22.490", tag: "Venta" },
  { icon: UserPlus, text: "Cliente nuevo registrado en CRM", tag: "CRM" },
  { icon: MessageSquare, text: "Consulta de horario respondida en 3s", tag: "WA" },
  { icon: Zap, text: "Seguimiento post-venta enviado", tag: "Auto" },
  { icon: ShoppingBag, text: "Reserva para 4 personas confirmada", tag: "Reserva" },
  { icon: Zap, text: "Carrito abandonado → recordatorio enviado", tag: "Auto" },
  { icon: MessageSquare, text: "Audio transcrito y respondido", tag: "WA" },
  { icon: UserPlus, text: "Lead calificado y asignado a ventas", tag: "CRM" },
  { icon: Zap, text: "Promoción del día publicada en redes", tag: "Auto" }
];

const fmt = new Intl.NumberFormat("es-CL");

type FeedItem = (typeof FEED_POOL)[number] & { id: number };

export function LiveDashboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const [kpis, setKpis] = useState({ convos: 1284, ventas: 312, clientes: 96, autos: 2417 });
  const [ingresos, setIngresos] = useState(4860000);
  const [feed, setFeed] = useState<FeedItem[]>(
    FEED_POOL.slice(0, 4).map((f, i) => ({ ...f, id: i }))
  );
  const [spark, setSpark] = useState<number[]>([
    18, 24, 21, 32, 28, 38, 35, 46, 41, 52, 48, 58
  ]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let interval: number | null = null;
    let nextId = 100;

    const tick = () => {
      const item = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
      setFeed((prev) => [{ ...item, id: nextId++ }, ...prev].slice(0, 5));
      setKpis((k) => ({
        convos: k.convos + 1 + Math.floor(Math.random() * 2),
        ventas: k.ventas + (Math.random() < 0.35 ? 1 : 0),
        clientes: k.clientes + (Math.random() < 0.25 ? 1 : 0),
        autos: k.autos + 1 + Math.floor(Math.random() * 3)
      }));
      if (Math.random() < 0.45) {
        setIngresos((v) => v + 9900 + Math.floor(Math.random() * 4) * 5000);
      }
      setSpark((s) => {
        const last = s[s.length - 1];
        const next = Math.max(14, Math.min(64, last + (Math.random() * 16 - 7)));
        return [...s.slice(1), next];
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && interval === null) {
          interval = window.setInterval(tick, 2200);
        } else if (!entry.isIntersecting && interval !== null) {
          window.clearInterval(interval);
          interval = null;
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (interval !== null) window.clearInterval(interval);
    };
  }, []);

  const sparkPoints = spark
    .map((v, i) => `${(i / (spark.length - 1)) * 220},${70 - v}`)
    .join(" ");

  return (
    <section className="goup-live-section goup-landing-section" id="dashboard" ref={sectionRef}>
      <div className="goup-section-head">
        <span className="goup-section-kicker">Centro de control</span>
        <h2 className="goup-section-title">
          Tu negocio operando. <span className="goup-title-gradient">Ahora mismo.</span>
        </h2>
        <p className="goup-section-sub">
          Esto es lo que ves cuando abres Goup: conversaciones entrando, ventas cerrándose
          y automatizaciones ejecutándose mientras haces otra cosa.
        </p>
      </div>

      <div className="goup-window">
        <div className="goup-window-bar">
          <span className="goup-window-dots" aria-hidden="true"><i /><i /><i /></span>
          <strong>Goup · Centro de control</strong>
          <span className="goup-live-dot-label"><i className="goup-online-dot" /> en vivo</span>
        </div>

        <div className="goup-live-grid">
        <div className="goup-live-kpis">
          <div className="goup-live-kpi">
            <span className="goup-live-kpi-head"><MessageSquare size={14} /> Conversaciones</span>
            <strong>{fmt.format(kpis.convos)}</strong>
            <span className="goup-live-kpi-trend">▲ en vivo</span>
          </div>
          <div className="goup-live-kpi">
            <span className="goup-live-kpi-head"><ShoppingBag size={14} /> Ventas cerradas</span>
            <strong>{fmt.format(kpis.ventas)}</strong>
            <span className="goup-live-kpi-trend">▲ este mes</span>
          </div>
          <div className="goup-live-kpi">
            <span className="goup-live-kpi-head"><UserPlus size={14} /> Clientes nuevos</span>
            <strong>{fmt.format(kpis.clientes)}</strong>
            <span className="goup-live-kpi-trend">▲ este mes</span>
          </div>
          <div className="goup-live-kpi">
            <span className="goup-live-kpi-head"><Zap size={14} /> Automatizaciones</span>
            <strong>{fmt.format(kpis.autos)}</strong>
            <span className="goup-live-kpi-trend">▲ ejecutadas</span>
          </div>
        </div>

        <div className="goup-live-revenue">
          <header>
            <span><DollarSign size={14} /> Ingresos generados por IA</span>
            <span className="goup-live-dot-label"><i className="goup-online-dot" /> tiempo real</span>
          </header>
          <strong className="goup-live-amount">${fmt.format(ingresos)}</strong>
          <svg viewBox="0 0 220 74" className="goup-live-spark" aria-hidden="true" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goup-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(254,139,2,0.35)" />
                <stop offset="100%" stopColor="rgba(254,139,2,0)" />
              </linearGradient>
            </defs>
            <polygon points={`0,74 ${sparkPoints} 220,74`} fill="url(#goup-spark-fill)" />
            <polyline
              points={sparkPoints}
              fill="none"
              stroke="#FE8B02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="goup-live-feed">
          <header>
            <span><Activity size={14} /> Actividad en vivo</span>
            <span className="goup-live-dot-label"><i className="goup-online-dot" /> streaming</span>
          </header>
          <ul>
            {feed.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.id} className="goup-live-event">
                  <span className="goup-live-event-icon"><Icon size={13} /></span>
                  <span className="goup-live-event-text">{f.text}</span>
                  <span className="goup-live-event-tag">{f.tag}</span>
                </li>
              );
            })}
          </ul>
          <footer>
            <Bot size={13} />
            El agente sigue trabajando aunque cierres esta página.
          </footer>
        </div>
        </div>
      </div>
    </section>
  );
}
