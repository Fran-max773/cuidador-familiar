"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/",
    label: "Hoy",
    emoji: "🏠",
    emojiActive: "🏡",
    activeText: "text-sage-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-sage-100",
  },
  {
    href: "/que-hago-si",
    label: "Qué hago",
    emoji: "💡",
    emojiActive: "💡",
    activeText: "text-amber-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-amber-50",
  },
  {
    href: "/bienestar",
    label: "Bienestar",
    emoji: "🌿",
    emojiActive: "🌿",
    activeText: "text-rose-500",
    inactiveText: "text-gray-400",
    activeBg: "bg-rose-50",
  },
  {
    href: "/grupo",
    label: "Familia",
    emoji: "👨‍👩‍👧",
    emojiActive: "👨‍👩‍👧",
    activeText: "text-sky-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-sky-50",
  },
  {
    href: "/perfil",
    label: "Perfil",
    emoji: "👤",
    emojiActive: "👤",
    activeText: "text-violet-600",
    inactiveText: "text-gray-400",
    activeBg: "bg-violet-50",
  },
  {
    href: "/emergencias",
    label: "SOS",
    emoji: "🆘",
    emojiActive: "🆘",
    activeText: "text-red-600",
    inactiveText: "text-red-400",
    activeBg: "bg-red-50",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-beige-200 safe-area-pb safe-area-pl safe-area-pr">
      <div className="max-w-2xl mx-auto flex">
        {items.map(({ href, label, emoji, activeText, inactiveText, activeBg }) => {
          const activo = pathname === href;
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
                "w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-colors",
                activo ? activeBg : "bg-transparent"
              )}>
                {emoji}
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
