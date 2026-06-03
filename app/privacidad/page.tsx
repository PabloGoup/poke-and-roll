import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de privacidad | Goup Soluciones",
  description:
    "Política de privacidad de Goup Soluciones. Describe cómo tratamos los datos de usuarios que interactúan con agentes IA a través de WhatsApp, Instagram y Facebook.",
};

export default function PrivacidadPage() {
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
          <h1>Política de privacidad</h1>
          <p className="goup-legal-updated">
            Última actualización: 3 de junio de 2026
          </p>

          <div className="goup-legal-content">

            <section className="goup-legal-section">
              <p>
                Goup Soluciones SpA (&ldquo;Goup&rdquo;, &ldquo;nosotros&rdquo;) opera una plataforma
                de agentes de inteligencia artificial para negocios que
                utilizan canales oficiales de Meta: WhatsApp Business API,
                Instagram Messaging API y Facebook Messenger API. Esta
                política explica qué datos tratamos, con qué finalidad y
                cómo protegemos la información de quienes interactúan con
                esos agentes.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>1. Responsable del tratamiento</h2>
              <p>
                Goup Soluciones SpA actúa como encargado del tratamiento en
                nombre de los negocios (&ldquo;clientes de Goup&rdquo;) que contratan la
                plataforma. El negocio con quien el usuario interactúa es el
                responsable del tratamiento de sus datos personales. Goup
                procesa los datos siguiendo las instrucciones de cada
                negocio y las exigencias de los Términos de la Plataforma
                de Meta.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>2. Datos que podemos tratar</h2>
              <p>
                Al interactuar con un agente de Goup a través de un canal de
                Meta, el sistema puede recibir y procesar:
              </p>
              <ul>
                <li>Número de teléfono o identificador de cuenta de Meta (PSID/IGSID)</li>
                <li>Nombre de perfil público proporcionado por Meta</li>
                <li>Contenido de los mensajes enviados por el usuario</li>
                <li>Metadatos de la conversación: fecha, hora, canal y estado</li>
                <li>Información entregada voluntariamente: dirección de despacho,
                    preferencias de pedido, datos de reclamos</li>
              </ul>
              <p>
                No recopilamos contraseñas, datos de tarjetas de crédito ni
                información financiera directamente a través del agente.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>3. Uso de la Plataforma de Meta</h2>
              <p>
                Goup usa exclusivamente APIs oficiales de Meta (WhatsApp
                Business Platform, Instagram Graph API, Facebook Messenger
                Platform) y cumple con los{" "}
                <a
                  href="https://developers.facebook.com/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="goup-legal-link"
                >
                  Términos de la Plataforma de Meta
                </a>{" "}
                y las{" "}
                <a
                  href="https://developers.facebook.com/devpolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="goup-legal-link"
                >
                  Políticas para desarrolladores
                </a>
                . Los datos recibidos a través de estos canales se utilizan
                únicamente para proporcionar el servicio de atención al
                cliente del negocio correspondiente y no para ninguna
                finalidad publicitaria ni de perfilado de usuarios.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>4. Finalidad del tratamiento</h2>
              <p>
                Los datos se procesan con las siguientes finalidades:
              </p>
              <ul>
                <li>Responder consultas sobre menú, horarios, precios y disponibilidad</li>
                <li>Gestionar y confirmar pedidos para retiro o delivery</li>
                <li>Derivar reclamos, cancelaciones y casos sensibles a personal humano</li>
                <li>Auditar las decisiones del agente para control de calidad interno</li>
                <li>Generar métricas operativas agregadas y anónimas para el negocio</li>
              </ul>
            </section>

            <section className="goup-legal-section">
              <h2>5. Uso de modelos de inteligencia artificial</h2>
              <p>
                El agente puede usar modelos de lenguaje de terceros —
                incluyendo Google Gemini, Anthropic Claude y OpenAI — para
                generar respuestas. Los mensajes del usuario pueden ser
                enviados a estos servicios exclusivamente para producir la
                respuesta del agente. Goup no usa los datos de conversaciones
                para entrenar modelos propios ni de terceros.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>6. Almacenamiento y seguridad</h2>
              <p>
                Los datos se almacenan en servidores seguros con cifrado
                en tránsito (TLS) y en reposo. El acceso está restringido
                al personal operativo autorizado. No se comparten datos
                personales con terceros salvo los proveedores tecnológicos
                necesarios para operar el servicio (Meta, modelos de IA,
                proveedor de base de datos), todos bajo acuerdos de
                confidencialidad.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>7. Conservación de datos</h2>
              <p>
                Los datos de conversación se conservan mientras el negocio
                cliente mantenga activa su cuenta en Goup o mientras sea
                necesario para cumplir obligaciones legales, resolver
                reclamos pendientes o garantizar la seguridad del servicio.
                Una vez que el negocio cierra su cuenta o el usuario solicita
                la eliminación, los datos personales son eliminados o
                anonimizados en un plazo de 30 días hábiles, salvo
                exigencias legales contrarias.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>8. Derechos del usuario</h2>
              <p>
                De acuerdo con la legislación chilena (Ley 19.628) y,
                cuando corresponda, el Reglamento General de Protección de
                Datos (RGPD), el usuario tiene derecho a:
              </p>
              <ul>
                <li>Acceder a los datos personales que conservamos</li>
                <li>Solicitar la rectificación de datos inexactos</li>
                <li>Solicitar la eliminación de sus datos personales</li>
                <li>Oponerse al tratamiento o solicitar su limitación</li>
                <li>Presentar una reclamación ante la autoridad competente</li>
              </ul>
              <p>
                Para ejercer estos derechos, el usuario debe contactar
                directamente al negocio con el que interactuó, quien es el
                responsable del tratamiento. También puede escribirnos a{" "}
                <a href="mailto:privacidad@goup.cl" className="goup-legal-link">
                  privacidad@goup.cl
                </a>
                .
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>9. Datos de menores</h2>
              <p>
                El servicio no está dirigido a menores de 13 años. Si
                detectamos que se han recibido datos de un menor sin
                consentimiento parental, los eliminaremos de forma inmediata.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>10. Cambios a esta política</h2>
              <p>
                Podemos actualizar esta política para reflejar cambios en
                la plataforma, en los Términos de Meta o en la legislación
                aplicable. La fecha de última actualización se indica al
                inicio de este documento. El uso continuado del servicio
                después de publicar cambios implica aceptación de la
                política actualizada.
              </p>
            </section>

            <section className="goup-legal-section">
              <h2>11. Contacto</h2>
              <p>
                Para consultas sobre privacidad, tratamiento de datos o
                para ejercer sus derechos, puede contactarnos en:
              </p>
              <ul>
                <li>
                  Correo electrónico:{" "}
                  <a href="mailto:privacidad@goup.cl" className="goup-legal-link">
                    privacidad@goup.cl
                  </a>
                </li>
                <li>Razón social: Goup Soluciones SpA</li>
                <li>País: Chile</li>
              </ul>
              <p>
                Para solicitudes de eliminación de datos, consulte la página
                de{" "}
                <Link href="/eliminacion-datos" className="goup-legal-link">
                  eliminación de datos
                </Link>
                .
              </p>
            </section>

          </div>
        </article>
      </main>
    </div>
  );
}
