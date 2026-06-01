import { ShieldCheck } from "lucide-react";

export function SecurityPanel() {
  return (
    <section className="panel security" id="seguridad">
      <div>
        <ShieldCheck size={24} />
        <h2>Reglas de seguridad</h2>
      </div>
      <p>
        El agente no promete precios, descuentos, tiempos de despacho ni
        compensaciones si no existen en la base de datos. Los reclamos se
        derivan a humano cuando hay riesgo o informacion incompleta.
      </p>
    </section>
  );
}
