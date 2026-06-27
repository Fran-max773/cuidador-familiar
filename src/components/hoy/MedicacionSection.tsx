"use client";
import { useState } from "react";
import { Check, Plus, Trash2, Pill, CalendarRange, Clock, X } from "lucide-react";
import { useMedicacion } from "@/hooks/useMedicacion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

// ── Duraciones ──────────────────────────────────────────────────────────────

const DURACIONES = [
  { label: "Solo hoy",  dias: 0  },
  { label: "1 semana",  dias: 6  },
  { label: "1 mes",     dias: 29 },
  { label: "3 meses",   dias: 89 },
];

// Atajos para rellenar varias horas de golpe
const ATAJOS_HORAS = [
  { label: "Cada 12h (×2)", horas: ["08:00", "20:00"] },
  { label: "Cada 8h (×3)",  horas: ["08:00", "14:00", "22:00"] },
  { label: "Cada 6h (×4)",  horas: ["08:00", "14:00", "20:00", "02:00"] },
];

function sumarDias(base: string, dias: number): string {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().split("T")[0];
}

function diasRestantes(fechaFin: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((new Date(fechaFin + "T00:00:00").getTime() - hoy.getTime()) / 86400000);
}

// ── Componente ───────────────────────────────────────────────────────────────

export function MedicacionSection() {
  const { medicaciones, tomadaHoy, todasTomadas, agregar, toggleToma, eliminar } =
    useMedicacion();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre]             = useState("");
  const [horas, setHoras]               = useState<string[]>(["08:00"]);
  const [dosis, setDosis]               = useState("");
  const [duracionIdx, setDuracionIdx]   = useState(2); // 1 mes por defecto
  const [fechaFinCustom, setFechaFinCustom] = useState("");

  const hoyStr = new Date().toISOString().split("T")[0];

  // Gestión de horas en el formulario
  const addHora  = () => setHoras((h) => [...h, "08:00"]);
  const removeHora = (i: number) => setHoras((h) => h.filter((_, j) => j !== i));
  const setHora  = (i: number, v: string) =>
    setHoras((h) => h.map((x, j) => (j === i ? v : x)));

  const aplicarAtajo = (horasAtajo: string[]) => setHoras([...horasAtajo]);

  const handleGuardar = () => {
    if (!nombre.trim() || horas.length === 0) return;
    const horasOrdenadas = Array.from(new Set(horas)).sort();
    const fechaFin =
      duracionIdx === -1
        ? fechaFinCustom || hoyStr
        : sumarDias(hoyStr, DURACIONES[duracionIdx].dias);
    agregar({
      nombre: nombre.trim(),
      horas: horasOrdenadas,
      dosis: dosis.trim(),
      fechaInicio: hoyStr,
      fechaFin,
    });
    // Reset
    setNombre(""); setHoras(["08:00"]); setDosis("");
    setDuracionIdx(2); setFechaFinCustom("");
    setModalAbierto(false);
  };

  const pendientes  = medicaciones.filter((m) => !todasTomadas(m));
  const completadas = medicaciones.filter((m) =>  todasTomadas(m));

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pill size={18} className="text-sage-500" />
          <h2 className="text-lg font-semibold text-gray-800">Medicación de hoy</h2>
        </div>
        <Button variante="fantasma" tamaño="sm" onClick={() => setModalAbierto(true)}>
          <Plus size={16} /> Añadir
        </Button>
      </div>

      {medicaciones.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center font-medium py-1">
            Añádela una vez y aparecerá todos los días.
          </p>
          <p className="text-gray-400 text-sm text-center mt-1">
            No tendrás que volver a escribirla.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...pendientes, ...completadas].map((med) => {
            const todas = todasTomadas(med);
            const restantes = diasRestantes(med.fechaFin);
            return (
              <Card key={med.id} className={cn(todas && "opacity-60")}>
                {/* Cabecera del medicamento */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className={cn("font-semibold text-gray-800", todas && "line-through")}>
                      {med.nombre}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {med.dosis && (
                        <span className="text-sm text-gray-500">{med.dosis}</span>
                      )}
                      {restantes > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full">
                          <CalendarRange size={11} />
                          {restantes === 1 ? "último día" : `${restantes} días más`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => eliminar(med.id)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Eliminar medicamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Una fila por hora */}
                <div className="space-y-2">
                  {med.horas.map((hora) => {
                    const tomada = tomadaHoy(med, hora);
                    return (
                      <button
                        key={hora}
                        onClick={() => toggleToma(med.id, hora)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                          tomada
                            ? "bg-sage-100 text-sage-700"
                            : "bg-beige-50 hover:bg-beige-100 text-gray-700"
                        )}
                      >
                        <span
                          className={cn(
                            "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all",
                            tomada
                              ? "bg-sage-500 border-sage-500 text-white"
                              : "border-sage-300"
                          )}
                        >
                          {tomada && <Check size={14} strokeWidth={3} />}
                        </span>
                        <Clock size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-base">{hora}</span>
                        <span className={cn("text-sm ml-auto", tomada ? "text-sage-600" : "text-gray-400")}>
                          {tomada ? "Tomado" : "Pendiente"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
          <button
            onClick={() => setModalAbierto(true)}
            className="w-full text-sm text-sage-600 hover:text-sage-700 py-2 text-center font-medium transition-colors"
          >
            + ¿Toma más medicamentos? Añadir otro
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo="Añadir medicación"
      >
        <div className="space-y-5">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del medicamento
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Donepezilo"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
              autoFocus
            />
          </div>

          {/* Dosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosis (opcional)
            </label>
            <input
              type="text"
              value={dosis}
              onChange={(e) => setDosis(e.target.value)}
              placeholder="Ej: 5 mg"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Horas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora(s) de toma
            </label>

            {/* Atajos rápidos */}
            <div className="flex gap-2 flex-wrap mb-3">
              {ATAJOS_HORAS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => aplicarAtajo(a.horas)}
                  className="text-xs px-3 py-1.5 rounded-full border border-sage-300 text-sage-700 hover:bg-sage-50 transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Lista de horas */}
            <div className="space-y-2">
              {horas.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={h}
                    onChange={(e) => setHora(i, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
                  />
                  {horas.length > 1 && (
                    <button
                      onClick={() => removeHora(i)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Quitar esta hora"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addHora}
              className="mt-2 flex items-center gap-1.5 text-sm text-sage-600 hover:text-sage-700 font-medium"
            >
              <Plus size={15} /> Añadir otra hora
            </button>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Durante cuánto tiempo?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURACIONES.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDuracionIdx(i)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all border",
                    duracionIdx === i
                      ? "bg-sage-500 text-white border-sage-500"
                      : "border-beige-200 text-gray-600 hover:bg-beige-100"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <button
                onClick={() => setDuracionIdx(-1)}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-medium transition-all border",
                  duracionIdx === -1
                    ? "bg-sage-500 text-white border-sage-500"
                    : "border-beige-200 text-gray-600 hover:bg-beige-100"
                )}
              >
                Elegir fecha de fin
              </button>
              {duracionIdx === -1 && (
                <input
                  type="date"
                  value={fechaFinCustom}
                  min={hoyStr}
                  onChange={(e) => setFechaFinCustom(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <Button
              variante="secundario"
              className="flex-1"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleGuardar}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
