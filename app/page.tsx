import {
  Activity,
  ArrowUpRight,
  BellRing,
  CalendarCheck,
  ChevronRight,
  CircleDot,
  Command,
  MessageCircle,
  Radio,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import {
  agentesDemo,
  contenidoDemo,
  conversacionesDemo,
  integracionesDemo,
  metricasPanel
} from "@/lib/demo-data";

const tonos: Record<string, string> = {
  green: "metric metric-green",
  red: "metric metric-red",
  amber: "metric metric-amber",
  blue: "metric metric-blue"
};

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <nav className="topbar" aria-label="Panel principal">
          <div className="brand">
            <div className="brand-mark">PR</div>
            <div>
              <p>Poke & Roll</p>
              <span>Agente omnicanal</span>
            </div>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Configurar">
              <Settings2 size={19} />
            </button>
            <button className="primary-button">
              <MessageCircle size={18} />
              WhatsApp primero
            </button>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="signal">
              <Radio size={16} />
              Sistema activo en modo implementacion
            </div>
            <h1>Centro de mando para ventas, mensajes y contenido.</h1>
            <p>
              WhatsApp queda como canal principal. Instagram queda conectado para
              mensajes, historias, carruseles y publicaciones diarias.
            </p>
            <div className="hero-actions">
              <button className="primary-button large">
                <Zap size={18} />
                Activar flujo automatico
              </button>
              <button className="ghost-button large">
                Ver conversaciones
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="command-card">
            <div className="command-header">
              <div>
                <span>Orquestador</span>
                <strong>Agentes internos</strong>
              </div>
              <Command size={22} />
            </div>
            <div className="orbit">
              <div className="core">
                <Sparkles size={28} />
                <span>OpenAI</span>
              </div>
              {agentesDemo.map((agente, index) => (
                <div className={`node node-${index + 1}`} key={agente.nombre}>
                  <agente.icono size={18} />
                  {agente.nombre}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Metricas operativas">
        {metricasPanel.map((metrica) => (
          <article className={tonos[metrica.tono]} key={metrica.titulo}>
            <div className="metric-icon">
              <metrica.icono size={20} />
            </div>
            <span>{metrica.titulo}</span>
            <strong>{metrica.valor}</strong>
            <p>{metrica.detalle}</p>
          </article>
        ))}
      </section>

      <section className="workspace">
        <div className="panel conversations">
          <div className="panel-title">
            <div>
              <span>Bandeja priorizada</span>
              <h2>Conversaciones vivas</h2>
            </div>
            <button className="pill-button">
              <BellRing size={16} />
              Alertas
            </button>
          </div>

          <div className="conversation-list">
            {conversacionesDemo.map((item) => (
              <article className="conversation" key={`${item.cliente}-${item.hora}`}>
                <div className="conversation-top">
                  <div>
                    <strong>{item.cliente}</strong>
                    <span>{item.canal} · {item.hora}</span>
                  </div>
                  <em className={`priority ${item.prioridad}`}>{item.estado}</em>
                </div>
                <p className="intent">{item.intencion}</p>
                <blockquote>{item.mensaje}</blockquote>
                <div className="reply-preview">
                  <Send size={15} />
                  <span>{item.respuesta}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="side-stack">
          <div className="panel">
            <div className="panel-title compact">
              <div>
                <span>Automatizacion</span>
                <h2>Integraciones</h2>
              </div>
              <Activity size={20} />
            </div>
            <div className="integration-grid">
              {integracionesDemo.map((item) => (
                <div className="integration" key={item.nombre}>
                  <item.icono size={18} />
                  <div>
                    <strong>{item.nombre}</strong>
                    <span>{item.detalle}</span>
                  </div>
                  <small>{item.estado}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="panel security">
            <div>
              <ShieldCheck size={24} />
              <h2>Reglas de seguridad</h2>
            </div>
            <p>
              El agente no promete precios, descuentos, tiempos de despacho ni
              compensaciones si no existen en la base de datos.
            </p>
          </div>
        </aside>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <div>
            <span>Instagram</span>
            <h2>Calendario de contenido</h2>
          </div>
          <button className="ghost-button">
            Generar piezas
            <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="content-grid">
          {contenidoDemo.map((item) => (
            <article className="content-card" key={item.titulo}>
              <div className="content-card-top">
                <span>{item.tipo}</span>
                <em>{item.estado}</em>
              </div>
              <h3>{item.titulo}</h3>
              <p>{item.idea}</p>
              <div className="content-meta">
                <span>
                  <CalendarCheck size={16} />
                  {item.horario}
                </span>
                <span>
                  <CircleDot size={16} />
                  {item.piezas} piezas
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
