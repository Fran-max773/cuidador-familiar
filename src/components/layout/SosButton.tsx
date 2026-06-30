"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";

export function SosButton() {
  const pathname = usePathname();
  if (pathname === "/emergencias") return null;

  return (
    <Link
      href="/emergencias"
      className="fixed bottom-[5.5rem] right-4 z-50 print:hidden w-14 h-14 bg-red-500 hover:bg-red-600 active:scale-95 rounded-full shadow-xl flex flex-col items-center justify-center gap-0.5 transition-all"
      aria-label="Emergencias SOS"
    >
      <Phone size={20} className="text-white" fill="white" />
      <span className="text-white text-[9px] font-bold tracking-widest">SOS</span>
    </Link>
  );
}
