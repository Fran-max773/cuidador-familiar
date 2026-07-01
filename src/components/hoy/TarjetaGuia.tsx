"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, X } from "lucide-react";

export function TarjetaGuia() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Link
      href="/guia"
      className="flex items-center gap-3 bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 rounded-3xl p-4 mb-4 active:scale-95 transition-transform"
    >
      <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center flex-shrink-0">
        <BookOpen size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sky-800 text-sm">¿Primera vez aquí?</p>
        <p className="text-sky-600 text-xs mt-0.5 truncate">
          Descubre cómo sacarle el máximo partido a la app →
        </p>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); setVisible(false); }}
        className="w-7 h-7 flex items-center justify-center text-sky-400 hover:text-sky-600 flex-shrink-0"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </Link>
  );
}
