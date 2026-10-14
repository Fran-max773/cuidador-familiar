import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORES = {
  sky:   "border-sky-200 text-sky-600 hover:bg-sky-50",
  amber: "border-amber-300 text-amber-700 hover:bg-amber-50",
  rose:  "border-rose-200 text-rose-600 hover:bg-rose-50",
};

export function BotonAnadir({ color, onClick }: { color: keyof typeof COLORES; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border-2 bg-white shadow-sm",
        "text-sm font-bold transition-colors active:scale-95",
        COLORES[color]
      )}
    >
      <Plus size={18} strokeWidth={2.75} /> Añadir
    </button>
  );
}
