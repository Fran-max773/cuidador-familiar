"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

const rutas: Record<string, string> = {
  "/que-hago-si": "Qué hago si…",
  "/bienestar":   "Mi bienestar",
  "/asistente":   "Asistente",
  "/perfil":      "Perfil",
  "/emergencias": "Emergencias",
  "/grupo":       "Grupo familiar",
};

export function Header() {
  const pathname = usePathname();
  const esHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-beige-200 safe-area-pt">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-sage-500 flex-shrink-0">
          <Heart size={22} fill="currentColor" />
        </Link>
        {esHome ? (
          <div>
            <p className="text-base font-bold text-sage-700 leading-tight">Cuidador Familiar</p>
            <p className="text-xs text-gray-400 leading-tight">Tu apoyo día a día</p>
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-gray-800">
            {rutas[pathname] ?? "Cuidador Familiar"}
          </h1>
        )}
      </div>
    </header>
  );
}
