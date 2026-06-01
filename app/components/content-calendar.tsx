import { CalendarCheck, CircleDot } from "lucide-react";
import { contenidoDemo } from "@/lib/demo-data";

export function ContentCalendar() {
  return (
    <section className="panel" id="contenido">
      <div className="panel-title">
        <div>
          <span>Instagram</span>
          <h2>Contenido programado</h2>
        </div>
      </div>

      <div className="content-list">
        {contenidoDemo.map((item) => (
          <article className="content-row" key={item.titulo}>
            <div>
              <span>{item.tipo}</span>
              <h3>{item.titulo}</h3>
              <p>{item.idea}</p>
            </div>
            <div className="content-meta">
              <span>
                <CalendarCheck size={16} />
                {item.horario}
              </span>
              <span>
                <CircleDot size={16} />
                {item.piezas} piezas
              </span>
              <em>{item.estado}</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
