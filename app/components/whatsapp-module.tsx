import { MessageCircle, Phone, QrCode, ShieldCheck, Webhook } from "lucide-react";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { IntegracionEstado } from "@/app/types";

type Props = {
  integracion: IntegracionEstado;
};

export function WhatsAppModule({ integracion }: Props) {
  return (
    <div className="module-layout">
      <div className="module-header wa-header">
        <div className="module-header-brand">
          <div className="module-icon wa-icon">
            <MessageCircle size={28} />
          </div>
          <div>
            <h2>WhatsApp Business</h2>
            <span>Canal principal de atención al cliente</span>
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
          <Phone size={18} />
          <div>
            <strong>Webhook URL</strong>
            <code>/api/webhooks/whatsapp</code>
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
            <code>WHATSAPP_ACCESS_TOKEN · WHATSAPP_PHONE_NUMBER_ID</code>
          </div>
        </div>
        <div className="module-info-card">
          <QrCode size={18} />
          <div>
            <strong>Business Account</strong>
            <code>WHATSAPP_BUSINESS_ACCOUNT_ID</code>
          </div>
        </div>
      </div>

      <div className="module-flow">
        <h3>Flujo de mensajes</h3>
        <div className="flow-steps">
          <div className="flow-step">
            <span>1</span>
            <p>Meta envía el mensaje al webhook <code>/api/webhooks/whatsapp</code></p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>2</span>
            <p>El agente clasifica la intención (venta / reclamo / consulta) con OpenAI</p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>3</span>
            <p>Se persiste el mensaje en Neon y se envía la respuesta al cliente</p>
          </div>
          <div className="flow-arrow" />
          <div className="flow-step">
            <span>4</span>
            <p>Si es reclamo, se envía alerta vía WhatsApp al equipo de atención</p>
          </div>
        </div>
      </div>

      <ChannelInbox canal="whatsapp" />
    </div>
  );
}
