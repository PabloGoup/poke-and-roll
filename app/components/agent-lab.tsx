import { FormEvent } from "react";
import Image from "next/image";
import { AlertTriangle, Bot, CheckCircle2, FileText, ImagePlus, Lightbulb, Send, Trash2 } from "lucide-react";
import { Canal, DecisionResponse, MensajeLaboratorio } from "@/app/types";

type Props = {
  canal: Canal;
  cliente: string;
  texto: string;
  decision: DecisionResponse | null;
  historial: MensajeLaboratorio[];
  loading: boolean;
  crearOrdenReal: boolean;
  onCanalChange: (canal: Canal) => void;
  onClienteChange: (value: string) => void;
  onCrearOrdenRealChange: (value: boolean) => void;
  onTextoChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClearHistorial: () => void;
  onConfigCatalogo?: () => void;
};

const canales: Canal[] = ["whatsapp", "instagram", "facebook"];

const EJEMPLOS = [
  { texto: "Hola! tienen opciones sin palta? soy alérgica", cliente: "Valentina M." },
  { texto: "Mi pedido lleva 1 hora y no llega, quiero cancelar", cliente: "Carlos R." },
  { texto: "Cuánto vale el combo para 4 personas con bebidas?", cliente: "Sofía G." },
  { texto: "A qué hora cierran hoy? Quiero ir a buscar", cliente: "Pedro S." },
];

function esPdf(url: string, nombre?: string) {
  return url.toLowerCase().includes(".pdf") || url.includes("/api/catalogo/pdf") || nombre?.toLowerCase().endsWith(".pdf");
}

export function AgentLab({
  canal,
  cliente,
  texto,
  decision,
  historial,
  loading,
  crearOrdenReal,
  onCanalChange,
  onClienteChange,
  onCrearOrdenRealChange,
  onTextoChange,
  onSubmit,
  onClearHistorial,
  onConfigCatalogo
}: Props) {
  const ultimaDecision = [...historial].reverse().find((item) => item.rol === "agente" && item.decision)?.decision ?? decision?.decision;

  return (
    <section className="two-column" id="laboratorio">
      <div className="panel">
        <div className="panel-title">
          <div>
            <span>Prueba controlada</span>
            <h2>Laboratorio del agente</h2>
          </div>
          <Bot size={22} />
        </div>

        <form className="agent-form" onSubmit={onSubmit}>
          {onConfigCatalogo && (
            <button className="agent-catalog-shortcut" onClick={onConfigCatalogo} type="button">
              <span>
                <ImagePlus size={16} />
                Catálogo visual
              </span>
              <strong>Subir imágenes y elegir cuál se envía primero</strong>
            </button>
          )}

          {/* Canal selector */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Canal</label>
            <div className="segmented segmented-3">
              {canales.map((item) => (
                <button
                  className={canal === item ? "selected" : ""}
                  key={item}
                  onClick={() => onCanalChange(item)}
                  type="button"
                >
                  {item === "whatsapp" ? "WhatsApp" : item === "instagram" ? "Instagram" : "Facebook"}
                </button>
              ))}
            </div>
          </div>

          <label>
            Nombre del cliente
            <input
              placeholder="Ej. Valentina M."
              onChange={(e) => onClienteChange(e.target.value)}
              value={cliente}
            />
          </label>

          {canal === "whatsapp" && (
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                checked={crearOrdenReal}
                onChange={(event) => onCrearOrdenRealChange(event.target.checked)}
                type="checkbox"
              />
              <span>
                Crear orden real en POS
                <small style={{ display: "block", color: "var(--muted)", marginTop: 2 }}>
                  Solo se ejecuta después de la confirmación final.
                </small>
              </span>
            </label>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
              Mensaje recibido
            </label>
            <textarea
              placeholder="Escribe el mensaje que llegó del cliente..."
              onChange={(e) => onTextoChange(e.target.value)}
              rows={4}
              value={texto}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line-hover)", borderRadius: "var(--radius-sm)", fontSize: 14, resize: "vertical", outline: "none" }}
            />
          </div>

          {/* Quick examples */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Lightbulb size={12} /> Ejemplos rápidos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {EJEMPLOS.map((ej) => (
                <button
                  key={ej.texto}
                  type="button"
                  onClick={() => { onTextoChange(ej.texto); onClienteChange(ej.cliente); }}
                  style={{ textAlign: "left", padding: "7px 11px", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6, cursor: "pointer", lineHeight: 1.4, transition: "background 120ms" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                >
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{ej.cliente} · </span>{ej.texto}
                </button>
              ))}
            </div>
          </div>

          <button className="primary-button" disabled={loading} type="submit" style={{ width: "100%", justifyContent: "center", height: 40 }}>
            <Send size={15} />
            {loading ? "Procesando…" : historial.length > 0 ? "Enviar mensaje →" : "Probar agente →"}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="panel">
        <div className="panel-title">
          <div>
            <span>Resultado</span>
            <h2>Conversación simulada</h2>
          </div>
          {ultimaDecision?.requiereHumano ? (
            <AlertTriangle size={22} style={{ color: "var(--amber)" }} />
          ) : (
            <CheckCircle2 size={22} style={{ color: "var(--green)" }} />
          )}
        </div>

        {historial.length > 0 ? (
          <div className="agent-thread-card">
            <div className="agent-thread">
              {historial.map((mensaje) => (
                <article className={`agent-thread-message ${mensaje.rol}`} key={mensaje.id}>
                  <div className="agent-thread-bubble">
                    <span>{mensaje.rol === "cliente" ? mensaje.cliente : "Agente"}</span>
                    <p>{mensaje.texto}</p>
                  </div>

                  {mensaje.decision?.catalogoVisual && (
                    <div className="agent-visual-preview">
                      {esPdf(mensaje.decision.catalogoVisual.url, mensaje.decision.catalogoVisual.nombre) ? (
                        <a className="agent-file-preview" href={mensaje.decision.catalogoVisual.url} rel="noreferrer" target="_blank">
                          <FileText size={34} />
                          <span>Abrir catálogo completo en PDF</span>
                        </a>
                      ) : (
                        <Image
                          alt={mensaje.decision.catalogoVisual.nombre}
                          height={220}
                          src={mensaje.decision.catalogoVisual.url}
                          unoptimized
                          width={360}
                        />
                      )}
                      <div>
                        <strong>{mensaje.decision.catalogoVisual.nombre}</strong>
                        <span>{mensaje.decision.catalogoVisual.tipo.replace("_", " ")}</span>
                      </div>
                    </div>
                  )}
                </article>
              ))}

              {loading && (
                <article className="agent-thread-message agente">
                  <div className="agent-thread-bubble typing">
                    <span>Agente</span>
                    <p>Procesando respuesta...</p>
                  </div>
                </article>
              )}
            </div>

            {ultimaDecision && (
              <div className="agent-decision-strip">
                <span>🤖 {ultimaDecision.agente}</span>
                <span>{ultimaDecision.intencion}</span>
                <span className={ultimaDecision.requiereHumano ? "warn" : "ok"}>
                  {ultimaDecision.requiereHumano ? "Requiere humano" : "Respondido por IA"}
                </span>
                <span>Seguridad: {ultimaDecision.decisionSeguridad}</span>
              </div>
            )}

            <button className="ghost-button" onClick={onClearHistorial} type="button">
              <Trash2 size={14} />
              Limpiar conversación
            </button>
          </div>
        ) : (
          <div className="empty-state" style={{ flexDirection: "column", gap: 8, minHeight: 200 }}>
            <Bot size={32} style={{ color: "var(--soft)", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              La respuesta del agente aparecerá aquí: intención, canal, respuesta y nivel de seguridad.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
