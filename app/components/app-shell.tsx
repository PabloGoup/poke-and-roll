"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import {
  Bot,
  Facebook,
  Instagram,
  MessageCircle,
  LayoutDashboard,
  Settings
} from "lucide-react";
import { Vista } from "@/app/types";

type NavItem = { vista: Vista; label: string; icono: React.ElementType };

const navItems: NavItem[] = [
  { vista: "dashboard", label: "Overview", icono: LayoutDashboard },
  { vista: "whatsapp", label: "WhatsApp", icono: MessageCircle },
  { vista: "instagram", label: "Instagram", icono: Instagram },
  { vista: "facebook", label: "Facebook", icono: Facebook },
  { vista: "laboratorio", label: "Agente", icono: Bot },
  { vista: "configuracion", label: "Config", icono: Settings }
];

type Props = {
  children: ReactNode;
  vista: Vista;
  onVistaChange: (v: Vista) => void;
};

const CANAL_VISTAS: Vista[] = ["whatsapp", "instagram", "facebook"];

export function AppShell({ children, vista, onVistaChange }: Props) {
  const isCanal = CANAL_VISTAS.includes(vista);
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-logo-shell" aria-hidden="true">
            <Image alt="" className="topbar-logo" height={34} priority src="/images/Poke_n_Roll.png" width={34} />
          </span>
          <span className="topbar-brand">Sushi Poke & Roll</span>
        </div>

        <nav className="topbar-nav">
          {navItems.map((item) => (
            <button
              className={`topbar-link${vista === item.vista ? " active" : ""}`}
              key={item.vista}
              onClick={() => onVistaChange(item.vista)}
              type="button"
            >
              <item.icono size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="topbar-right">
          <Link className="topbar-link" href="/privacidad">Privacidad</Link>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      {!isCanal && (
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <Image alt="Poke & Roll" className="footer-logo" height={24} src="/images/Poke_n_Roll.png" width={24} />
              <span>Poke & Roll</span>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Canales</h4>
                <button onClick={() => onVistaChange("whatsapp")} type="button">WhatsApp</button>
                <button onClick={() => onVistaChange("instagram")} type="button">Instagram</button>
                <button onClick={() => onVistaChange("facebook")} type="button">Facebook</button>
              </div>
              <div className="footer-col">
                <h4>Herramientas</h4>
                <button onClick={() => onVistaChange("laboratorio")} type="button">Agente Lab</button>
                <button onClick={() => onVistaChange("configuracion")} type="button">Configuracion</button>
                <button onClick={() => onVistaChange("dashboard")} type="button">Overview</button>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <Link href="/privacidad">Política de privacidad</Link>
                <Link href="/eliminacion-datos">Eliminación de datos</Link>
              </div>
            </div>
            <div className="footer-bottom">
              <p>Poke & Roll — Agente omnicanal impulsado por IA</p>
              <p>WhatsApp · Instagram · Facebook Messenger</p>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile bottom nav — always visible */}
      <nav className="mobile-bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <button
            className={`nav-btn-mobile${vista === item.vista ? " active" : ""}`}
            key={item.vista}
            onClick={() => onVistaChange(item.vista)}
            type="button"
          >
            <item.icono size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
