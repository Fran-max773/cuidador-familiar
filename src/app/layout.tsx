import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Cuidador Familiar",
  description: "Organiza los cuidados, reduce la carga mental y cuídate también tú.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#5a8a5a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-32 min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
