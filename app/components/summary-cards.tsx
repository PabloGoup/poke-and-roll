import { metricasPanel } from "@/lib/demo-data";

const tonos: Record<string, string> = {
  green: "summary-card summary-green",
  red: "summary-card summary-red",
  amber: "summary-card summary-amber",
  blue: "summary-card summary-blue"
};

export function SummaryCards() {
  return (
    <section className="summary-grid" id="inicio" aria-label="Resumen operativo">
      {metricasPanel.map((metrica) => (
        <article className={tonos[metrica.tono]} key={metrica.titulo}>
          <metrica.icono size={20} />
          <span>{metrica.titulo}</span>
          <strong>{metrica.valor}</strong>
          <p>{metrica.detalle}</p>
        </article>
      ))}
    </section>
  );
}
