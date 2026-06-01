import { Facebook, MessageSquare, ShieldCheck, ThumbsUp, Webhook } from "lucide-react";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { IntegracionEstado } from "@/app/types";

type Props = {
  integracion: IntegracionEstado;
};

export function FacebookModule({ integracion }: Props) {
  return (
    <div className="module-layout">
      <div className="module-header fb-header">
        <div className="module-header-brand">
          <div className="module-icon fb-icon">
            <Facebook size={28} />
          </div>
          <div>
            <h2>Facebook Messenger</h2>
            <span>Mensajes directos desde la página de Facebook</span>
          </div>
        </div>
        <div className="module-status-badge">
          <span className={integracion.activo ? "badge-ok" : "badge-pending"}>
            {integracion.activo ? "Conectado" : "Sin configurar"}
          </span>
        </div>
      </div>

      <div className="module-info-grid">
        <div className="module-info-card">
          <MessageSquare size={18} />
          <div>
            <strong>Webhook Messenger</strong>
            <code>/api/webhooks/facebook</code>
          </div>
        </div>
        <div className="module-info-card">
          <Webhook size={18} />
          <div>
            <strong>Verificación</strong>
            <code>META_VERIFY_TOKEN</code>
          </div>
        </div>
        <div className="module-info-card">
          <ShieldCheck size={18} />
          <div>
            <strong>Token de página</strong>
            <code>FACEBOOK_PAGE_ACCESS_TOKEN</code>
          </div>
        </div>
        <div className="module-info-card">
          <Facebook size={18} />
          <div>
            <strong>Page ID</strong>
            <code>FACEBOOK_PAGE_ID</code>
          </div>
        </div>
      </div>

      <div className="module-flow">
        <h3>Flujo de mensajes</h3>
        <div className="flow-steps">
          <div className="flow-step">
            <span>1</span>
            <p>Facebook envía el mensaje al webhook <code>/api/webhooks/facebook</code></p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>2</span>
            <p>El agente clasifica y genera respuesta con OpenAI (misma lógica que los otros canales)</p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>3</span>
            <p>Se envía respuesta via <code>me/messages</code> con el Page Access Token y se persiste en Neon</p>
          </div>
        </div>
      </div>

      <div className="fb-setup-tip">
        <ThumbsUp size={18} />
        <div>
          <strong>Configuración en Meta Business Suite</strong>
          <p>Ve a Business Settings → Apps → Tu App → Messenger → Suscribir webhook con la URL y el token de verificación. Activa los permisos <code>messages</code> y <code>messaging_postbacks</code>.</p>
        </div>
      </div>

      <ChannelInbox canal="facebook" />
    </div>
  );
}
