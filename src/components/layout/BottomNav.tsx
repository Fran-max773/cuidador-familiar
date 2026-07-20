"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTareas } from "@/hooks/useTareas";
import { getSesion } from "@/hooks/useGrupo";

const items = [
  {
    href: "/",
    label: "Hoy",
    emoji: "🏠",
    activeText: "text-sage-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-sage-100",
  },
  {
    href: "/que-hago-si",
    label: "Qué hago",
    emoji: "💡",
    activeText: "text-amber-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-amber-50",
  },
  {
    href: "/bienestar",
    label: "Bienestar",
    emoji: "❤️",
    activeText: "text-rose-500",
    inactiveText: "text-gray-400",
    activeBg: "bg-rose-50",
  },
  {
    href: "/grupo",
    label: "Familia",
    emoji: "👨‍👩‍👧",
    activeText: "text-sky-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-sky-50",
  },
  {
    href: "/perfil",
    label: "Perfil",
    emoji: "👤",
    activeText: "text-violet-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-violet-50",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const { tareas } = useTareas();
  const miNombre = getSesion()?.miNombre ?? "";
  const tareasAsignadas = tareas.filter((t) => !t.completada && miNombre && t.asignadaA === miNombre).length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cf_perfil");
      if (!saved) { setPerfilIncompleto(true); return; }
      const p = JSON.parse(saved);
      setPerfilIncompleto(!p.nombre?.trim());
    } catch { setPerfilIncompleto(false); }
  }, []);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-beige-200 safe-area-pb safe-area-pl safe-area-pr print:hidden">
      <div className="max-w-2xl mx-auto flex">
        {items.map(({ href, label, emoji, activeText, inactiveText, activeBg }) => {
          const activo = pathname === href;
          const esPerfil = href === "/perfil";
          const esHoy = href === "/";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                activo ? activeText : inactiveText
              )}
            >
              <span className={cn(
                "relative w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-colors",
                activo ? activeBg : "bg-transparent"
              )}>
                {emoji}
                {esPerfil && perfilIncompleto && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                )}
                {esHoy && tareasAsignadas > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-sky-500 rounded-full border-2 border-white" />
                )}
              </span>
              <span className={cn("text-[10px]", activo ? "font-semibold" : "font-normal")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
