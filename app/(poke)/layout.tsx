import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poke & Roll — Dashboard",
  description: "Agente omnicanal para WhatsApp, Instagram y contenido diario.",
};

export default function PokeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
