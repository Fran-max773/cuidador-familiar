"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, HelpCircle, Heart, MessageCircle, User, PhoneCall, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/",              label: "Hoy",        Icon: CalendarCheck, emergencia: false },
  { href: "/que-hago-si",   label: "Qué hago",   Icon: HelpCircle,    emergencia: false },
  { href: "/bienestar",     label: "Bienestar",  Icon: Heart,         emergencia: false },
  { href: "/grupo",         label: "Familia",    Icon: Users,         emergencia: false },
  { href: "/perfil",        label: "Perfil",     Icon: User,          emergencia: false },
  { href: "/emergencias",   label: "SOS",        Icon: PhoneCall,     emergencia: true  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-beige-200 safe-area-pb safe-area-pl safe-area-pr">
      <div className="max-w-2xl mx-auto flex">
        {items.map(({ href, label, Icon, emergencia }) => {
          const activo = pathname === href;
          if (emergencia) {
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors",
                  activo ? "text-red-600" : "text-red-400 hover:text-red-600"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  activo ? "bg-red-100" : "bg-red-50"
                )}>
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                <span>{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                activo ? "text-sage-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                size={22}
                strokeWidth={activo ? 2.5 : 1.8}
                fill={activo ? "currentColor" : "none"}
                className={activo ? "opacity-100" : "opacity-80"}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
