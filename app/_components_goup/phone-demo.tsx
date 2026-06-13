"use client";

import {
  Bot,
  Check,
  Database,
  Loader2,
  MapPin,
  Search,
  Send,
  ShoppingBag,
  CalendarCheck,
  Sparkles
} from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

/* ────────────────────────────────────────────────
   Motor de demo: intenciones con respuesta + flujo
   ──────────────────────────────────────────────── */

type FlowStep = {
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  detail: string;
};

type Intent = {
  match: (t: string) => boolean;
  reply: string;
  steps: FlowStep[];
  crm?: { label: string; value: string };
};

const normalize = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const INTENTS: Intent[] = [
  {
    match: (t) => /\b(hola|buenas|hey|hello|alo)\b/.test(t),
    reply:
      "¡Hola! 👋 Soy el agente IA de tu negocio. Puedo tomar pedidos, agendar reservas y responder cualquier consulta. ¿En qué te ayudo?",
    steps: [
      { icon: Search, label: "Identificando cliente", detail: "Historial recuperado en 0.4s" },
      { icon: Database, label: "Contexto cargado", detail: "Preferencias y últimas compras" }
    ],
    crm: { label: "Cliente reconocido", value: "Perfil + historial activo" }
  },
  {
    match: (t) => /(pedido|comprar|orden|quiero|roll|pizza|producto)/.test(t),
    reply:
      "¡Perfecto! Revisé el catálogo: te recomiendo el combo más pedido hoy. Total $18.990 con despacho incluido a tu dirección guardada. ¿Lo confirmo? ✅",
    steps: [
      { icon: Search, label: "Buscando en catálogo", detail: "128 productos · stock en vivo" },
      { icon: MapPin, label: "Calculando despacho", detail: "Zona cubierta · 35–45 min" },
      { icon: ShoppingBag, label: "Generando pedido #1047", detail: "Total $18.990 CLP" },
      { icon: Database, label: "Actualizando CRM", detail: "Cliente + pedido sincronizados" }
    ],
    crm: { label: "Pedido #1047 creado", value: "+$18.990 en ventas" }
  },
  {
    match: (t) => /(despacho|delivery|envio|reparto|domicilio)/.test(t),
    reply:
      "Sí, hacemos delivery 🛵. Cubrimos toda la zona y el tiempo estimado es de 35 a 50 minutos. ¿Te armo un pedido para despacho?",
    steps: [
      { icon: MapPin, label: "Verificando cobertura", detail: "Geocodificación en tiempo real" },
      { icon: Database, label: "Consultando tarifas", detail: "Reglas comerciales aplicadas" }
    ]
  },
  {
    match: (t) => /(reserva|mesa|agendar|cita|hora)/.test(t),
    reply:
      "¡Claro! Tengo disponibilidad hoy a las 20:00 y 21:30 para 2–6 personas. ¿Cuál te acomoda? La confirmo al instante 📅",
    steps: [
      { icon: Search, label: "Consultando agenda", detail: "Disponibilidad en tiempo real" },
      { icon: CalendarCheck, label: "Reserva pre-creada", detail: "Confirmación automática lista" },
      { icon: Database, label: "CRM actualizado", detail: "Recordatorio programado" }
    ],
    crm: { label: "Reserva generada", value: "Recordatorio automático activo" }
  },
  {
    match: (t) => /(precio|cuanto|vale|costo|plan)/.test(t),
    reply:
      "Te paso los precios al tiro 💬: el combo estrella está a $18.990 y las promos de hoy parten en $9.990. ¿Quieres que te recomiende según tu pedido anterior?",
    steps: [
      { icon: Search, label: "Consultando catálogo", detail: "Precios y promos vigentes" },
      { icon: Sparkles, label: "Personalizando oferta", detail: "Basado en historial del cliente" }
    ]
  }
];

const FALLBACK: Intent = {
  match: () => true,
  reply:
    "Esto es un demo, así que por ahora respondo solo las consultas sugeridas (saludo, pedidos, delivery y reservas) 👆. El agente real responde cualquier pregunta de tu negocio con tu catálogo, precios y reglas. Toca «Agendar reunión» y te hacemos un demo completo a tu medida 🚀",
  steps: [
    { icon: Sparkles, label: "Demo con respuestas acotadas", detail: "Solo las consultas de muestra" },
    { icon: CalendarCheck, label: "Demo completo disponible", detail: "Reunión de 30 min con tu negocio" }
  ]
};

const SUGGESTIONS = ["Hola", "Quiero hacer un pedido", "¿Hacen delivery?", "Reservar una mesa"];

type Message = { role: "user" | "ai"; text: string };
type RunningStep = FlowStep & { status: "pending" | "running" | "done" };

/* ──────────────────────────────────────────────── */

export function PhoneDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const timeouts = useRef<number[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Escríbeme como si fueras tu cliente. Respondo en serio 😉" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<RunningStep[]>([]);
  const [crmEvents, setCrmEvents] = useState<{ label: string; value: string }[]>([]);

  // Tilt 3D del teléfono siguiendo el puntero
  useEffect(() => {
    const section = sectionRef.current;
    const phone = phoneRef.current;
    if (!section || !phone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(phone, {
        rotateY: x * 10,
        rotateX: y * -7,
        duration: 0.9,
        ease: "power3.out"
      });
    };
    section.addEventListener("mousemove", onMove);
    return () => section.removeEventListener("mousemove", onMove);
  }, []);

  // Auto-scroll del hilo
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const saved = timeouts.current;
    return () => saved.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);

    const intent = INTENTS.find((i) => i.match(normalize(text))) ?? FALLBACK;

    // 1) Pipeline de operaciones en el panel lateral
    setSteps(intent.steps.map((s) => ({ ...s, status: "pending" })));
    intent.steps.forEach((_, i) => {
      later(() => {
        setSteps((prev) =>
          prev.map((s, j) => ({
            ...s,
            status: j < i ? "done" : j === i ? "running" : "pending"
          }))
        );
      }, 350 + i * 520);
    });
    const flowEnd = 350 + intent.steps.length * 520;
    later(() => {
      setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
      if (intent.crm) {
        setCrmEvents((prev) => [intent.crm!, ...prev].slice(0, 3));
      }
    }, flowEnd);

    // 2) Typing + respuesta en el teléfono
    later(() => setTyping(true), 420);
    later(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: intent.reply }]);
      setBusy(false);
    }, Math.max(flowEnd + 200, 1500));
  };

  return (
    <section className="goup-demo-section goup-landing-section" id="demo" ref={sectionRef}>
      <div className="goup-section-head">
        <span className="goup-section-kicker">Experiencia en vivo</span>
        <h2 className="goup-section-title">
          No te lo contamos. <span className="goup-title-gradient">Pruébalo tú mismo.</span>
        </h2>
        <p className="goup-section-sub">
          Escríbele al agente como si fueras un cliente y mira, en tiempo real, todo lo
          que ejecuta detrás de cada respuesta.
        </p>
      </div>

      <div className="goup-demo-stage">
        {/* ── Teléfono interactivo ── */}
        <div className="goup-phone-perspective">
          <div className="goup-phone" ref={phoneRef}>
            <div className="goup-phone-notch" aria-hidden="true" />
            <div className="goup-phone-header">
              <div className="goup-phone-avatar"><Bot size={16} /></div>
              <div>
                <strong>Agente IA · Tu negocio</strong>
                <span><i className="goup-online-dot" /> en línea · responde al instante</span>
              </div>
            </div>

            <div className="goup-phone-thread" ref={threadRef}>
              {messages.map((m, i) => (
                <div key={i} className={`goup-bubble ${m.role}`}>{m.text}</div>
              ))}
              {typing && (
                <div className="goup-bubble ai goup-bubble-typing" aria-label="El agente está escribiendo">
                  <span /><span /><span />
                </div>
              )}
            </div>

            <div className="goup-phone-chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} disabled={busy}>
                  {s}
                </button>
              ))}
            </div>

            <form
              className="goup-phone-input"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje…"
                aria-label="Mensaje para el agente IA"
                maxLength={120}
              />
              <button type="submit" aria-label="Enviar" disabled={busy || !input.trim()}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Panel: lo que ejecuta la IA ── */}
        <div className="goup-flow-panel">
          <div className="goup-flow-card goup-flow-main">
            <header>
              <Sparkles size={14} />
              Lo que la IA ejecutó detrás
            </header>
            {steps.length === 0 ? (
              <div className="goup-flow-empty">
                <span className="goup-flow-empty-icon"><Sparkles size={18} /></span>
                <p>
                  Envía un mensaje y verás cada operación del agente aparecer aquí:
                  catálogo, despacho, pedidos, CRM.
                </p>
              </div>
            ) : (
              <ul className="goup-flow-steps">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i} className={`goup-aistep ${s.status}`}>
                      <span className="goup-flow-icon">
                        {s.status === "done" ? (
                          <Check size={13} />
                        ) : s.status === "running" ? (
                          <Loader2 size={13} className="goup-spin" />
                        ) : (
                          <Icon size={13} />
                        )}
                      </span>
                      <div>
                        <strong>{s.label}</strong>
                        <span>{s.detail}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="goup-flow-card goup-crm-card">
            <header>
              <Database size={14} />
              CRM en tiempo real
            </header>
            {crmEvents.length === 0 ? (
              <p className="goup-flow-hint">Los clientes, pedidos y reservas se registran solos.</p>
            ) : (
              <ul className="goup-crm-events">
                {crmEvents.map((e, i) => (
                  <li key={`${e.label}-${i}`}>
                    <span className="goup-crm-pulse" />
                    <div>
                      <strong>{e.label}</strong>
                      <span>{e.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="goup-demo-stats">
            <div>
              <strong>&lt; 5 seg</strong>
              <span>respuesta promedio</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>sin pausas ni turnos</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>registrado en CRM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
