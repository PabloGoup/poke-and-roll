"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Instagram, Link2, MessageSquare, PlugZap, ShieldCheck, Unplug, Webhook } from "lucide-react";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { ContentCalendar } from "@/app/components/content-calendar";
import { IntegracionEstado } from "@/app/types";

type Props = {
  integracion: IntegracionEstado;
};

type InstagramStatus = {
  ok: boolean;
  conectado: boolean;
  modo: "local" | "env" | "sin_configurar";
  instagram: {
    id: string | null;
    username: string | null;
    nombre: string | null;
    profilePictureUrl: string | null;
    error: string | null;
  };
  facebook: {
    pageId: string | null;
  };
  error?: string;
};

export function InstagramModule({ integracion }: Props) {
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  async function cargarEstadoInstagram() {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/meta/instagram/status", { cache: "no-store" });
      const data = (await res.json()) as InstagramStatus;
      setStatus(data);
    } finally {
      setLoadingStatus(false);
    }
  }

  function conectarInstagram() {
    window.location.href = "/api/meta/connect";
  }

  async function desconectarInstagram() {
    setDisconnecting(true);
    try {
      await fetch("/api/meta/instagram/status", { method: "POST" });
      await cargarEstadoInstagram();
    } finally {
      setDisconnecting(false);
    }
  }

  useEffect(() => {
    cargarEstadoInstagram();
  }, []);

  const conectado = Boolean(status?.conectado || integracion.activo);
  const username = status?.instagram.username;
  const profilePictureUrl = status?.instagram.profilePictureUrl;

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
          <span className={conectado ? "badge-ok" : "badge-pending"}>
            {conectado ? "Conectado" : "Sin configurar"}
          </span>
        </div>
      </div>

      <div className="instagram-connect-panel">
        <div className="instagram-connect-main">
          <div className="instagram-account-avatar">
            {profilePictureUrl ? (
              // Meta entrega la foto desde dominios variables, por eso usamos img nativo.
              <img src={profilePictureUrl} alt={username || "Instagram"} />
            ) : (
              <Instagram size={22} />
            )}
          </div>
          <div>
            <span className="module-section-label compact">
              <PlugZap size={14} />
              Conexion oficial Meta
            </span>
            <h3>{username ? `@${username}` : conectado ? "Instagram configurado" : "Conecta una cuenta profesional"}</h3>
            <p>
              {loadingStatus
                ? "Revisando estado de la integracion..."
                : conectado
                  ? "La app puede identificar la cuenta profesional, recibir DMs por webhook y responder con el token del local."
                  : "Usa este flujo para conectar una cuenta Business o Creator vinculada a una pagina de Facebook."}
            </p>
            {status?.instagram.error && <small>Error Meta: {status.instagram.error}</small>}
          </div>
        </div>
        <div className="instagram-connect-actions">
          <button className="secondary-btn" onClick={conectarInstagram} type="button">
            <Link2 size={16} />
            {conectado ? "Reconectar" : "Conectar Instagram"}
          </button>
          {status?.conectado && (
            <button className="secondary-btn danger" disabled={disconnecting} onClick={desconectarInstagram} type="button">
              <Unplug size={16} />
              {disconnecting ? "Desconectando..." : "Desconectar"}
            </button>
          )}
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
            <code>{status?.instagram.id || "INSTAGRAM_BUSINESS_ACCOUNT_ID"}</code>
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
