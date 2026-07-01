"use client";
import { useState } from "react";
import { Plus, Trash2, MapPin, Check, Clock } from "lucide-react";
import { useCitas } from "@/hooks/useCitas";
import type { Cita } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatearFechaCorta, diasHasta } from "@/lib/utils";

const TIPOS: { valor: Cita["tipo"]; etiqueta: string }[] = [
  { valor: "medico",   etiqueta: "Médico" },
  { valor: "hospital", etiqueta: "Hospital" },
  { valor: "analisis", etiqueta: "Análisis" },
  { valor: "otro",     etiqueta: "Otro" },
];

const COLORES_TIPO: Record<Cita["tipo"], string> = {
  medico:   "bg-blue-100 text-blue-700",
  hospital: "bg-purple-100 text-purple-700",
  analisis: "bg-amber-100 text-amber-700",
  otro:     "bg-gray-100 text-gray-600",
};

export function CitasSection() {
  const { citas, agregar, marcarRealizada, eliminar } = useCitas();
  const hoy = new Date().toISOString().split("T")[0];
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState<Omit<Cita, "id">>({
    tipo: "medico",
    titulo: "",
    fecha: "",
    hora: "10:00",
    lugar: "",
    notas: "",
  });

  const handleGuardar = () => {
    if (!form.titulo.trim() || !form.fecha) return;
    agregar(form);
    setForm({ tipo: "medico", titulo: "", fecha: "", hora: "10:00", lugar: "", notas: "" });
    setModalAbierto(false);
  };

  const citasHoy = citas.filter((c) => c.fecha === hoy && !c.realizada);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗓️</span>
          <h2 className="text-lg font-semibold text-gray-800">Próximas citas</h2>
        </div>
        <Button variante="fantasma" tamaño="sm" onClick={() => setModalAbierto(true)}>
          <Plus size={16} /> Añadir
        </Button>
      </div>

      {citasHoy.length > 0 && (
        <div className="mb-3 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🗓️</span>
          <div>
            <p className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-1">
              ¡Cita hoy!
            </p>
            {citasHoy.map((c) => (
              <div key={c.id}>
                <p className="font-semibold text-gray-800 text-base">{c.titulo}</p>
                <p className="text-sm text-gray-600">
                  {c.hora}{c.lugar ? ` · ${c.lugar}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {citas.some((c) => c.fecha < hoy && !c.realizada) && (
        <p className="text-sm text-gray-400 mb-3 text-center">
          Tienes citas pasadas sin confirmar — pulsa el círculo para marcarlas como realizadas
        </p>
      )}

      {citas.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center font-medium py-1">
            Anota las citas con fecha y hora fija.
          </p>
          <p className="text-gray-400 text-sm text-center mt-1">
            Ej: Neurólogo · Análisis de sangre · Fisioterapia
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {citas.slice(0, 8).map((cita) => {
            const dias = diasHasta(cita.fecha);
            const pasada = cita.fecha <= hoy;
            return (
              <Card
                key={cita.id}
                className={cn(
                  "flex items-center gap-3",
                  pasada && !cita.realizada && "border-amber-200 bg-amber-50/40",
                  cita.realizada && "opacity-60"
                )}
              >
                {/* Círculo check — igual que en Medicación */}
                <button
                  onClick={() => pasada && marcarRealizada(cita.id, !cita.realizada)}
                  className={cn(
                    "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all",
                    cita.realizada
                      ? "bg-sage-500 border-sage-500 text-white"
                      : pasada
                        ? "border-amber-400 hover:border-amber-500"
                        : "border-gray-200 cursor-default"
                  )}
                  aria-label={cita.realizada ? "Desmarcar como realizada" : "Marcar como realizada"}
                >
                  {cita.realizada && <Check size={16} strokeWidth={3} />}
                </button>

                {/* Fecha */}
                <div className="flex-shrink-0 text-center w-10">
                  <p className={cn(
                    "text-xl font-bold leading-none",
                    cita.realizada ? "text-gray-400" : pasada ? "text-amber-500" : "text-sage-600"
                  )}>
                    {cita.fecha.split("-")[2]}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">
                    {formatearFechaCorta(cita.fecha).split(" ")[1]}
                  </p>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", COLORES_TIPO[cita.tipo])}>
                      {TIPOS.find((t) => t.valor === cita.tipo)?.etiqueta}
                    </span>
                    {!cita.realizada && dias === 0 && (
                      <span className="text-xs text-sage-600 font-medium flex items-center gap-1">
                        <Clock size={10} />Hoy
                      </span>
                    )}
                    {!cita.realizada && dias === 1 && (
                      <span className="text-xs text-amber-600 font-medium">Mañana</span>
                    )}
                    {!cita.realizada && dias > 1 && (
                      <span className="text-xs text-gray-400">En {dias} días</span>
                    )}
                    {!cita.realizada && pasada && (
                      <span className="text-xs text-amber-600 font-medium">Pendiente</span>
                    )}
                  </div>
                  <p className={cn("font-medium text-gray-800", cita.realizada && "line-through text-gray-400")}>
                    {cita.titulo}
                  </p>
                  <p className="text-sm text-gray-500">
                    {cita.hora}
                    {cita.lugar && (
                      <span className="inline-flex items-center gap-0.5 ml-1">
                        <MapPin size={11} />{cita.lugar}
                      </span>
                    )}
                  </p>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => eliminar(cita.id)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Eliminar cita"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Añadir cita">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="grid grid-cols-4 gap-2">
              {TIPOS.map(({ valor, etiqueta }) => (
                <button
                  key={valor}
                  onClick={() => setForm((f) => ({ ...f, tipo: valor }))}
                  className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                    form.tipo === valor
                      ? "bg-sage-500 text-white border-sage-500"
                      : "border-beige-200 text-gray-600 hover:bg-beige-100"
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Revisión con el Dr. García"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar (opcional)</label>
            <input
              type="text"
              value={form.lugar}
              onChange={(e) => setForm((f) => ({ ...f, lugar: e.target.value }))}
              placeholder="Ej: Centro de Salud Norte"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variante="secundario" className="flex-1" onClick={() => setModalAbierto(false)}>
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
