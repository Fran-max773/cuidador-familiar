"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const rutas: Record<string, string> = {
  "/que-hago-si": "Qué hago si…",
  "/bienestar":   "Mi bienestar",
  "/asistente":   "Asistente",
  "/perfil":      "Perfil",
  "/emergencias": "Emergencias",
  "/grupo":       "Grupo familiar",
  "/historial":   "Historial e impresión",
};

export function Header() {
  const pathname = usePathname();
  const esHome = pathname === "/";

  return (
    <header className={cn(
      "sticky top-0 z-40 safe-area-pt",
      esHome
        ? "bg-gradient-to-r from-sage-700 to-sage-500"
        : "bg-gradient-to-r from-sky-500 to-sky-400 shadow-sm"
    )}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-white/90 flex-shrink-0">
          <Heart size={22} fill="currentColor" />
        </Link>
        {!esHome && (
          <h1 className="text-lg font-semibold text-white">
            {rutas[pathname] ?? "Cuidador Familiar"}
          </h1>
        )}
      </div>
    </header>
  );
}
