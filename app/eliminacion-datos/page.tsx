import Link from "next/link";
import { ArrowLeft, Trash2, Clock, CheckCircle, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Eliminación de datos | Goup Soluciones",
  description:
    "Instrucciones para solicitar la eliminación de tus datos personales del sistema de agentes IA de Goup Soluciones.",
};

const steps = [
  {
    icon: Trash2,
    title: "Envía tu solicitud",
    description:
      "Escribe a privacidad@goup.cl o contacta directamente al negocio con el que interactuaste, indicando el canal (WhatsApp, Instagram o Facebook) y el número de teléfono o usuario asociado.",
  },
  {
    icon: Clock,
    title: "Revisamos en 72 horas",
    description:
      "Confirmamos la recepción de tu solicitud y verificamos los datos asociados. Si hay pedidos o reclamos pendientes, te informamos qué datos debemos conservar transitoriamente.",
  },
  {
    icon: CheckCircle,
    title: "Eliminación en 30 días",
    description:
      "Completamos la eliminación o anonimización de tus datos personales en un plazo máximo de 30 días hábiles desde la confirmación de la solicitud.",
  },
];

export default function EliminacionDatosPage() {
  return (
    <div className="goup-page">
      <div className="goup-cosmos" aria-hidden="true" />

      <main className="goup-legal-shell">
        <article className="goup-legal-card">

          <Link href="/" className="goup-legal-back">
            <ArrowLeft size={14} />
            Volver al inicio
          </Link>

          <p className="goup-legal-kicker">Goup Soluciones</p>
          <h1>Eliminación de datos</h1>
          <p className="goup-legal-updated">
            Última actualización: 3 de junio de 2026
          </p>

          <div className="goup-legal-content">

            <section className="goup-legal-section">
              <p>
                Goup Soluciones procesa datos personales en nombre de los
                negocios que utilizan nuestra plataforma de agentes IA en
                WhatsApp, Instagram y Facebook. Cumplimos con los{" "}
                <a
                  href="https://developers.facebook.com/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="goup-legal-link"
                >
                  Términos de la Plataforma de Meta
                </a>{" "}
                y garantizamos el derecho de cada usuario a solicitar la
                eliminación de sus datos.
              </p>
            </section>

            {/* Steps */}
            <section className="goup-legal-section">
              <h2>Proceso de eliminación</h2>
              <div className="goup-deletion-steps">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="goup-deletion-step">
                      <div className="goup-deletion-step-icon">
                        <Icon size={18} />
                      </div>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="goup-legal-section">
              <h2>Qué datos eliminamos</h2>
              <p>
                Al procesar una solicitud válida, eliminamos o anonimizamos:
              </p>
              <ul>
                <li>Número de teléfono e identificadores de cuenta de Meta (PSID / IGSID)</li>
                <li>Nombre de perfil y datos de contacto asociados</li>
                <li>Historial de conversaciones e intentos detectados</li>
                <li>Etiquetas, preferencias y notas operativas del perfil</li>
                <li>Registros de auditoría que contengan información personal identificable</li>
              </ul>
            </section>

            <section className="goup-legal-section">
              <h2>Datos que podemos retener temporalmente</h2>
              <div className="goup-legal-alert">
                <ShieldAlert size={16} />
                <p>
                  Podemos conservar información estrictamente necesaria para
                  cumplir obligaciones legales, resolver disputas o reclamos
                  pendientes, prevenir fraude o garantizar la seguridad del
                  servicio. En esos casos te informaremos qué datos retenemos
                  y por cuánto tiempo.
                </p>
              </div>
            </section>

            <section className="goup-legal-section">
              <h2>Eliminación solicitada desde Facebook</h2>
              <p>
                Si autorizaste una aplicación de Goup desde Facebook o
                Instagram y quieres revocar ese acceso y eliminar tus datos,
                puedes hacerlo desde{" "}
                <a
                  href="https://www.facebook.com/settings?tab=applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="goup-legal-link"
                >
                  Configuración de aplicaciones de Facebook
                </a>
                . Además, envíanos la confirmación a{" "}
                <a href="mailto:privacidad@goup.cl" className="goup-legal-link">
                  privacidad@goup.cl
                </a>{" "}
                para que procesemos la eliminación completa en nuestros
                sistemas.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>Confirmación</h2>
              <p>
                Una vez completado el proceso, enviamos una confirmación
                escrita por correo electrónico o por el canal desde el que
                se realizó la solicitud. Si no recibes respuesta en 72 horas,
                escríbenos directamente a{" "}
                <a href="mailto:privacidad@goup.cl" className="goup-legal-link">
                  privacidad@goup.cl
                </a>
                .
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>Más información</h2>
              <p>
                Consulta nuestra{" "}
                <Link href="/privacidad" className="goup-legal-link">
                  Política de privacidad
                </Link>{" "}
                para conocer en detalle cómo tratamos tus datos personales,
                qué proveedores utilizamos y cuáles son tus derechos.
              </p>
            </section>

          </div>
        </article>
      </main>
    </div>
  );
}
