"use client";
import { useState } from "react";
import { CalendarDays, Plus, Trash2, MapPin, Check, Clock } from "lucide-react";
import { useCitas } from "@/hooks/useCitas";
import type { Cita } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatearFechaCorta, diasHasta } from "@/lib/utils";

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

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-sage-500" />
          <h2 className="text-lg font-semibold text-gray-800">Próximas citas</h2>
        </div>
        <Button variante="fantasma" tamaño="sm" onClick={() => setModalAbierto(true)}>
          <Plus size={16} /> Añadir
        </Button>
      </div>

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
              <Card key={cita.id} className={`flex items-start gap-4 ${pasada && !cita.realizada ? "border-amber-200 bg-amber-50/40" : ""} ${cita.realizada ? "border-green-200 bg-green-50/40" : ""}`}>
                <div className="flex-shrink-0 text-center w-12">
                  <p className={`text-2xl font-bold leading-none ${cita.realizada ? "text-green-600" : pasada ? "text-amber-500" : "text-sage-600"}`}>
                    {cita.fecha.split("-")[2]}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">
                    {formatearFechaCorta(cita.fecha).split(" ")[1]}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORES_TIPO[cita.tipo]}`}>
                      {TIPOS.find((t) => t.valor === cita.tipo)?.etiqueta}
                    </span>
                    {cita.realizada && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓ Realizada</span>}
                    {!cita.realizada && dias === 0 && <span className="text-xs text-sage-600 font-medium flex items-center gap-1"><Clock size={10}/>Hoy</span>}
                    {!cita.realizada && dias === 1 && <span className="text-xs text-amber-600 font-medium">Mañana</span>}
                    {!cita.realizada && dias > 1 && <span className="text-xs text-gray-400">En {dias} días</span>}
                    {!cita.realizada && pasada && <span className="text-xs text-amber-600 font-medium">Pendiente de confirmar</span>}
                  </div>
                  <p className={`font-medium ${cita.realizada ? "text-green-800" : "text-gray-800"}`}>{cita.titulo}</p>
                  <p className="text-sm text-gray-500">{cita.hora}{cita.lugar ? ` · ` : ""}{cita.lugar && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin size={12} />{cita.lugar}
                    </span>
                  )}</p>
                  {/* Botón de check — solo para citas pasadas */}
                  {pasada && (
                    <button
                      onClick={() => marcarRealizada(cita.id, !cita.realizada)}
                      className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        cita.realizada
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                      {cita.realizada ? "✓ Realizada — pulsa para desmarcar" : "Marcar como realizada"}
                    </button>
                  )}
                </div>
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
