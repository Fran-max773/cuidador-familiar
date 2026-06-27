"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ abierto, onCerrar, titulo, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    if (abierto) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={cn(
          "bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col",
          "max-h-[92dvh] sm:max-h-[90vh]",
          "animate-in fade-in slide-in-from-bottom-4 duration-200",
          className
        )}
      >
        {/* Indicador de arrastre visible solo en móvil */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Cabecera fija */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 flex-shrink-0 border-b border-beige-100">
          <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-beige-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto overscroll-contain px-6 py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
