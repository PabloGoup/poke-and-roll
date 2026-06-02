import { FormEvent } from "react";
import Image from "next/image";
import { AlertTriangle, Bot, CheckCircle2, FileText, ImagePlus, Lightbulb, Send } from "lucide-react";
import { Canal, DecisionResponse } from "@/app/types";

type Props = {
  canal: Canal;
  cliente: string;
  texto: string;
  decision: DecisionResponse | null;
  loading: boolean;
  onCanalChange: (canal: Canal) => void;
  onClienteChange: (value: string) => void;
  onTextoChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
  loading,
  onCanalChange,
  onClienteChange,
  onTextoChange,
  onSubmit,
  onConfigCatalogo
}: Props) {
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
            {loading ? "Procesando…" : "Probar agente →"}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="panel">
        <div className="panel-title">
          <div>
            <span>Resultado</span>
            <h2>Decisión del agente</h2>
          </div>
          {decision?.decision?.requiereHumano ? (
            <AlertTriangle size={22} style={{ color: "var(--amber)" }} />
          ) : (
            <CheckCircle2 size={22} style={{ color: "var(--green)" }} />
          )}
        </div>

        {decision?.decision ? (
          <div className="decision-card">
            <div className="decision-tags">
              <span style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>
                🤖 {decision.decision.agente}
              </span>
              <span style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
                {decision.decision.intencion}
              </span>
              <span style={{
                background: decision.decision.requiereHumano ? "var(--amber-soft)" : "var(--green-soft)",
                color: decision.decision.requiereHumano ? "var(--amber)" : "var(--green)"
              }}>
                {decision.decision.requiereHumano ? "⚠ Requiere humano" : "✓ Respondido por IA"}
              </span>
            </div>

            <div style={{ padding: "14px 16px", background: "#d9fdd3", borderRadius: "0 8px 8px 8px", position: "relative", fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>
              <div style={{ position: "absolute", top: 0, left: -8, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 8px 8px 0", borderColor: "transparent #d9fdd3 transparent transparent" }} />
              {decision.decision.respuesta}
            </div>

            {decision.decision.catalogoVisual && (
              <div className="agent-visual-preview">
                {esPdf(decision.decision.catalogoVisual.url, decision.decision.catalogoVisual.nombre) ? (
                  <a className="agent-file-preview" href={decision.decision.catalogoVisual.url} rel="noreferrer" target="_blank">
                    <FileText size={34} />
                    <span>Abrir catálogo completo en PDF</span>
                  </a>
                ) : (
                  <Image
                    alt={decision.decision.catalogoVisual.nombre}
                    height={220}
                    src={decision.decision.catalogoVisual.url}
                    unoptimized
                    width={360}
                  />
                )}
                <div>
                  <strong>{decision.decision.catalogoVisual.nombre}</strong>
                  <span>{decision.decision.catalogoVisual.tipo.replace("_", " ")}</span>
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: "var(--muted)", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--line)" }}>
              🛡 Seguridad: {decision.decision.decisionSeguridad}
            </div>
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
