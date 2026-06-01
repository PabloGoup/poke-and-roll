import { RefreshCw } from "lucide-react";
import { IntegracionEstado } from "@/app/types";

type Props = {
  integraciones: IntegracionEstado[];
  loading: boolean;
  onRefresh: () => void;
};

export function IntegrationStatus({ integraciones, loading, onRefresh }: Props) {
  return (
    <section className="panel" id="integraciones">
      <div className="panel-title">
        <div>
          <span>Estado real</span>
          <h2>Integraciones</h2>
        </div>
        <button className="icon-button" onClick={onRefresh} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={18} />
        </button>
      </div>

      <div className="integration-grid clean">
        {integraciones.map((item) => (
          <div className="integration" key={item.nombre}>
            <item.icono size={18} />
            <div>
              <strong>{item.nombre}</strong>
              <span>{item.detalle}</span>
            </div>
            <small className={item.activo ? "ok" : "pending"}>
              {item.activo ? "OK" : "Falta"}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
