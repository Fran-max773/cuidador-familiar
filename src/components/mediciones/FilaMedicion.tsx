"use client";
import { Trash2 } from "lucide-react";
import type { Medicion } from "@/types";
import { TIPOS_MEDICION, formatearValor } from "@/lib/mediciones";
import { formatearFechaCorta } from "@/lib/utils";

interface Props {
  medicion: Medicion;
  mostrarFecha?: boolean;
  onEliminar?: (id: string) => void;
}

export function FilaMedicion({ medicion: m, mostrarFecha = true, onEliminar }: Props) {
  const cfg = TIPOS_MEDICION[m.tipo];
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-beige-200 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl flex-shrink-0" aria-hidden>
        {cfg.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800">
          <span className="text-lg font-semibold">{formatearValor(m)}</span>{" "}
          <span className="text-sm text-gray-500">{cfg.unidad}</span>
          <span className="text-sm text-gray-500"> · {cfg.corta}</span>
        </p>
        <p className="text-sm text-gray-500 truncate">
          {m.persona}
          {" · "}
          {mostrarFecha ? `${formatearFechaCorta(m.fecha)}, ` : ""}{m.hora}
          {m.privada && (
            <span className="ml-1.5 text-xs text-gray-400" title="Guardada solo en este dispositivo">🔒 Solo tú</span>
          )}
        </p>
        {(m.notas || m.registradaPor) && (
          <p className="text-xs text-gray-400 truncate">
            {m.notas}
            {m.notas && m.registradaPor ? " · " : ""}
            {m.registradaPor ? `Apuntado por ${m.registradaPor}` : ""}
          </p>
        )}
      </div>
      {onEliminar && (
        <button
          onClick={() => onEliminar(m.id)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
          aria-label="Eliminar medición"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
