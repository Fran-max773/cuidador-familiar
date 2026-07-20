"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeartHandshake, ChevronLeft, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const rutas: Record<string, string> = {
  "/que-hago-si": "Qué hago si…",
  "/bienestar":   "Mi bienestar",
  "/asistente":   "Asistente",
  "/perfil":      "Perfil",
  "/emergencias": "Emergencias",
  "/grupo":       "Grupo familiar",
  "/historial":   "Historial e impresión",
  "/guia":        "Guía de uso",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const esHome = pathname === "/";

  return (
    <header className={cn(
      "sticky top-0 z-40 safe-area-pt print:hidden",
      esHome
        ? "bg-gradient-to-r from-warm-600 to-warm-300"
        : "bg-gradient-to-r from-warm-600 to-warm-300 shadow-sm"
    )}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2">
        {esHome ? (
          <>
            <Link href="/" className="flex items-center gap-2 text-white/90 flex-shrink-0">
              <HeartHandshake size={24} strokeWidth={2.25} />
            </Link>
            <Link
              href="/guia"
              className="ml-auto flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
              aria-label="Ayuda"
            >
              <HelpCircle size={18} />
              <span className="text-xs font-medium">Ayuda</span>
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center text-white/90 hover:text-white transition-colors flex-shrink-0 -ml-2 min-w-[44px] min-h-[44px]"
              aria-label="Volver"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>
            <h1 className="text-lg font-semibold text-white">
              {rutas[pathname] ?? "Cuidador Familiar"}
            </h1>
          </>
        )}
      </div>
    </header>
  );
}
