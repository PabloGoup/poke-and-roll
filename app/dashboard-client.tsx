"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  CalendarDays,
  Database,
  Facebook,
  Instagram,
  MessageCircle,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { AgentLab } from "@/app/components/agent-lab";
import { AppShell } from "@/app/components/app-shell";
import { ContentCalendar } from "@/app/components/content-calendar";
import { ChannelInbox } from "@/app/components/channel-inbox";
import { IntegrationStatus } from "@/app/components/integration-status";
import { SecurityPanel } from "@/app/components/security-panel";
import { WhatsAppModule } from "@/app/components/whatsapp-module";
import { InstagramModule } from "@/app/components/instagram-module";
import { FacebookModule } from "@/app/components/facebook-module";
import { Canal, DecisionResponse, HealthResponse, MetricasResponse, Vista } from "@/app/types";

export default function DashboardClient() {
  const [vista, setVista] = useState<Vista>("dashboard");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [metricas, setMetricas] = useState<MetricasResponse["metricas"] | null>(null);
  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [cliente, setCliente] = useState("Cliente prueba");
  const [texto, setTexto] = useState("Quiero una promo para 2 personas");
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [testingAgent, setTestingAgent] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);

  const integraciones = useMemo(() => {
    const d = health?.integraciones;
    return [
      {
        nombre: "Neon Postgres",
        activo: Boolean(health?.baseDatos.conectada),
        detalle: health?.baseDatos.conectada ? "Base conectada" : "Revisar DATABASE_URL",
        icono: Database
      },
      {
        nombre: "OpenAI",
        activo: Boolean(d?.openai),
        detalle: d?.openai ? "API configurada" : "Falta OPENAI_API_KEY",
        icono: Sparkles
      },
      {
        nombre: "Meta (App)",
        activo: Boolean(d?.metaApp && d?.metaToken),
        detalle: d?.metaToken ? "App y token listos" : "Falta token",
        icono: BadgeCheck
      },
      {
        nombre: "Instagram",
        activo: Boolean(d?.instagram),
        detalle: d?.instagram ? "Business ID listo" : "Falta INSTAGRAM_BUSINESS_ACCOUNT_ID",
        icono: Instagram
      },
      {
        nombre: "WhatsApp",
        activo: Boolean(d?.whatsapp),
        detalle: d?.whatsapp ? "API lista" : "Faltan credenciales WA",
        icono: MessageCircle
      },
      {
        nombre: "Facebook",
        activo: Boolean(d?.facebook),
        detalle: d?.facebook ? "Page token listo" : "Falta FACEBOOK_PAGE_ACCESS_TOKEN",
        icono: Facebook
      },
      {
        nombre: "n8n",
        activo: Boolean(d?.n8n),
        detalle: d?.n8n ? "Webhook listo" : "Modo simulado",
        icono: BellRing
      }
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
    setTestingAgent(true);
    setDecision(null);
    try {
      const res = await fetch("/api/agente/procesar-mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal, cliente, texto })
      });
      setDecision(await res.json());
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

  useEffect(() => {
    cargarHealth();
  }, []);

  const waInteg = integraciones.find((i) => i.nombre === "WhatsApp")!;
  const igInteg = integraciones.find((i) => i.nombre === "Instagram")!;
  const fbInteg = integraciones.find((i) => i.nombre === "Facebook")!;

  return (
    <AppShell vista={vista} onVistaChange={setVista}>
      {vista === "dashboard" && (
        <section className="main-grid">
          <div className="main-stack">
            <MetricasGrid metricas={metricas} onVistaChange={setVista} />
            <ChannelInbox />
          </div>
          <aside className="side-stack">
            <IntegrationStatus integraciones={integraciones} loading={healthLoading} onRefresh={cargarHealth} />
            <SecurityPanel />
          </aside>
        </section>
      )}

      {vista === "whatsapp" && <WhatsAppModule integracion={waInteg} />}
      {vista === "instagram" && <InstagramModule integracion={igInteg} />}
      {vista === "facebook" && <FacebookModule integracion={fbInteg} />}

      {vista === "laboratorio" && (
        <div className="main-stack">
          <AgentLab
            canal={canal}
            cliente={cliente}
            decision={decision}
            loading={testingAgent}
            onCanalChange={setCanal}
            onClienteChange={setCliente}
            onSubmit={probarAgente}
            onTextoChange={setTexto}
            texto={texto}
          />
        </div>
      )}

      {vista === "configuracion" && (
        <section className="main-grid">
          <div className="main-stack">
            <ContentCalendar />
          </div>
          <aside className="side-stack">
            <IntegrationStatus integraciones={integraciones} loading={healthLoading} onRefresh={cargarHealth} />
            <SecurityPanel />
            {alertResult && <div className="status-banner">{alertResult}</div>}
            <button className="primary-button" onClick={enviarAlerta} style={{ width: "100%" }} type="button">
              <BellRing size={18} /> Probar alerta n8n
            </button>
          </aside>
        </section>
      )}
    </AppShell>
  );
}

type MetricasGridProps = {
  metricas: MetricasResponse["metricas"] | null;
  onVistaChange: (v: Vista) => void;
};

function MetricasGrid({ metricas, onVistaChange }: MetricasGridProps) {
  const cards = [
    {
      titulo: "Conversaciones hoy",
      valor: metricas ? String(metricas.totalHoy) : "—",
      detalle: metricas
        ? `WA: ${metricas.porCanal.whatsapp} · IG: ${metricas.porCanal.instagram} · FB: ${metricas.porCanal.facebook}`
        : "Conecta Neon para ver datos reales",
      icono: MessageCircle,
      tono: "green",
      vista: null
    },
    {
      titulo: "Ventas asistidas",
      valor: metricas ? String(metricas.ventasHoy) : "—",
      detalle: "Intenciones de venta detectadas hoy",
      icono: TrendingUp,
      tono: "red",
      vista: null
    },
    {
      titulo: "Casos humanos",
      valor: metricas ? String(metricas.casosHumano) : "—",
      detalle: "Conversaciones esperando operador",
      icono: AlertTriangle,
      tono: "amber",
      vista: null
    },
    {
      titulo: "Contenido listo",
      valor: metricas ? String(metricas.contenidoPendiente) : "—",
      detalle: "Piezas aprobadas o programadas",
      icono: CalendarDays,
      tono: "blue",
      vista: "configuracion" as Vista
    }
  ];

  const tonos: Record<string, string> = {
    green: "summary-card summary-green",
    red: "summary-card summary-red",
    amber: "summary-card summary-amber",
    blue: "summary-card summary-blue"
  };

  return (
    <section className="summary-grid" id="inicio" aria-label="Resumen operativo">
      {cards.map((c) => (
        <article
          className={`${tonos[c.tono]}${c.vista ? " clickable-card" : ""}`}
          key={c.titulo}
          onClick={c.vista ? () => onVistaChange(c.vista!) : undefined}
          style={c.vista ? { cursor: "pointer" } : undefined}
        >
          <c.icono size={20} />
          <span>{c.titulo}</span>
          <strong>{c.valor}</strong>
          <p>{c.detalle}</p>
        </article>
      ))}
    </section>
  );
}
