"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import {
  BellRing,
  Bot,
  CalendarDays,
  Facebook,
  Home,
  Instagram,
  MessageCircle,
  Settings
} from "lucide-react";
import { Vista } from "@/app/types";

type NavItem = {
  vista: Vista;
  label: string;
  icono: React.ElementType;
};

const navItems: NavItem[] = [
  { vista: "dashboard", label: "Dashboard", icono: Home },
  { vista: "whatsapp", label: "WhatsApp", icono: MessageCircle },
  { vista: "instagram", label: "Instagram", icono: Instagram },
  { vista: "facebook", label: "Facebook", icono: Facebook },
  { vista: "laboratorio", label: "Agente Lab", icono: Bot },
  { vista: "configuracion", label: "Configuración", icono: Settings }
];

const bottomItems: NavItem[] = [
  { vista: "dashboard", label: "Inicio", icono: Home },
  { vista: "whatsapp", label: "WhatsApp", icono: MessageCircle },
  { vista: "instagram", label: "Instagram", icono: Instagram },
  { vista: "facebook", label: "Facebook", icono: Facebook },
  { vista: "laboratorio", label: "Agente", icono: Bot }
];

type Props = {
  children: ReactNode;
  vista: Vista;
  onVistaChange: (v: Vista) => void;
};

export function AppShell({ children, vista, onVistaChange }: Props) {
  return (
    <main className="app-shell">
      <header className="mobile-topbar">
        <div className="mobile-brand">
          <Image alt="Poke & Roll" className="mobile-logo" height={40} priority src="/images/Poke_n_Roll.png" width={40} />
          <strong>Poke & Roll</strong>
        </div>
        <button className="mobile-icon" type="button" aria-label="Notificaciones">
          <BellRing size={21} />
        </button>
      </header>

      <aside className="sidebar">
        <div className="brand compact-brand">
          <Image alt="Poke & Roll" className="brand-logo" height={72} priority src="/images/Poke_n_Roll.png" width={72} />
          <div>
            <p>Poke & Roll</p>
            <span>Agente omnicanal</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Navegacion principal">
          {navItems.map((item) => (
            <button
              className={`nav-btn${vista === item.vista ? " active" : ""}`}
              key={item.vista}
              onClick={() => onVistaChange(item.vista)}
              type="button"
            >
              <item.icono size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="side-footer">
          <CalendarDays size={18} />
          <span>WhatsApp · Instagram · Facebook Messenger</span>
        </div>
      </aside>

      <section className="app-main">
        <header className="app-header">
          <div>
            <span>Poke & Roll · Agente IA</span>
            <h1>{labelVista(vista)}</h1>
          </div>
          <div className="header-actions">
            <Link className="ghost-button" href="/privacidad">Privacidad</Link>
            <button className="primary-button" onClick={() => onVistaChange("laboratorio")} type="button">
              Probar agente
            </button>
          </div>
        </header>

        {children}
      </section>

      <nav className="mobile-bottom-nav" aria-label="Navegacion movil">
        {bottomItems.map((item) => (
          <button
            className={`nav-btn-mobile${vista === item.vista ? " active" : ""}`}
            key={item.vista}
            onClick={() => onVistaChange(item.vista)}
            type="button"
          >
            <item.icono size={21} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function labelVista(v: Vista) {
  const labels: Record<Vista, string> = {
    dashboard: "Overview",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    laboratorio: "Agente Lab",
    configuracion: "Configuración"
  };
  return labels[v];
}
