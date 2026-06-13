"use client";

import {
  Bot,
  Database,
  Instagram,
  LayoutDashboard,
  MessageCircle,
  Share2,
  Workflow,
  Cpu,
  ShieldCheck
} from "lucide-react";
import type { ComponentType } from "react";

/*
  Vista de arquitectura estilo "sistema operativo": tres capas conectadas por
  beams animados en CSS puro (sin JS) — barata de pintar y siempre fluida.
*/

type Module = {
  icon: ComponentType<{ size?: number | string }>;
  name: string;
  desc: string;
};

const CHANNELS: Module[] = [
  { icon: Share2, name: "Meta Business", desc: "Integración oficial verificada" },
  { icon: Instagram, name: "Instagram DM", desc: "Mensajes y comentarios" },
  { icon: MessageCircle, name: "WhatsApp API", desc: "WhatsApp Business Cloud" }
];

const OPS: Module[] = [
  { icon: Database, name: "CRM + Supabase", desc: "Datos en tiempo real, seguros" },
  { icon: Workflow, name: "Automatizaciones", desc: "Flujos que se ejecutan solos" },
  { icon: LayoutDashboard, name: "Dashboard", desc: "Control total del negocio" }
];

const CORE_TAGS = ["Entiende intenciones", "Aplica tus reglas", "Ejecuta acciones", "Escala a humanos"];

export function TechArchitecture() {
  return (
    <section className="goup-arch-section goup-landing-section" id="plataforma">
      <div className="goup-section-head">
        <span className="goup-section-kicker">La plataforma</span>
        <h2 className="goup-section-title">
          Un sistema operativo <span className="goup-title-gradient">para tu negocio.</span>
        </h2>
        <p className="goup-section-sub">
          No es un chatbot. Es una arquitectura completa donde cada capa conversa con la
          siguiente: canales oficiales, un cerebro IA y tu operación conectada.
        </p>
      </div>

      <div className="goup-arch-stage">
        {/* Capa 1: canales */}
        <div className="goup-arch-layer">
          <span className="goup-arch-layer-tag">Canales</span>
          <div className="goup-arch-row">
            {CHANNELS.map((m) => {
              const Icon = m.icon;
              return (
                <div className="goup-arch-module" key={m.name}>
                  <span className="goup-arch-module-icon"><Icon size={16} /></span>
                  <strong>{m.name}</strong>
                  <span>{m.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="goup-arch-beams" aria-hidden="true">
          <span /><span /><span />
        </div>

        {/* Capa 2: núcleo IA */}
        <div className="goup-arch-core">
          <div className="goup-arch-core-ring" aria-hidden="true" />
          <div className="goup-arch-core-body">
            <span className="goup-arch-core-icon"><Bot size={22} /></span>
            <div>
              <strong>Agente IA Goup</strong>
              <span><Cpu size={11} /> Entrenado con tu catálogo, precios y protocolos</span>
            </div>
            <span className="goup-arch-core-badge"><ShieldCheck size={12} /> Auditable</span>
          </div>
          <div className="goup-arch-core-tags">
            {CORE_TAGS.map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>

        <div className="goup-arch-beams goup-arch-beams-down" aria-hidden="true">
          <span /><span /><span />
        </div>

        {/* Capa 3: operación */}
        <div className="goup-arch-layer">
          <div className="goup-arch-row">
            {OPS.map((m) => {
              const Icon = m.icon;
              return (
                <div className="goup-arch-module" key={m.name}>
                  <span className="goup-arch-module-icon"><Icon size={16} /></span>
                  <strong>{m.name}</strong>
                  <span>{m.desc}</span>
                </div>
              );
            })}
          </div>
          <span className="goup-arch-layer-tag">Tu operación</span>
        </div>
      </div>
    </section>
  );
}
