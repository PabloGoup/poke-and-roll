import { FormEvent } from "react";
import { AlertTriangle, Bot, CheckCircle2, Send } from "lucide-react";
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
};

const canales: Canal[] = ["whatsapp", "instagram", "facebook"];

export function AgentLab({
  canal,
  cliente,
  texto,
  decision,
  loading,
  onCanalChange,
  onClienteChange,
  onTextoChange,
  onSubmit
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

          <label>
            Cliente
            <input
              onChange={(event) => onClienteChange(event.target.value)}
              value={cliente}
            />
          </label>

          <label>
            Mensaje recibido
            <textarea
              onChange={(event) => onTextoChange(event.target.value)}
              rows={4}
              value={texto}
            />
          </label>

          <button className="primary-button" disabled={loading} type="submit">
            <Send size={18} />
            {loading ? "Procesando..." : "Generar respuesta"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div>
            <span>Resultado</span>
            <h2>Decision del agente</h2>
          </div>
          {decision?.decision?.requiereHumano ? (
            <AlertTriangle size={22} />
          ) : (
            <CheckCircle2 size={22} />
          )}
        </div>

        {decision?.decision ? (
          <div className="decision-card">
            <div className="decision-tags">
              <span>{decision.decision.agente}</span>
              <span>{decision.decision.intencion}</span>
              <span>
                {decision.decision.requiereHumano ? "Requiere humano" : "Auto OK"}
              </span>
            </div>
            <p>{decision.decision.respuesta}</p>
            <small>Seguridad: {decision.decision.decisionSeguridad}</small>
          </div>
        ) : (
          <div className="empty-state">
            El resultado aparecera aca: agente, intencion, respuesta y seguridad.
          </div>
        )}
      </div>
    </section>
  );
}
