import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Goup Soluciones",
  description: "La plataforma de IA para tu negocio. Automatiza WhatsApp, Instagram y Facebook.",
  icons: {
    icon: "/images/goup.png",
    shortcut: "/images/goup.png",
    apple: "/images/goup.png"
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
