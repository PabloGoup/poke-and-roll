import Link from "next/link";

export const metadata = {
  title: "Eliminacion de datos | Poke & Roll",
  description: "Instrucciones para solicitar eliminacion de datos de usuario."
};

export default function EliminacionDatosPage() {
  return (
    <main className="legal-shell">
      <section className="legal-card">
        <Link className="legal-back" href="/">
          Volver al panel
        </Link>
        <p className="legal-kicker">Poke & Roll</p>
        <h1>Eliminacion de datos de usuario</h1>
        <p className="legal-updated">Ultima actualizacion: 1 de junio de 2026</p>

        <div className="legal-content">
          <p>
            Los usuarios pueden solicitar la eliminacion de los datos asociados
            a sus conversaciones con Sushi Poke & Roll por WhatsApp, Instagram
            u otros canales oficiales conectados al sistema.
          </p>

          <h2>Como solicitar la eliminacion</h2>
          <p>
            Envia un mensaje al canal oficial de atencion de Sushi Poke & Roll
            con el texto: Solicito eliminar mis datos. Incluye el canal desde
            el que nos contactaste, por ejemplo WhatsApp o Instagram, y el
            numero o usuario asociado.
          </p>

          <h2>Que datos se eliminaran</h2>
          <p>
            Eliminaremos o anonimizaremos datos personales asociados al cliente,
            como identificadores de WhatsApp o Instagram, nombre, telefono,
            etiquetas, historial de mensajes y registros operativos que no sean
            necesarios para obligaciones legales, reclamos pendientes o
            seguridad del servicio.
          </p>

          <h2>Plazo de respuesta</h2>
          <p>
            Revisaremos la solicitud y responderemos dentro de un plazo
            razonable. Si existen pedidos, reclamos o procesos pendientes,
            podremos conservar la informacion estrictamente necesaria hasta
            cerrar el caso.
          </p>

          <h2>Confirmacion</h2>
          <p>
            Una vez completado el proceso, enviaremos una confirmacion por el
            mismo canal por el que fue realizada la solicitud, cuando sea
            posible.
          </p>
        </div>
      </section>
    </main>
  );
}
