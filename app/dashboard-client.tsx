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
import { ContentCalendar } from "@/app/components/content-calendar";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { CommercialConfig } from "@/app/components/commercial-config";
import { IntegrationStatus } from "@/app/components/integration-status";
import { SecurityPanel } from "@/app/components/security-panel";
import { Canal, DecisionResponse, HealthResponse, MensajeLaboratorio, MetricasResponse, Vista } from "@/app/types";

export default function DashboardClient() {
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

  return (
    <AppShell vista={vista} onVistaChange={setVista}>
      {vista === "dashboard" && (
        <div className="page-stack">
          <section className="brand-hero" aria-label="Sushi Poke and Roll">
            <div className="brand-hero-mark">
              <Image alt="Poke & Roll" height={96} priority src="/images/Poke_n_Roll.png" width={96} />
            </div>
            <h1>Sushi Poke & Roll</h1>
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
            onCanalChange={setCanal}
            onClienteChange={setCliente}
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
          <CommercialConfig />

          {/* Content planning — posts, stories, carousels */}
          <ContentCalendar />

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
import { conversacionesDemo } from "@/lib/demo-data";

function UrgentPanel({ onVistaChange }: { onVistaChange: (v: Vista) => void }) {
  const urgentes = conversacionesDemo.filter((c) => c.prioridad === "alta");
  if (urgentes.length === 0) return null;

  const canalMap: Record<string, "whatsapp" | "instagram" | "facebook"> = {
    WhatsApp: "whatsapp", Instagram: "instagram", Facebook: "facebook",
  };

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
            key={`${c.cliente}-${c.hora}`}
            className="urgent-item"
            onClick={() => onVistaChange(canalMap[c.canal] ?? "whatsapp")}
            type="button"
          >
            <div className="urgent-avatar">
              {c.cliente.replace("@", "").slice(0, 2).toUpperCase()}
            </div>
            <div className="urgent-body">
              <div className="urgent-top">
                <span className="urgent-name">{c.cliente}</span>
                <span className="urgent-canal">{c.canal} · {c.hora}</span>
              </div>
              <p className="urgent-msg">{c.mensaje}</p>
            </div>
            <span className="urgent-badge">⚠ Urgente</span>
          </button>
        ))}
      </div>
    </section>
  );
}
