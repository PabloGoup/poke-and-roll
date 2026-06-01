"use client";

import { useCallback, useEffect, useState } from "react";
import { Facebook, Instagram, RefreshCw, Search } from "lucide-react";
import { Canal, ConversacionDB } from "@/app/types";
import { conversacionesDemo } from "@/lib/demo-data";

type Props = {
  canal?: Canal;
};

const prioridadEstado: Record<string, string> = {
  esperando_humano: "alta",
  activa: "normal",
  resuelta: "normal",
  pausada: "media"
};

const labelEstado: Record<string, string> = {
  esperando_humano: "requiere humano",
  activa: "activa",
  resuelta: "resuelta",
  pausada: "pausada"
};

export function ChannelInbox({ canal }: Props) {
  const [conversaciones, setConversaciones] = useState<ConversacionDB[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "humano" | "activas">("todas");
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const url = canal ? `/api/conversaciones?canal=${canal}` : "/api/conversaciones";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) setConversaciones(data.conversaciones);
    } catch {
      // usa demo si falla
    } finally {
      setLoading(false);
    }
  }, [canal]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const lista = conversaciones ?? [];
  const usandoDemo = conversaciones === null;

  const filtradas = lista.filter((c) => {
    if (filtro === "humano" && !c.requiereHumano) return false;
    if (filtro === "activas" && c.estado !== "activa") return false;
    if (busqueda) {
      const nombre = c.cliente.nombre ?? c.cliente.whatsappId ?? c.cliente.instagramId ?? c.cliente.facebookId ?? "";
      if (!nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <section className="panel" id="conversaciones">
      <div className="inbox-header">
        <h2>Conversaciones</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Buscar cliente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <button className="icon-button" onClick={cargar} type="button" aria-label="Actualizar">
            <RefreshCw className={loading ? "spin" : ""} size={18} />
          </button>
        </div>
      </div>

      <div className="filter-chips">
        <button className={filtro === "todas" ? "active" : ""} onClick={() => setFiltro("todas")} type="button">Todas</button>
        <button className={filtro === "activas" ? "active" : ""} onClick={() => setFiltro("activas")} type="button">Activas</button>
        <button className={filtro === "humano" ? "active" : ""} onClick={() => setFiltro("humano")} type="button">Requieren humano</button>
        {usandoDemo && <span className="demo-badge">datos de demo</span>}
      </div>

      {usandoDemo ? (
        <DemoList canal={canal} />
      ) : filtradas.length === 0 ? (
        <div className="empty-state">No hay conversaciones{canal ? ` de ${canal}` : ""}.</div>
      ) : (
        <div className="conversation-list">
          {filtradas.map((c) => {
            const nombre = c.cliente.nombre ?? c.cliente.whatsappId ?? c.cliente.instagramId ?? c.cliente.facebookId ?? "Cliente";
            const ultimoMensaje = c.mensajes[0]?.texto ?? "";
            const ultimaRespuesta = c.decisiones[0]?.salida ?? "";
            const intencion = c.ultimaIntencion ?? c.decisiones[0]?.intencion ?? "consulta";
            const prioridad = c.requiereHumano ? "alta" : prioridadEstado[c.estado] ?? "normal";
            const estado = labelEstado[c.estado] ?? c.estado;
            const hora = new Date(c.actualizadoEn).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

            return (
              <article className="conversation" key={c.id}>
                <div className="customer-avatar">
                  <span>{nombre.replace("@", "").slice(0, 2).toUpperCase()}</span>
                  <em className={`channel-${c.canal}`}>
                    <CanalGlyph canal={c.canal} />
                  </em>
                </div>
                <div className="conversation-top">
                  <div>
                    <strong>{nombre}</strong>
                    <span>{c.canal} · {hora}</span>
                  </div>
                  <em className={`priority ${prioridad}`}>{estado}</em>
                </div>
                <p className="intent">{intencion}</p>
                <blockquote>{ultimoMensaje}</blockquote>
                {ultimaRespuesta && (
                  <div className="reply-preview">
                    <span>{ultimaRespuesta}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CanalGlyph({ canal }: { canal: Canal }) {
  if (canal === "whatsapp") return <WhatsappGlyph />;
  if (canal === "instagram") return <Instagram size={11} />;
  return <Facebook size={11} />;
}

function DemoList({ canal }: { canal?: Canal }) {
  const items = canal
    ? conversacionesDemo.filter((c) => c.canal.toLowerCase() === canal)
    : conversacionesDemo;

  return (
    <div className="conversation-list">
      {items.map((item) => (
        <article className="conversation" key={`${item.cliente}-${item.hora}`}>
          <div className="customer-avatar">
            <span>{item.cliente.replace("@", "").slice(0, 2).toUpperCase()}</span>
            <em className={item.canal === "WhatsApp" ? "channel-whatsapp" : "channel-instagram"}>
              {item.canal === "WhatsApp" ? <WhatsappGlyph /> : <Instagram size={11} />}
            </em>
          </div>
          <div className="conversation-top">
            <div>
              <strong>{item.cliente}</strong>
              <span>{item.canal} · {item.hora}</span>
            </div>
            <em className={`priority ${item.prioridad}`}>{item.estado}</em>
          </div>
          <p className="intent">{item.intencion}</p>
          <blockquote>{item.mensaje}</blockquote>
          <div className="reply-preview">
            <span>{item.respuesta}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function WhatsappGlyph() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.03 6.17a5.77 5.77 0 0 0-4.75 9.04l-.58 2.13 2.18-.57a5.75 5.75 0 0 0 3.15.8 5.77 5.77 0 0 0 0-11.4Zm3.38 8.2c-.15.42-.84.76-1.13.8-.25.02-.53.04-1.57-.4-1.07-.45-1.79-1.43-1.85-1.5-.05-.07-.44-.58-.44-1.13 0-.54.29-.81.39-.92.1-.11.22-.14.29-.14h.21c.07 0 .16 0 .24.2.1.24.35.85.38.91.03.06.05.13.01.21-.04.08-.06.12-.12.19l-.18.2c-.07.06-.13.13-.06.26.08.13.34.55.72.89.5.44.91.57 1.04.64.13.06.2.05.28-.04.08-.08.33-.38.42-.51.09-.14.18-.11.3-.07.12.05.76.36.89.43.13.06.22.1.25.15.03.05.03.31-.12.73Z" />
    </svg>
  );
}
