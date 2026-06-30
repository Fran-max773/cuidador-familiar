"use client";
import { useState } from "react";
import { Check, Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { useTareas } from "@/hooks/useTareas";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function TareasSection() {
  const { tareas, agregar, toggleCompletar, editar, eliminar, togglePrioridad } = useTareas();
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState("");

  const handleAgregar = () => {
    if (!nuevaTarea.trim()) return;
    agregar(nuevaTarea.trim());
    setNuevaTarea("");
  };

  const handleEditar = (id: string) => {
    if (!textoEdicion.trim()) return;
    editar(id, textoEdicion.trim());
    setEditandoId(null);
  };

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✅</span>
        <h2 className="text-lg font-semibold text-gray-800">Tareas pendientes</h2>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
          placeholder="Añadir tarea…"
          className="flex-1 px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
        />
        <Button onClick={handleAgregar} tamaño="md" aria-label="Añadir">
          <Plus size={18} />
        </Button>
      </div>

      {tareas.length === 0 ? (
        <Card>
          <p className="text-gray-500 font-medium mb-3">Ejemplos de tareas:</p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            <li>💊 Recoger receta en el médico</li>
            <li>🛒 Comprar pañales y toallitas</li>
            <li>📞 Llamar a la seguridad social</li>
            <li>🧺 Lavar ropa de cama</li>
            <li>🏥 Pedir cita con el neurólogo</li>
            <li>💈 Llevar a la peluquería</li>
            <li>📋 Renovar tarjeta sanitaria</li>
          </ul>
          <p className="text-gray-300 text-xs mt-3 text-center">Pulsa "+ Añadir" para crear tu primera tarea</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {[...pendientes, ...completadas].map((tarea) => {
            const esUrgente = tarea.prioridad === "alta";
            return (
              <Card
                key={tarea.id}
                className={cn(
                  "flex items-center gap-3",
                  tarea.completada && "opacity-60",
                  esUrgente && !tarea.completada && "border-red-300 bg-red-50/30"
                )}
              >
                <button
                  onClick={() => toggleCompletar(tarea.id)}
                  className={cn(
                    "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all",
                    tarea.completada
                      ? "bg-sage-500 border-sage-500 text-white"
                      : "border-sage-300 hover:border-sage-500"
                  )}
                >
                  {tarea.completada && <Check size={16} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  {editandoId === tarea.id ? (
                    <input
                      type="text"
                      value={textoEdicion}
                      onChange={(e) => setTextoEdicion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditar(tarea.id);
                        if (e.key === "Escape") setEditandoId(null);
                      }}
                      onBlur={() => handleEditar(tarea.id)}
                      autoFocus
                      className="w-full px-2 py-1 rounded-lg border border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {esUrgente && !tarea.completada && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
                            Urgente
                          </span>
                        )}
                        <p className={cn("text-gray-800", tarea.completada && "line-through")}>
                          {tarea.texto}
                        </p>
                      </div>
                      {tarea.completada && tarea.completadaPor && (
                        <p className="text-xs text-sage-500 mt-0.5">✓ {tarea.completadaPor}</p>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-0.5">
                  {!tarea.completada && (
                    <>
                      <button
                        onClick={() => togglePrioridad(tarea.id)}
                        className={cn(
                          "min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors",
                          esUrgente
                            ? "text-red-500 hover:text-red-700"
                            : "text-gray-300 hover:text-red-400"
                        )}
                        aria-label={esUrgente ? "Quitar urgencia" : "Marcar como urgente"}
                        title={esUrgente ? "Quitar urgencia" : "Marcar como urgente"}
                      >
                        <AlertTriangle size={15} />
                      </button>
                      <button
                        onClick={() => { setEditandoId(tarea.id); setTextoEdicion(tarea.texto); }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-sage-500 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => eliminar(tarea.id)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
