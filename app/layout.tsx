import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sushi Poke & Roll",
  description: "Agente omnicanal para Sushi Poke & Roll.",
  icons: {
    icon: "/images/Poke_n_Roll.png",
    shortcut: "/images/Poke_n_Roll.png",
    apple: "/images/Poke_n_Roll.png"
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
