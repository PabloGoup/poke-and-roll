"use client";

import { useEffect } from "react";

/*
  Añade la clase js-reveal a <html> (desbloquea las transiciones CSS)
  y observa cada bloque de contenido para añadirle .visible al entrar
  en el viewport. Cero dependencias externas.
*/

const SELECTORS = [
  ".goup-section-head",
  ".goup-demo-stage",
  ".goup-twin-scroll",
  ".goup-sim-picker",
  ".goup-live-section .goup-window",
  ".goup-arch-stage",
  ".goup-cta-inner"
].join(",");

export function ScrollReveal() {
  useEffect(() => {
    document.documentElement.classList.add("js-reveal");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = document.querySelectorAll<HTMLElement>(SELECTORS);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
