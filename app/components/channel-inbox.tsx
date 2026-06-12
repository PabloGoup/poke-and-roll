"use client";

import { useCallback, useEffect, useState } from "react";
import { Facebook, Instagram, RefreshCw, Search } from "lucide-react";
import { Canal, ConversacionDB } from "@/app/types";
import { ChatView, ConversacionView } from "./chat-view";

type Props = { canal?: Canal };

const labelEstado: Record<string, string> = {
  esperando_humano: "requiere humano",
  activa: "activa",
  resuelta: "resuelta",
  pausada: "pausada",
};

/* ── Convert ConversacionDB → ConversacionView ── */
function formatearNombre(c: ConversacionDB["cliente"], canal: Canal): string {
  if (c.nombre) return c.nombre;
  if (canal === "whatsapp" && c.whatsappId) {
    const n = c.whatsappId.replace(/\D/g, "");
    if (n.startsWith("56") && n.length === 11) return `+56 ${n.slice(2, 3)} ${n.slice(3, 7)} ${n.slice(7)}`;
    return `+${n}`;
  }
  if (canal === "instagram" && c.instagramId) return `IG ${c.instagramId.slice(-6)}`;
  if (canal === "facebook" && c.facebookId) return `FB ${c.facebookId.slice(-6)}`;
  return "Cliente";
}

function dbToView(c: ConversacionDB): ConversacionView {
  const nombre = formatearNombre(c.cliente, c.canal);
  return {
    id: c.id,
    nombre,
    canal: c.canal,
    estado: labelEstado[c.estado] ?? c.estado,
    requiereHumano: c.requiereHumano,
    hora: new Date(c.actualizadoEn).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    intencion: c.ultimaIntencion ?? c.decisiones[0]?.intencion ?? "consulta",
    mensajes: c.mensajes.map((m, i) => ({
      id: `${c.id}-${i}`,
      texto: m.texto,
      direccion: m.direccion === "saliente" ? "salida" : "entrada",
      hora: new Date(m.creadoEn).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
  };
}

/* ─────────────────────────────────────────────── */

export function ChannelInbox({ canal }: Props) {
  const [conversaciones, setConversaciones] = useState<ConversacionView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "humano" | "activas">("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selected, setSelected] = useState<ConversacionView | null>(null);
  const [mobileChat, setMobileChat] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const url = canal ? `/api/conversaciones?canal=${canal}` : "/api/conversaciones";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) setConversaciones(data.conversaciones.map(dbToView));
    } catch {
      setConversaciones([]);
    } finally {
      setLoading(false);
    }
  }, [canal]);

  useEffect(() => { cargar(); }, [cargar]);

  const lista = (conversaciones ?? []).filter((c) => !canal || c.canal === canal);

  const filtradas = lista.filter((c) => {
    if (filtro === "humano" && !c.requiereHumano) return false;
    if (filtro === "activas" && c.estado !== "activa") return false;
    if (busqueda && !c.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  function seleccionar(conv: ConversacionView) {
    setSelected(conv);
    setMobileChat(true);
  }

  return (
    <div className={`wa-inbox ${mobileChat ? "wa-inbox-mobile-chat" : ""}`}>
      {/* ── LEFT SIDEBAR ── */}
      <aside className="wa-sidebar">
        {/* Sidebar header */}
        <div className="wa-sidebar-header">
          <span className="wa-sidebar-title">
            {canal
              ? canal.charAt(0).toUpperCase() + canal.slice(1)
              : "Mensajes"}
          </span>
          <button
            className="wa-icon-btn"
            onClick={cargar}
            aria-label="Actualizar"
            title="Actualizar"
          >
            <RefreshCw size={17} className={loading ? "spin" : ""} />
          </button>
        </div>

        {/* Search */}
        <div className="wa-search-wrap">
          <div className="wa-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar o iniciar un chat"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="wa-chips">
          {(["todas", "activas", "humano"] as const).map((f) => (
            <button
              key={f}
              className={`wa-chip ${filtro === f ? "active" : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f === "todas" ? "Todos" : f === "activas" ? "Activas" : "🚨 Humano"}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="wa-conv-list">
          {filtradas.length === 0 ? (
            <div className="wa-empty">No hay conversaciones</div>
          ) : (
            filtradas.map((c) => (
              <button
                key={c.id}
                className={`wa-conv-item ${selected?.id === c.id ? "active" : ""}`}
                onClick={() => seleccionar(c)}
              >
                <div className="wa-conv-avatar">
                  <span>{c.nombre.replace("@", "").slice(0, 2).toUpperCase()}</span>
                  <span className={`wa-avatar-badge channel-${c.canal}`}>
                    <CanalIcon canal={c.canal} />
                  </span>
                </div>
                <div className="wa-conv-body">
                  <div className="wa-conv-top">
                    <span className="wa-conv-name">{c.nombre}</span>
                    <span className="wa-conv-time">{c.hora}</span>
                  </div>
                  <div className="wa-conv-bottom">
                    <span className="wa-conv-last">
                      {c.mensajes.length > 0
                        ? c.mensajes[c.mensajes.length - 1].texto
                        : c.intencion}
                    </span>
                    {c.noLeidos ? (
                      <span className={`wa-unread ${c.requiereHumano ? "red" : ""}`}>
                        {c.noLeidos}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── RIGHT CHAT PANEL ── */}
      <main className="wa-main">
        {mobileChat && (
          <button
            className="wa-back-btn"
            onClick={() => setMobileChat(false)}
          >
            ← Volver
          </button>
        )}
        <ChatView conv={selected} />
      </main>
    </div>
  );
}

function CanalIcon({ canal }: { canal: Canal }) {
  if (canal === "whatsapp") return <WhatsappGlyph />;
  if (canal === "instagram") return <Instagram size={10} />;
  return <Facebook size={10} />;
}

function WhatsappGlyph() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="10" height="10">
      <path d="M12.03 6.17a5.77 5.77 0 0 0-4.75 9.04l-.58 2.13 2.18-.57a5.75 5.75 0 0 0 3.15.8 5.77 5.77 0 0 0 0-11.4Zm3.38 8.2c-.15.42-.84.76-1.13.8-.25.02-.53.04-1.57-.4-1.07-.45-1.79-1.43-1.85-1.5-.05-.07-.44-.58-.44-1.13 0-.54.29-.81.39-.92.1-.11.22-.14.29-.14h.21c.07 0 .16 0 .24.2.1.24.35.85.38.91.03.06.05.13.01.21-.04.08-.06.12-.12.19l-.18.2c-.07.06-.13.13-.06.26.08.13.34.55.72.89.5.44.91.57 1.04.64.13.06.2.05.28-.04.08-.08.33-.38.42-.51.09-.14.18-.11.3-.07.12.05.76.36.89.43.13.06.22.1.25.15.03.05.03.31-.12.73Z" />
    </svg>
  );
}
