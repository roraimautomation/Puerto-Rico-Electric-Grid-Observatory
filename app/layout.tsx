import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUR18 · Puerto Rico | Capacidad instalada",
  description: "Inventario de plantas de generación de Puerto Rico. Capacidad por tecnología y revisión semanal del inventario EIA-860M.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
