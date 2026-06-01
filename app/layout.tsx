import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poke & Roll Agent",
  description: "Agente omnicanal para WhatsApp, Instagram y contenido diario."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
