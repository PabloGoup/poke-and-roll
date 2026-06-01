import { CalendarDays, Instagram, MessageSquare, ShieldCheck, Webhook } from "lucide-react";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { ContentCalendar } from "@/app/components/content-calendar";
import { IntegracionEstado } from "@/app/types";

type Props = {
  integracion: IntegracionEstado;
};

export function InstagramModule({ integracion }: Props) {
  return (
    <div className="module-layout">
      <div className="module-header ig-header">
        <div className="module-header-brand">
          <div className="module-icon ig-icon">
            <Instagram size={28} />
          </div>
          <div>
            <h2>Instagram</h2>
            <span>DMs, historias y contenido programado</span>
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
            <strong>Webhook DMs</strong>
            <code>/api/webhooks/instagram</code>
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
            <strong>Credenciales</strong>
            <code>META_ACCESS_TOKEN</code>
          </div>
        </div>
        <div className="module-info-card">
          <Instagram size={18} />
          <div>
            <strong>Business Account</strong>
            <code>INSTAGRAM_BUSINESS_ACCOUNT_ID</code>
          </div>
        </div>
      </div>

      <div className="module-flow">
        <h3>Flujo de mensajes</h3>
        <div className="flow-steps">
          <div className="flow-step">
            <span>1</span>
            <p>Meta envía el DM al webhook <code>/api/webhooks/instagram</code></p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>2</span>
            <p>El agente genera una respuesta con OpenAI y clasifica la intención</p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>3</span>
            <p>Se envía la respuesta via Instagram Messaging API y se guarda en Neon</p>
          </div>
        </div>
      </div>

      <div className="two-column">
        <ChannelInbox canal="instagram" />
        <div>
          <div className="module-section-label">
            <CalendarDays size={16} />
            <span>Contenido programado</span>
          </div>
          <ContentCalendar />
        </div>
      </div>
    </div>
  );
}
