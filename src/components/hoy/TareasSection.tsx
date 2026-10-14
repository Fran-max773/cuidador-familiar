"use client";
import { useState } from "react";
import { Check, Plus, Trash2, Pencil, AlertTriangle, Clock, ChevronDown, Bell, ArchiveX } from "lucide-react";
import { useTareas } from "@/hooks/useTareas";
import { useMiembros } from "@/hooks/useMiembros";
import { getSesion } from "@/hooks/useGrupo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MAX_PENDIENTES_VISIBLES = 5;

function etiquetaDiaPasado(fecha: string) {
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const [a, m, d] = fecha.split("-").map(Number);
  const dia = new Date(a, m - 1, d);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((hoy.getTime() - dia.getTime()) / 86400000);
  const corta = `${d} ${meses[m - 1]}`;
  return dias === 1 ? `Ayer · ${corta}` : `Hace ${dias} días · ${corta}`;
}

// Fila de pastillas para elegir a quién se asigna una tarea ("Libre" + cada miembro)
function SelectorAsignacion({
  miembros, valor, onCambiar,
}: { miembros: string[]; valor: string; onCambiar: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCambiar("")}
        className={cn(
          "text-xs px-3 py-1.5 rounded-full border transition-colors",
          valor === "" ? "bg-sage-500 text-white border-sage-500" : "border-beige-200 text-gray-600 hover:bg-beige-100"
        )}
      >
        Libre
      </button>
      {miembros.map((m) => (
        <button
          key={m}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCambiar(m)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border transition-colors",
            valor === m ? "bg-sky-500 text-white border-sky-500" : "border-beige-200 text-gray-600 hover:bg-beige-100"
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function TareasSection() {
  const { tareas, pendientesAnteriores, agregar, toggleCompletar, descartar, editar, eliminar, togglePrioridad, archivar } = useTareas();
  const miembros = useMiembros();
  const miNombre = getSesion()?.miNombre ?? "";
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [asignacionNueva, setAsignacionNueva] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState("");
  const [asignacionEdicion, setAsignacionEdicion] = useState("");
  const [verTodasPendientes, setVerTodasPendientes] = useState(false);

  const handleAgregar = () => {
    if (!nuevaTarea.trim()) return;
    agregar(nuevaTarea.trim(), "normal", asignacionNueva);
    setNuevaTarea("");
    setAsignacionNueva("");
  };

  const handleEditar = (id: string) => {
    if (!textoEdicion.trim()) return;
    editar(id, textoEdicion.trim(), asignacionEdicion);
    setEditandoId(null);
  };

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);
  const misAsignadas = pendientes.filter((t) => miNombre && t.asignadaA === miNombre);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✅</span>
        <h2 className="text-lg font-semibold text-gray-800">Tareas pendientes</h2>
      </div>

      {misAsignadas.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
          <Bell size={16} className="flex-shrink-0" />
          Tienes {misAsignadas.length === 1 ? "1 tarea asignada" : `${misAsignadas.length} tareas asignadas`} a ti
        </div>
      )}

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

      {miembros.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1.5">Asignar a:</p>
          <SelectorAsignacion miembros={miembros} valor={asignacionNueva} onCambiar={setAsignacionNueva} />
        </div>
      )}

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
                    <div className="space-y-2">
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
                      {miembros.length > 0 && (
                        <SelectorAsignacion miembros={miembros} valor={asignacionEdicion} onCambiar={setAsignacionEdicion} />
                      )}
                    </div>
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
                        {!tarea.completada && tarea.asignadaA && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0",
                            tarea.asignadaA === miNombre ? "text-sky-700 bg-sky-100" : "text-gray-500 bg-gray-100"
                          )}>
                            Para: {tarea.asignadaA}
                          </span>
                        )}
                      </div>
                      {tarea.creadaPor && tarea.creadaPor !== miNombre && (
                        <p className="text-[11px] text-gray-400 mt-0.5">Pedido por {tarea.creadaPor}</p>
                      )}
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
                        onClick={() => { setEditandoId(tarea.id); setTextoEdicion(tarea.texto); setAsignacionEdicion(tarea.asignadaA ?? ""); }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-sage-500 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                    </>
                  )}
                  {tarea.completada && (
                    <button
                      onClick={() => archivar(tarea.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-amber-500 transition-colors"
                      aria-label="Ya la he visto, quitar de aquí"
                      title="Ya la he visto, quitar de aquí"
                    >
                      <ArchiveX size={15} />
                    </button>
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

      {/* ── Tareas de días anteriores que nadie hizo: siguen pendientes hasta hacerlas o descartarlas ── */}
      {pendientesAnteriores.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-1">
            <Clock size={16} />
            Pendientes de días anteriores ({pendientesAnteriores.length})
          </p>
          <p className="text-xs text-amber-700/80 mb-3">
            Márcalas como hechas o descártalas si ya no hace falta hacerlas.
          </p>
          <div className="space-y-2">
            {(verTodasPendientes ? pendientesAnteriores : pendientesAnteriores.slice(0, MAX_PENDIENTES_VISIBLES)).map((tarea) => (
              <div key={tarea.id} className="flex items-center gap-2 bg-white rounded-xl border border-beige-200 pl-1 pr-2">
                <button
                  onClick={() => toggleCompletar(tarea.id)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                  aria-label={`Marcar como hecha: ${tarea.texto}`}
                >
                  <span className="w-6 h-6 rounded-full border-2 border-sage-300 hover:bg-sage-100 transition-colors" />
                </button>
                <div className="flex-1 min-w-0 py-2">
                  <p className="text-gray-800 text-sm font-medium">{tarea.texto}</p>
                  <p className="text-xs text-gray-400">
                    {etiquetaDiaPasado(tarea.fecha)}
                    {tarea.asignadaA ? ` · Para: ${tarea.asignadaA}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => descartar(tarea.id)}
                  className="min-h-[44px] px-2 text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  Descartar
                </button>
              </div>
            ))}
          </div>
          {pendientesAnteriores.length > MAX_PENDIENTES_VISIBLES && (
            <button
              onClick={() => setVerTodasPendientes((v) => !v)}
              className="w-full min-h-[44px] flex items-center justify-center gap-1 text-sm text-amber-700 font-medium mt-1"
            >
              {verTodasPendientes ? "Ver menos" : `Ver todas (${pendientesAnteriores.length})`}
              <ChevronDown size={16} className={cn("transition-transform", verTodasPendientes && "rotate-180")} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
