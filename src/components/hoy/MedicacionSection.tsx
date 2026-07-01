"use client";
import { useState } from "react";
import { Check, Plus, Trash2, Pencil, Pill, CalendarRange, Clock, X, ChevronDown } from "lucide-react";
import type { Medicacion } from "@/types";
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
  { label: "1 al día (×1)",  horas: ["08:00"] },
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

// Genera los últimos N días anteriores a hoy con etiqueta legible
function diasAnteriores(n: number) {
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    const fecha = d.toISOString().split("T")[0];
    const etiqueta = i === 0
      ? `Ayer · ${d.getDate()} ${meses[d.getMonth()]}`
      : `Hace ${i + 1} días · ${d.getDate()} ${meses[d.getMonth()]}`;
    return { fecha, etiqueta };
  });
}

export function MedicacionSection() {
  const { medicaciones, medicacionesRecientes, tomadaHoy, todasTomadas, tomadaEn,
          agregar, editar, toggleToma, toggleTomaDia, eliminar } = useMedicacion();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [correccionAbierta, setCorreccionAbierta] = useState(false);
  const [editandoId, setEditandoId]     = useState<string | null>(null);
  const [nombre, setNombre]             = useState("");
  const [horas, setHoras]               = useState<string[]>(["08:00"]);
  const [dosis, setDosis]               = useState("");
  const [duracionIdx, setDuracionIdx]   = useState(2); // 1 mes por defecto
  const [fechaFinCustom, setFechaFinCustom] = useState("");

  const hoyStr = new Date().toISOString().split("T")[0];

  const abrirNuevo = () => {
    setEditandoId(null);
    setNombre(""); setHoras(["08:00"]); setDosis("");
    setDuracionIdx(2); setFechaFinCustom("");
    setModalAbierto(true);
  };

  const abrirEdicion = (med: Medicacion) => {
    setEditandoId(med.id);
    setNombre(med.nombre);
    setHoras([...med.horas]);
    setDosis(med.dosis);
    // Calcular duración aproximada para preseleccionar botón
    setDuracionIdx(-1);
    setFechaFinCustom(med.fechaFin);
    setModalAbierto(true);
  };

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
    const datos = {
      nombre: nombre.trim(), horas: horasOrdenadas,
      dosis: dosis.trim(), fechaInicio: hoyStr, fechaFin,
    };
    if (editandoId) {
      editar(editandoId, datos);
    } else {
      agregar(datos);
    }
    setModalAbierto(false);
  };

  const pendientes  = medicaciones.filter((m) => !todasTomadas(m));
  const completadas = medicaciones.filter((m) =>  todasTomadas(m));

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h2 className="text-lg font-semibold text-gray-800">Medicación de hoy</h2>
        </div>
        <Button variante="fantasma" tamaño="sm" onClick={abrirNuevo}>
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
                  <div className="flex flex-shrink-0">
                    <button
                      onClick={() => abrirEdicion(med)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-sage-500 transition-colors"
                      aria-label="Editar medicamento"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => eliminar(med.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Eliminar medicamento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
            onClick={abrirNuevo}
            className="w-full text-sm text-sage-600 hover:text-sage-700 py-2 text-center font-medium transition-colors"
          >
            + ¿Toma más medicamentos? Añadir otro
          </button>

          {/* ── Panel de corrección de días anteriores ── */}
          {medicacionesRecientes.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setCorreccionAbierta((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                <Clock size={12} />
                ¿Olvidaste marcar alguna toma anterior?
                <ChevronDown
                  size={12}
                  className={cn("transition-transform", correccionAbierta && "rotate-180")}
                />
              </button>

              {correccionAbierta && (
                <div className="mt-2 space-y-4 border-t border-beige-100 pt-3">
                  {diasAnteriores(3).map(({ fecha, etiqueta }) => {
                    const medsDelDia = medicacionesRecientes.filter(
                      (m) => m.fechaInicio <= fecha && fecha <= m.fechaFin
                    );
                    if (medsDelDia.length === 0) return null;
                    return (
                      <div key={fecha}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          {etiqueta}
                        </p>
                        <div className="space-y-1.5">
                          {medsDelDia.map((med) =>
                            med.horas.map((hora) => {
                              const tomada = tomadaEn(med, fecha, hora);
                              return (
                                <button
                                  key={`${med.id}-${hora}`}
                                  onClick={() => toggleTomaDia(med.id, fecha, hora)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left text-sm",
                                    tomada
                                      ? "bg-sage-100 text-sage-700"
                                      : "bg-beige-50 hover:bg-beige-100 text-gray-600"
                                  )}
                                >
                                  <span className={cn(
                                    "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all",
                                    tomada
                                      ? "bg-sage-500 border-sage-500 text-white"
                                      : "border-sage-300"
                                  )}>
                                    {tomada && <Check size={12} strokeWidth={3} />}
                                  </span>
                                  <span className="flex-1 font-medium">{med.nombre}</span>
                                  <span className="text-gray-400 flex-shrink-0">{hora}</span>
                                  <span className={cn("text-xs flex-shrink-0", tomada ? "text-sage-600" : "text-gray-400")}>
                                    {tomada ? "Tomado" : "No marcado"}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={editandoId ? "Editar medicación" : "Añadir medicación"}
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
