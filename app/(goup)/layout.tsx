import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goup Soluciones",
  description:
    "La plataforma de IA para tu negocio. Automatiza WhatsApp, Instagram y Facebook.",
};

export default function GoupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
