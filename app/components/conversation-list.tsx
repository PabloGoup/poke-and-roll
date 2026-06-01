import { BellRing, Instagram, Search, Send } from "lucide-react";
import { conversacionesDemo } from "@/lib/demo-data";

type Props = {
  alertResult: string | null;
  onSendAlert: () => void;
};

export function ConversationList({ alertResult, onSendAlert }: Props) {
  return (
    <section className="panel" id="conversaciones">
      <div className="inbox-header">
        <h2>Unified Inbox</h2>
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search conversations..." />
        </div>
      </div>

      <div className="filter-chips">
        <button className="active" type="button">All Messages</button>
        <button type="button">WhatsApp</button>
        <button type="button">Instagram</button>
        <button type="button">Escalated</button>
        <button className="alert-chip" onClick={onSendAlert} type="button">
          <BellRing size={15} />
          Probar alerta
        </button>
      </div>

      {alertResult && <div className="status-banner">{alertResult}</div>}

      <div className="conversation-list">
        {conversacionesDemo.map((item, index) => (
          <article className="conversation" key={`${item.cliente}-${item.hora}`}>
            <div className="customer-avatar">
              <span>{item.cliente.replace("@", "").slice(0, 2).toUpperCase()}</span>
              <em className={item.canal === "WhatsApp" ? "channel-wa" : "channel-ig"}>
                {item.canal === "WhatsApp" ? <WhatsappGlyph /> : <Instagram size={11} />}
              </em>
            </div>
            <div className="conversation-top">
              <div>
                <strong>{item.cliente}</strong>
                <span>
                  {item.canal} · {item.hora}
                </span>
              </div>
              <em className={`priority ${item.prioridad}`}>{item.estado}</em>
            </div>
            <p className="intent">{item.intencion}</p>
            <blockquote>{item.mensaje}</blockquote>
            <div className="reply-preview">
              <Send size={15} />
              <span>{item.respuesta}</span>
            </div>
            {index === 0 && <i className="active-bar" aria-hidden="true" />}
          </article>
        ))}
      </div>
    </section>
  );
}

function WhatsappGlyph() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.03 6.17a5.77 5.77 0 0 0-4.75 9.04l-.58 2.13 2.18-.57a5.75 5.75 0 0 0 3.15.8 5.77 5.77 0 0 0 0-11.4Zm3.38 8.2c-.15.42-.84.76-1.13.8-.25.02-.53.04-1.57-.4-1.07-.45-1.79-1.43-1.85-1.5-.05-.07-.44-.58-.44-1.13 0-.54.29-.81.39-.92.1-.11.22-.14.29-.14h.21c.07 0 .16 0 .24.2.1.24.35.85.38.91.03.06.05.13.01.21-.04.08-.06.12-.12.19l-.18.2c-.07.06-.13.13-.06.26.08.13.34.55.72.89.5.44.91.57 1.04.64.13.06.2.05.28-.04.08-.08.33-.38.42-.51.09-.14.18-.11.3-.07.12.05.76.36.89.43.13.06.22.1.25.15.03.05.03.31-.12.73Z" />
    </svg>
  );
}
