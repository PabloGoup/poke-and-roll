"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  Database,
  Facebook,
  Instagram,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { AgentLab } from "@/app/components/agent-lab";
import { AppShell } from "@/app/components/app-shell";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { CommercialConfig } from "@/app/components/commercial-config";
import { IntegrationStatus } from "@/app/components/integration-status";
import { SecurityPanel } from "@/app/components/security-panel";
import { Canal, DecisionResponse, HealthResponse, MensajeLaboratorio, MetricasResponse, Vista } from "@/app/types";

type DashboardClientProps = {
  localNombre?: string | null;
  localSlug?: string | null;
  rol?: string | null;
};

export default function DashboardClient({ localNombre, localSlug, rol }: DashboardClientProps = {}) {
  const [vista, setVista] = useState<Vista>("dashboard");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [metricas, setMetricas] = useState<MetricasResponse["metricas"] | null>(null);
  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [cliente, setCliente] = useState("Valentina M.");
  const [texto, setTexto] = useState("Hola! tienen opciones sin palta? soy alérgica");
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [historialLab, setHistorialLab] = useState<MensajeLaboratorio[]>([]);
  const [testingAgent, setTestingAgent] = useState(false);
  const [crearOrdenReal, setCrearOrdenReal] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);

  const integraciones = useMemo(() => {
    const d = health?.integraciones;
    return [
      { nombre: "Neon Postgres", activo: Boolean(health?.baseDatos.conectada), detalle: health?.baseDatos.conectada ? "Base conectada" : "Revisar DATABASE_URL", icono: Database },
      { nombre: "OpenAI", activo: Boolean(d?.openai), detalle: d?.openai ? "API configurada" : "Falta OPENAI_API_KEY", icono: Sparkles },
      { nombre: "Meta (App)", activo: Boolean(d?.metaApp && d?.metaToken), detalle: d?.metaToken ? "App y token listos" : "Falta token", icono: BadgeCheck },
      { nombre: "Instagram", activo: Boolean(d?.instagram), detalle: d?.instagram ? "Business ID listo" : "Falta INSTAGRAM_BUSINESS_ACCOUNT_ID", icono: Instagram },
      { nombre: "WhatsApp", activo: Boolean(d?.whatsapp), detalle: d?.whatsapp ? "API lista" : "Faltan credenciales WA", icono: MessageCircle },
      { nombre: "Facebook", activo: Boolean(d?.facebook), detalle: d?.facebook ? "Page token listo" : "Falta FACEBOOK_PAGE_ACCESS_TOKEN", icono: Facebook },
      { nombre: "n8n", activo: Boolean(d?.n8n), detalle: d?.n8n ? "Webhook listo" : "Modo simulado", icono: BellRing }
    ];
  }, [health]);

  async function cargarHealth() {
    setHealthLoading(true);
    try {
      const [healthRes, metricasRes] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/metricas", { cache: "no-store" })
      ]);
      setHealth(await healthRes.json());
      const md: MetricasResponse = await metricasRes.json();
      if (md.ok) setMetricas(md.metricas ?? null);
    } finally {
      setHealthLoading(false);
    }
  }

  async function probarAgente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const textoLimpio = texto.trim();
    if (!textoLimpio) return;

    const mensajeCliente: MensajeLaboratorio = {
      id: crypto.randomUUID(),
      rol: "cliente",
      texto: textoLimpio,
      canal,
      cliente,
      creadoEn: new Date().toISOString()
    };
    const historialPrevio = historialLab.slice(-10);

    setTestingAgent(true);
    setDecision(null);
    setHistorialLab((prev) => [...prev, mensajeCliente]);
    setTexto("");

    try {
      const res = await fetch("/api/agente/procesar-mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canal,
          cliente,
          texto: textoLimpio,
          crearOrdenReal,
          historial: historialPrevio.map((m) => ({ rol: m.rol, texto: m.texto }))
        })
      });
      const data: DecisionResponse = await res.json();
      setDecision(data);
      if (data.decision) {
        const mensajeAgente: MensajeLaboratorio = {
          id: crypto.randomUUID(),
          rol: "agente",
          texto: data.decision.respuesta,
          canal,
          cliente,
          creadoEn: new Date().toISOString(),
          decision: data.decision
        };
        setHistorialLab((prev) => [...prev, mensajeAgente]);
      }
    } finally {
      setTestingAgent(false);
    }
  }

  async function enviarAlerta() {
    setAlertResult("Enviando alerta...");
    const res = await fetch("/api/alertas/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "prueba_operativa", cliente, mensaje: texto })
    });
    const data = await res.json();
    setAlertResult(data.modo === "simulado" ? "Alerta simulada OK" : "Alerta enviada");
  }

  useEffect(() => { cargarHealth(); }, []);

  useEffect(() => {
    const vistaParam = new URLSearchParams(window.location.search).get("vista");
    if (vistaParam === "instagram") setVista("instagram");
  }, []);

  const isPokeLocal = localSlug === "poke-and-roll";
  const brandName = localNombre || (rol === "super_admin" ? "Goup Admin" : "Goup Local");
  const brandLogo = isPokeLocal ? "/images/Poke_n_Roll.png" : "/images/goup.png";

  return (
    <AppShell localNombre={localNombre} localSlug={localSlug} rol={rol} vista={vista} onVistaChange={setVista}>
      {vista === "dashboard" && (
        <div className="page-stack">
          <section className="brand-hero" aria-label={brandName}>
            <div className="brand-hero-mark">
              <Image alt={brandName} height={96} priority src={brandLogo} width={96} />
            </div>
            <h1>{brandName}</h1>
          </section>

          {/* Quick-access canal shortcuts + Agente Lab shortcut */}
          <div className="overview-canales">
            <button className="overview-canal-btn wa" onClick={() => setVista("whatsapp")} type="button">
              <MessageCircle size={16} /> WhatsApp
              {metricas && <span className="overview-canal-count">{metricas.porCanal.whatsapp}</span>}
            </button>
            <button className="overview-canal-btn ig" onClick={() => setVista("instagram")} type="button">
              <Instagram size={16} /> Instagram
              {metricas && <span className="overview-canal-count">{metricas.porCanal.instagram}</span>}
            </button>
            <button className="overview-canal-btn fb" onClick={() => setVista("facebook")} type="button">
              <Facebook size={16} /> Facebook
              {metricas && <span className="overview-canal-count">{metricas.porCanal.facebook}</span>}
            </button>
            <button className="overview-canal-btn lab" onClick={() => setVista("laboratorio")} type="button">
              <Sparkles size={16} /> Probar agente
            </button>
          </div>

          {/* Urgent: conversations requiring human attention */}
          <UrgentPanel onVistaChange={setVista} />

          <details className="status-section">
            <summary className="status-toggle">
              Estado de integraciones
              <span className="status-count">{integraciones.filter(i => i.activo).length}/{integraciones.length} activas</span>
            </summary>
            <div className="status-content">
              <IntegrationStatus integraciones={integraciones} loading={healthLoading} onRefresh={cargarHealth} />
              <SecurityPanel />
            </div>
          </details>
        </div>
      )}

      {(vista === "whatsapp" || vista === "instagram" || vista === "facebook") && (
        <div className="channel-fullview">
          <ChannelInbox canal={vista as "whatsapp" | "instagram" | "facebook"} />
        </div>
      )}

      {vista === "laboratorio" && (
        <div className="page-stack">
          <AgentLab
            canal={canal}
            cliente={cliente}
            decision={decision}
            historial={historialLab}
            loading={testingAgent}
            crearOrdenReal={crearOrdenReal}
            onCanalChange={setCanal}
            onClienteChange={setCliente}
            onCrearOrdenRealChange={setCrearOrdenReal}
            onConfigCatalogo={() => setVista("configuracion")}
            onSubmit={probarAgente}
            onTextoChange={setTexto}
            onClearHistorial={() => {
              setHistorialLab([]);
              setDecision(null);
            }}
            texto={texto}
          />
        </div>
      )}

      {vista === "configuracion" && (
        <div className="page-stack">
          <ReviewerGuide />
          <CommercialConfig />

          {/* Integrations & automation */}
          <details className="status-section" open>
            <summary className="status-toggle">Automatización e integraciones</summary>
            <div className="status-content">
              <IntegrationStatus integraciones={integraciones} loading={healthLoading} onRefresh={cargarHealth} />
              <SecurityPanel />
              {alertResult && <div className="status-banner">{alertResult}</div>}
              <button className="ghost-button" onClick={enviarAlerta} style={{ width: "100%", justifyContent: "center" }} type="button">
                <BellRing size={14} /> Probar alerta n8n
              </button>
            </div>
          </details>
        </div>
      )}
    </AppShell>
  );
}

/* ── Urgent conversations panel ── */
type ConvUrgente = {
  id: string;
  nombre: string;
  canal: string;
  hora: string;
  ultimoMensaje: string;
};

function UrgentPanel({ onVistaChange }: { onVistaChange: (v: Vista) => void }) {
  const [urgentes, setUrgentes] = useState<ConvUrgente[]>([]);

  useEffect(() => {
    fetch("/api/conversaciones?limite=50")
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) return;
        const lista: ConvUrgente[] = data.conversaciones
          .filter((c: { requiereHumano: boolean }) => c.requiereHumano)
          .map((c: {
            id: string;
            canal: string;
            actualizadoEn: string;
            cliente: { nombre?: string | null; whatsappId?: string | null; instagramId?: string | null; facebookId?: string | null };
            mensajes: { texto: string }[];
          }) => {
            const cl = c.cliente;
            const nombre = cl.nombre ?? cl.whatsappId ?? cl.instagramId ?? cl.facebookId ?? "Cliente";
            const ultimoMensaje = c.mensajes.length > 0 ? c.mensajes[c.mensajes.length - 1].texto : "";
            return {
              id: c.id,
              nombre,
              canal: c.canal,
              hora: new Date(c.actualizadoEn).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
              ultimoMensaje,
            };
          });
        setUrgentes(lista);
      })
      .catch(() => {});
  }, []);

  if (urgentes.length === 0) return null;

  return (
    <section className="panel urgent-panel">
      <div className="panel-title">
        <div>
          <span>Acción requerida</span>
          <h2>Conversaciones urgentes</h2>
        </div>
        <AlertTriangle size={20} style={{ color: "var(--amber)" }} />
      </div>
      <div className="urgent-list">
        {urgentes.map((c) => (
          <button
            key={c.id}
            className="urgent-item"
            onClick={() => onVistaChange(c.canal as Vista)}
            type="button"
          >
            <div className="urgent-avatar">
              {c.nombre.replace("@", "").slice(0, 2).toUpperCase()}
            </div>
            <div className="urgent-body">
              <div className="urgent-top">
                <span className="urgent-name">{c.nombre}</span>
                <span className="urgent-canal">{c.canal} · {c.hora}</span>
              </div>
              <p className="urgent-msg">{c.ultimoMensaje}</p>
            </div>
            <span className="urgent-badge">⚠ Urgente</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── Guía para revisores Meta ── */
import { BookOpen, CheckCircle, Info, MessageCircle as MsgIcon } from "lucide-react";

function ReviewerGuide() {
  return (
    <section className="panel reviewer-guide">
      <div className="panel-title">
        <div>
          <span>Para revisores</span>
          <h2>Guía de la plataforma GoUp Social AI</h2>
        </div>
        <BookOpen size={20} style={{ color: "var(--muted)" }} />
      </div>

      <div className="reviewer-what">
        <Info size={16} />
        <div>
          <strong>¿Qué es esta plataforma?</strong>
          <p>
            GoUp Social AI es un dashboard de gestión de mensajería omnicanal para restaurantes.
            Permite a negocios conectar sus cuentas de WhatsApp, Instagram y Facebook Messenger
            para atender a clientes con un agente de inteligencia artificial que responde consultas,
            recomienda productos y gestiona pedidos. El negocio puede ver y revisar todas las
            conversaciones desde este panel.
          </p>
        </div>
      </div>

      <div className="reviewer-steps">
        <h3>Cómo probar la integración con Meta</h3>
        <ol>
          <li>
            <CheckCircle size={15} />
            <div>
              <strong>Instagram DM</strong>
              <p>Envía un mensaje directo a <code>@pizza_and_roll</code> desde cualquier cuenta de Instagram. El agente responderá automáticamente. La conversación aparecerá en la pestaña <em>Instagram</em> de este dashboard.</p>
            </div>
          </li>
          <li>
            <CheckCircle size={15} />
            <div>
              <strong>Facebook Messenger</strong>
              <p>Envía un mensaje a la página de Facebook <em>Pizza and Roll</em>. El bot responderá y el hilo quedará registrado en la pestaña <em>Facebook</em>.</p>
            </div>
          </li>
          <li>
            <MsgIcon size={15} />
            <div>
              <strong>Credenciales de acceso al dashboard</strong>
              <p>Email: <code>revisor@goupsoluciones.cl</code> — Contraseña: <code>Revisor2025!</code></p>
            </div>
          </li>
        </ol>
      </div>

      <div className="reviewer-perms">
        <h3>Permisos de Meta utilizados</h3>
        <div className="reviewer-perm-grid">
          <div className="reviewer-perm-item">
            <strong>pages_show_list</strong>
            <span>Listar páginas accesibles para vincular el local correcto durante el onboarding OAuth.</span>
          </div>
          <div className="reviewer-perm-item">
            <strong>pages_manage_metadata</strong>
            <span>Suscribir el webhook de Messenger para recibir mensajes entrantes de la página de Facebook.</span>
          </div>
          <div className="reviewer-perm-item">
            <strong>pages_messaging</strong>
            <span>Enviar respuestas automáticas del agente vía Facebook Messenger.</span>
          </div>
          <div className="reviewer-perm-item">
            <strong>instagram_business_basic</strong>
            <span>Leer el perfil de la cuenta profesional (ID, username, foto) para mostrarla en el dashboard.</span>
          </div>
          <div className="reviewer-perm-item">
            <strong>instagram_business_manage_messages</strong>
            <span>Recibir y enviar DMs de Instagram a través del webhook oficial de la plataforma.</span>
          </div>
          <div className="reviewer-perm-item">
            <strong>whatsapp_business_messaging</strong>
            <span>Enviar y recibir mensajes de texto, imágenes y documentos vía WhatsApp Cloud API.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
