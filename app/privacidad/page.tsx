import Link from "next/link";

export const metadata = {
  title: "Politica de privacidad | Poke & Roll",
  description: "Politica de privacidad del agente omnicanal de Poke & Roll."
};

export default function PrivacidadPage() {
  return (
    <main className="legal-shell">
      <section className="legal-card">
        <Link className="legal-back" href="/">
          Volver al panel
        </Link>
        <p className="legal-kicker">Poke & Roll</p>
        <h1>Politica de privacidad</h1>
        <p className="legal-updated">Ultima actualizacion: 1 de junio de 2026</p>

        <div className="legal-content">
          <p>
            Esta politica explica como Sushi Poke & Roll usa la informacion
            recibida a traves de WhatsApp Business, Instagram y otros canales
            oficiales para atender consultas, gestionar pedidos, responder
            reclamos y mejorar la comunicacion con clientes.
          </p>

          <h2>Datos que podemos tratar</h2>
          <p>
            Podemos recibir nombre de perfil, identificador de Instagram,
            numero de WhatsApp, mensajes enviados por el cliente, datos
            necesarios para gestionar pedidos, reclamos, consultas de despacho,
            retiro en local y preferencias entregadas voluntariamente.
          </p>

          <h2>Finalidad del uso</h2>
          <p>
            Usamos estos datos para responder mensajes, entregar informacion
            sobre menu, precios, horarios, promociones, medios de pago,
            cobertura de delivery, retiro en local, reclamos simples y
            seguimiento interno de atencion.
          </p>

          <h2>Uso de servicios externos</h2>
          <p>
            El sistema puede usar proveedores tecnologicos como Meta, WhatsApp
            Business Platform, Instagram, OpenAI, Neon Postgres, Vercel y n8n
            para procesar mensajes, almacenar datos operativos, generar
            respuestas y enviar alertas internas.
          </p>

          <h2>Base de datos y seguridad</h2>
          <p>
            Los datos se guardan en sistemas protegidos y se usan solo para
            fines operativos del negocio. No vendemos datos personales ni los
            usamos para fines ajenos a la atencion, venta y soporte del local.
          </p>

          <h2>Conservacion</h2>
          <p>
            Conservamos la informacion mientras sea necesaria para atencion,
            auditoria, reclamos, historial comercial o cumplimiento de
            obligaciones operativas. El cliente puede solicitar eliminacion de
            sus datos siguiendo el procedimiento indicado en la pagina de
            eliminacion de datos.
          </p>

          <h2>Contacto</h2>
          <p>
            Para dudas sobre privacidad o tratamiento de datos, escribir al
            canal oficial de atencion de Sushi Poke & Roll o solicitar soporte
            desde WhatsApp/Instagram indicando el motivo.
          </p>
        </div>
      </section>
    </main>
  );
}
