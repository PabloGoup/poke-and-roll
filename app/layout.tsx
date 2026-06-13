import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Goup Soluciones — Empleados digitales con IA para tu negocio",
    template: "%s · Goup Soluciones"
  },
  description:
    "Automatizamos ventas, atención al cliente, reservas y operaciones con agentes IA entrenados para tu negocio. WhatsApp, Instagram y Meta, trabajando 24/7.",
  keywords: [
    "agentes IA",
    "automatización WhatsApp",
    "WhatsApp Business API",
    "chatbot Instagram",
    "CRM inteligente",
    "automatización de ventas",
    "atención al cliente IA",
    "Chile"
  ],
  openGraph: {
    title: "Goup Soluciones — Empleados digitales con IA",
    description:
      "Tu negocio no necesita más personal. Necesita inteligencia artificial. Agentes IA que venden, atienden y agendan 24/7.",
    type: "website",
    locale: "es_CL",
    siteName: "Goup Soluciones"
  },
  twitter: {
    card: "summary_large_image",
    title: "Goup Soluciones — Empleados digitales con IA",
    description:
      "Agentes IA que venden, atienden y agendan 24/7 en WhatsApp e Instagram."
  },
  icons: {
    icon: "/images/logo_goup.png",
    shortcut: "/images/logo_goup.png",
    apple: "/images/logo_goup.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
