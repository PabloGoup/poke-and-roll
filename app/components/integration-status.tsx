import { CheckCircle2, RefreshCw, XCircle, AlertCircle } from "lucide-react";
import { IntegracionEstado } from "@/app/types";

type Props = {
  integraciones: IntegracionEstado[];
  loading: boolean;
  onRefresh: () => void;
};

export function IntegrationStatus({ integraciones, loading, onRefresh }: Props) {
  const activas = integraciones.filter((i) => i.activo).length;
  const total = integraciones.length;

  return (
    <section className="panel" id="integraciones">
      <div className="panel-title">
        <div>
          <span>Estado en tiempo real</span>
          <h2>Integraciones</h2>
        </div>
        <button className="icon-button" onClick={onRefresh} title="Actualizar" type="button">
          <RefreshCw className={loading ? "spin" : ""} size={18} />
        </button>
      </div>

      {/* Summary bar */}
      <div className="integ-summary">
        <div className="integ-bar">
          <div className="integ-bar-fill" style={{ width: `${(activas / total) * 100}%` }} />
        </div>
        <span className="integ-summary-label">{activas} de {total} activas</span>
      </div>

      <div className="integration-grid clean">
        {integraciones.map((item) => (
          <div className={`integration ${item.activo ? "integ-ok" : "integ-warn"}`} key={item.nombre}>
            <div className="integ-icon-wrap">
              <item.icono size={16} />
            </div>
            <div className="integ-info">
              <strong>{item.nombre}</strong>
              <span>{item.detalle}</span>
            </div>
            <div className="integ-status">
              {item.activo ? (
                <CheckCircle2 size={16} className="integ-ok-icon" />
              ) : (
                <AlertCircle size={16} className="integ-warn-icon" />
              )}
              <small className={item.activo ? "ok" : "pending"}>
                {item.activo ? "Activo" : "Pendiente"}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
