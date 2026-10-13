"use client";
import { cn } from "@/lib/utils";

export function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-all border",
        activo ? "bg-sage-500 text-white border-sage-500" : "bg-white border-beige-200 text-gray-600 hover:bg-beige-100"
      )}
    >
      {children}
    </button>
  );
}
