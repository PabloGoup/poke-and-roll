"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Paperclip, Search, Send, Smile } from "lucide-react";
import { Canal } from "@/app/types";

export type MensajeView = {
  id: string;
  texto: string;
  direccion: "entrada" | "salida";
  hora: string;
  fecha?: string;
};

export type ConversacionView = {
  id: string;
  nombre: string;
  canal: Canal;
  estado: string;
  requiereHumano: boolean;
  hora: string;
  intencion: string;
  mensajes: MensajeView[];
  noLeidos?: number;
};

type Props = { conv: ConversacionView | null };

export function ChatView({ conv }: Props) {
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState<MensajeView[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  useEffect(() => {
    setMensajes(conv?.mensajes ?? []);
    setTexto("");
    // Use requestAnimationFrame so the DOM has painted before we scroll
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [conv?.id]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [mensajes]);

  function enviar() {
    if (!texto.trim() || !conv) return;
    const nuevo: MensajeView = {
      id: Date.now().toString(),
      texto: texto.trim(),
      direccion: "salida",
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    };
    setMensajes((prev) => [...prev, nuevo]);
    setTexto("");
    inputRef.current?.focus();
  }

  if (!conv) return <ChatEmpty />;

  const grupos = agruparPorFecha(mensajes);

  return (
    <div className="wa-chat">
      {/* Header */}
      <div className="wa-chat-header">
        <div className="wa-chat-header-left">
          <div className="wa-chat-avatar">
            <span>{conv.nombre.replace("@", "").slice(0, 2).toUpperCase()}</span>
            <span className={`wa-avatar-badge channel-${conv.canal}`}>
              <CanalIcon canal={conv.canal} />
            </span>
          </div>
          <div className="wa-chat-header-info">
            <div className="wa-chat-name">{conv.nombre}</div>
            <div className="wa-chat-sub">
              {conv.requiereHumano ? (
                <span className="wa-tag wa-tag-human">⚠ Requiere humano</span>
              ) : (
                <span className="wa-tag wa-tag-bot">🤖 Respondido por IA</span>
              )}
              <span className="wa-tag-sep">·</span>
              <span className="wa-chat-intencion">{conv.intencion}</span>
            </div>
          </div>
        </div>
        <div className="wa-chat-header-actions">
          <button className="wa-icon-btn" aria-label="Buscar"><Search size={18} /></button>
          <button className="wa-icon-btn" aria-label="Más opciones"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages area */}
      <div className="wa-messages" ref={messagesRef}>
        <div className="wa-messages-inner">
          {grupos.map(([fecha, msgs]) => (
            <div key={fecha}>
              <div className="wa-date-chip"><span>{fecha}</span></div>
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`wa-bubble-row ${msg.direccion === "salida" ? "wa-out" : "wa-in"}`}
                >
                  <div className={`wa-bubble ${msg.direccion === "salida" ? "wa-bubble-out" : "wa-bubble-in"}`}>
                    <p className="wa-bubble-text">{msg.texto}</p>
                    <div className="wa-bubble-footer">
                      <span className="wa-bubble-time">{msg.hora}</span>
                      {msg.direccion === "salida" && (
                        <span className="wa-read-tick" aria-label="Entregado">
                          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                            <path d="M1 5.5L4.5 9L9 2" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 5.5L8.5 9L13 2" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="wa-input-bar">
        <button className="wa-icon-btn wa-input-icon" aria-label="Emoji"><Smile size={22} /></button>
        <button className="wa-icon-btn wa-input-icon" aria-label="Adjuntar"><Paperclip size={22} /></button>
        <div className="wa-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="wa-input"
            placeholder="Escribe un mensaje"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
            }}
          />
        </div>
        <button
          className={`wa-send-btn ${texto.trim() ? "active" : ""}`}
          onClick={enviar}
          aria-label="Enviar"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function ChatEmpty() {
  return (
    <div className="wa-chat-empty">
      <div className="wa-chat-empty-inner">
        <div className="wa-chat-empty-icon">
          <WhatsappBig />
        </div>
        <h3>Selecciona una conversación</h3>
        <p>Elige un chat de la lista para ver los mensajes</p>
      </div>
    </div>
  );
}

function agruparPorFecha(mensajes: MensajeView[]): [string, MensajeView[]][] {
  const grupos: Map<string, MensajeView[]> = new Map();
  mensajes.forEach((m) => {
    const fecha = m.fecha ?? "Hoy";
    if (!grupos.has(fecha)) grupos.set(fecha, []);
    grupos.get(fecha)!.push(m);
  });
  return Array.from(grupos.entries());
}

function CanalIcon({ canal }: { canal: Canal }) {
  if (canal === "whatsapp") return <WhatsappGlyph />;
  if (canal === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-chat)"/>
        <defs>
          <linearGradient id="ig-chat" x1="0" y1="24" x2="24" y2="0">
            <stop offset="0%" stopColor="#FD5949"/>
            <stop offset="100%" stopColor="#285AEB"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none"/>
        <circle cx="17" cy="7" r="1" fill="white"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" width="11" height="11">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2"/>
      <path d="M13.5 21v-7.5H16l.5-3H13.5V8.5c0-.83.5-1.5 1.5-1.5H17V4s-1.3-.25-2.5-.25C11.5 3.75 10 5.5 10 8v2.5H7.5v3H10V21h3.5z" fill="white"/>
    </svg>
  );
}

function WhatsappGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
      <path d="M12.03 6.17a5.77 5.77 0 0 0-4.75 9.04l-.58 2.13 2.18-.57a5.75 5.75 0 0 0 3.15.8 5.77 5.77 0 0 0 0-11.4Zm3.38 8.2c-.15.42-.84.76-1.13.8-.25.02-.53.04-1.57-.4-1.07-.45-1.79-1.43-1.85-1.5-.05-.07-.44-.58-.44-1.13 0-.54.29-.81.39-.92.1-.11.22-.14.29-.14h.21c.07 0 .16 0 .24.2.1.24.35.85.38.91.03.06.05.13.01.21-.04.08-.06.12-.12.19l-.18.2c-.07.06-.13.13-.06.26.08.13.34.55.72.89.5.44.91.57 1.04.64.13.06.2.05.28-.04.08-.08.33-.38.42-.51.09-.14.18-.11.3-.07.12.05.76.36.89.43.13.06.22.1.25.15.03.05.03.31-.12.73Z" />
    </svg>
  );
}

function WhatsappBig() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64" opacity="0.2">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.437A9.95 9.95 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.055-1.109l-.291-.173-3.018.897.912-2.949-.19-.302A7.95 7.95 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
    </svg>
  );
}
