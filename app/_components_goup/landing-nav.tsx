"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`goup-topnav ${scrolled ? "scrolled" : ""}`}>
      <nav className="goup-topnav-inner" aria-label="Principal">
        <Link href="/" className="goup-nav-brand">
          <Image src="/images/goup.png" alt="Goup Soluciones" width={96} height={32} priority />
        </Link>
        <div className="goup-nav-links">
          <a href="#demo">Probar IA</a>
          <a href="#gemelo">Cómo funciona</a>
          <a href="#simulador">Tu negocio</a>
          <a href="#plataforma">Plataforma</a>
        </div>
        <div className="goup-nav-actions">
          <a href="#contacto" className="goup-nav-connect">Agendar reunión</a>
          <Link href="/login" className="goup-nav-login">Acceder</Link>
        </div>
      </nav>
    </header>
  );
}
