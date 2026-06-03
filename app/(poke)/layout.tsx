import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Panel — Goup Soluciones",
  description: "Panel operativo del agente omnicanal.",
};

export default function PokeLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
