"use client";
import { useState, useEffect, useMemo } from "react";
import { Printer, Pill, ClipboardList, CalendarDays, Check, X, List, LayoutGrid, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getSesion } from "@/hooks/useGrupo";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Medicacion, Tarea, Cita } from "@/types";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Tab = "tareas" | "medicacion" | "citas";

const PERIODOS = [
  { label: "1 mes",   meses: 1  },
  { label: "3 meses", meses: 3  },
  { label: "6 meses", meses: 6  },
  { label: "1 año",   meses: 12 },
];

// ── Helpers de fecha (en hora local, sin toISOString, que desplaza a UTC) ─────
const pad2 = (n: number) => String(n).padStart(2, "0");

function hoyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mesActual(): string {
  return hoyLocal().slice(0, 7);
}

function sumarMeses(ym: string, n: number): string {
  const [a, m] = ym.split("-").map(Number);
  const d = new Date(a, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function ultimoDiaMes(ym: string): string {
  const [a, m] = ym.split("-").map(Number);
  return `${ym}-${pad2(new Date(a, m, 0).getDate())}`;
}

function etiquetaVentana(mesIni: string, mesFin: string): string {
  if (mesIni === mesFin) return mesLabel(mesFin);
  const [aI] = mesIni.split("-");
  const [aF] = mesFin.split("-");
  const nombreIni = mesLabel(mesIni).split(" ")[0];
  return aI === aF ? `${nombreIni} – ${mesLabel(mesFin)}` : `${nombreIni} ${aI} – ${mesLabel(mesFin)}`;
}

function mesLabel(mesStr: string) {
  const [año, mes] = mesStr.split("-");
  const nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                   "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${nombres[parseInt(mes) - 1]} ${año}`;
}

function diaCorto(fecha: string) {
  const [, m, d] = fecha.split("-");
  return `${d}/${m}`;
}

function getDiasEnRango(desde: string, hasta: string): string[] {
  const dias: string[] = [];
  const cur = new Date(desde + "T00:00:00");
  const fin = new Date(hasta + "T00:00:00");
  while (cur <= fin) {
    dias.push(`${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dias;
}

function agruparPorMes<T extends { fecha: string }>(items: T[]): [string, T[]][] {
  const mapa: Record<string, T[]> = {};
  for (const item of items) {
    const mes = item.fecha.slice(0, 7);
    (mapa[mes] ??= []).push(item);
  }
  return Object.entries(mapa).sort((a, b) => b[0].localeCompare(a[0]));
}

// ── Mapeo Supabase → TypeScript ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromDbTarea = (r: any): Tarea => ({
  id: r.id, texto: r.texto, completada: r.completada, fecha: r.fecha,
  prioridad: r.prioridad ?? "normal",
  completadaPor: r.completada_por ?? "", asignadaA: r.asignada_a ?? "",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromDbCita = (r: any): Cita => ({
  id: r.id, tipo: r.tipo, titulo: r.titulo, fecha: r.fecha,
  hora: r.hora, lugar: r.lugar ?? "", notas: r.notas ?? "",
  realizada: r.realizada ?? false,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromDbMed = (r: any): Medicacion => ({
  id: r.id, nombre: r.nombre, horas: r.horas ?? [], dosis: r.dosis ?? "",
  fechaInicio: r.fecha_inicio, fechaFin: r.fecha_fin, completadasEn: r.completadas_en ?? [],
});

// ── Sección Medicación ────────────────────────────────────────────────────────
interface ResumenMed {
  med: Medicacion;
  meses: [string, string[]][];   // [YYYY-MM, días] del más reciente al más antiguo
  tomadas: number;
  esperadas: number;
  pct: number;
}

// Solo cuenta días ya pasados (o hoy): los futuros no se pueden haber tomado aún
function resumirMedicacion(med: Medicacion, desde: string, hasta: string, hoy: string): ResumenMed | null {
  const inicio = med.fechaInicio > desde ? med.fechaInicio : desde;
  const finRango = hasta < hoy ? hasta : hoy;
  const fin = med.fechaFin < finRango ? med.fechaFin : finRango;
  if (inicio > fin) return null;

  const dias = getDiasEnRango(inicio, fin);
  const diasSet = new Set(dias);
  const porMes: Record<string, string[]> = {};
  for (const d of dias) (porMes[d.slice(0, 7)] ??= []).push(d);

  const esperadas = dias.length * med.horas.length;
  const tomadas = med.completadasEn.filter((k) => diasSet.has(k.split("_")[0])).length;
  return {
    med,
    meses: Object.entries(porMes).sort((a, b) => b[0].localeCompare(a[0])),
    tomadas, esperadas,
    pct: esperadas ? Math.round((tomadas / esperadas) * 100) : 0,
  };
}

function colorPct(pct: number) {
  return pct >= 80 ? "bg-sage-100 text-sage-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
}

function MesMedicacion({ med, mes, dias, abiertoInicial }: {
  med: Medicacion; mes: string; dias: string[]; abiertoInicial: boolean;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const tomaSet = new Set(med.completadasEn);
  const diasSet = new Set(dias);
  const tomadas = med.completadasEn.filter((k) => diasSet.has(k.split("_")[0])).length;
  const esperadas = dias.length * med.horas.length;

  return (
    <div className="print-month border-t border-gray-100 first:border-t-0">
      <button
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 py-2 text-left"
      >
        <span className="text-sm font-semibold text-gray-600">{mesLabel(mes)}</span>
        <span className="flex items-center gap-2 text-xs text-gray-500">
          {tomadas}/{esperadas} tomas
          <ChevronDown size={16} className={cn("transition-transform print:hidden", abierto && "rotate-180")} />
        </span>
      </button>
      {/* Plegado en pantalla, pero siempre visible al imprimir */}
      <div className={cn("space-y-1 pb-3", !abierto && "hidden print:block")}>
        {[...dias].reverse().map((dia) => (
          <div key={dia} className="flex items-center gap-3 text-sm">
            <span className="w-12 text-gray-400 text-xs flex-shrink-0">{diaCorto(dia)}</span>
            <div className="flex gap-2 flex-wrap">
              {med.horas.map((hora) => {
                const tomada = tomaSet.has(`${dia}_${hora}`);
                return (
                  <span key={hora} className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                    tomada ? "bg-sage-100 text-sage-700" : "bg-red-50 text-red-500"
                  )}>
                    {tomada ? <Check size={10} /> : <X size={10} />}
                    {hora}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TarjetaMedicamento({ resumen, abiertoInicial }: { resumen: ResumenMed; abiertoInicial: boolean }) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const { med, meses, tomadas, esperadas, pct } = resumen;

  return (
    <div className="print-section bg-white rounded-2xl border border-beige-200 overflow-hidden">
      <button
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="w-full min-h-[44px] flex items-center gap-3 px-4 py-3 text-left hover:bg-beige-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 truncate">
            {med.nombre}{med.dosis ? ` — ${med.dosis}` : ""}
          </p>
          <p className="text-xs text-gray-500">
            Horario: {med.horas.join(", ")} · {tomadas}/{esperadas} tomas
          </p>
        </div>
        <span className={cn("text-sm font-bold px-3 py-1 rounded-full flex-shrink-0", colorPct(pct))}>
          {pct}%
        </span>
        <ChevronDown size={20} className={cn("text-gray-400 flex-shrink-0 transition-transform print:hidden", abierto && "rotate-180")} />
      </button>
      <div className={cn("px-4 pb-1", !abierto && "hidden print:block")}>
        {meses.map(([mes, dias], i) => (
          <MesMedicacion key={mes} med={med} mes={mes} dias={dias} abiertoInicial={i === 0} />
        ))}
      </div>
    </div>
  );
}

function SeccionMedicacion({ meds, desde, hasta }: { meds: Medicacion[]; desde: string; hasta: string }) {
  const hoy = hoyLocal();
  const resumenes = meds
    .map((m) => resumirMedicacion(m, desde, hasta, hoy))
    .filter((r): r is ResumenMed => r !== null);

  if (!resumenes.length) {
    return <p className="text-gray-400 text-center py-8">No hay tomas de medicación en este período.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 print:hidden">
        {resumenes.length === 1
          ? "Toca un mes para ver el detalle día a día."
          : `${resumenes.length} medicamentos. Toca uno para ver el detalle día a día.`}
      </p>
      {resumenes.map((r) => (
        // key con el rango: al cambiar de período, los acordeones vuelven a su estado inicial
        <TarjetaMedicamento key={`${r.med.id}-${desde}-${hasta}`} resumen={r} abiertoInicial={resumenes.length === 1} />
      ))}
    </div>
  );
}

// ── Mes plegable (Tareas y Citas): plegado en pantalla, siempre visible al imprimir ──
function MesPlegable({ titulo, resumen, abiertoInicial, children }: {
  titulo: string; resumen: string; abiertoInicial: boolean; children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <div className="print-month bg-white rounded-2xl border border-beige-200 overflow-hidden">
      <button
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-beige-50 transition-colors"
      >
        <span className="font-semibold text-gray-800">{titulo}</span>
        <span className="flex items-center gap-2 text-xs text-gray-500">
          {resumen}
          <ChevronDown size={18} className={cn("text-gray-400 transition-transform print:hidden", abierto && "rotate-180")} />
        </span>
      </button>
      <div className={cn("px-4 pb-4", !abierto && "hidden print:block")}>{children}</div>
    </div>
  );
}

// ── Sección Tareas ────────────────────────────────────────────────────────────
function SeccionTareas({ tareas, claveRango }: { tareas: Tarea[]; claveRango: string }) {
  if (!tareas.length) return <p className="text-gray-400 text-center py-8">No hay tareas en este período.</p>;

  const meses = agruparPorMes([...tareas].sort((a,b) => b.fecha.localeCompare(a.fecha)));
  const completadas = tareas.filter(t => t.completada).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {completadas} completadas · {tareas.length - completadas} pendientes · {tareas.length} total
      </p>
      {meses.map(([mes, items], i) => (
        <MesPlegable
          key={`${mes}-${claveRango}`}
          titulo={mesLabel(mes)}
          resumen={`${items.filter(t => t.completada).length}/${items.length} completadas`}
          abiertoInicial={i === 0}
        >
          <div className="space-y-1.5">
            {items.map((t) => (
              <div key={t.id} className="flex items-start gap-3 text-sm">
                <span className="w-12 text-gray-400 text-xs flex-shrink-0 pt-0.5">{diaCorto(t.fecha)}</span>
                <span className={cn(
                  "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5",
                  t.completada ? "bg-sage-500 text-white" : "border-2 border-gray-200"
                )}>
                  {t.completada && <Check size={11} strokeWidth={3} />}
                </span>
                <div className="flex-1">
                  <span className={cn("text-gray-800", t.completada && "line-through text-gray-400")}>
                    {t.texto}
                  </span>
                  {t.completada && t.completadaPor && (
                    <span className="text-xs text-sage-500 ml-2">({t.completadaPor})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MesPlegable>
      ))}
    </div>
  );
}

// ── Sección Citas ─────────────────────────────────────────────────────────────
const TIPOS_LABEL: Record<string, string> = {
  medico: "Médico", hospital: "Hospital", analisis: "Análisis", otro: "Otro"
};
const TIPOS_COLOR: Record<string, string> = {
  medico: "bg-blue-100 text-blue-700", hospital: "bg-purple-100 text-purple-700",
  analisis: "bg-amber-100 text-amber-700", otro: "bg-gray-100 text-gray-600",
};

function SeccionCitas({ citas, claveRango }: { citas: Cita[]; claveRango: string }) {
  const hoy = hoyLocal();
  if (!citas.length) return <p className="text-gray-400 text-center py-8">No hay citas en este período.</p>;

  const meses = agruparPorMes([...citas].sort((a,b) => b.fecha.localeCompare(a.fecha)));
  const realizadas = citas.filter(c => c.realizada).length;
  const proximas   = citas.filter(c => c.fecha > hoy && !c.realizada).length;
  const pendientes = citas.filter(c => c.fecha <= hoy && !c.realizada).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {proximas} próximas · {realizadas} realizadas · {pendientes > 0 ? `${pendientes} sin confirmar · ` : ""}{citas.length} total
      </p>
      {meses.map(([mes, items], i) => (
        <MesPlegable
          key={`${mes}-${claveRango}`}
          titulo={mesLabel(mes)}
          resumen={`${items.length} ${items.length === 1 ? "cita" : "citas"}`}
          abiertoInicial={i === 0}
        >
          <div className="space-y-2">
            {items.map((c) => {
              const esPasadaOHoy = c.fecha <= hoy;
              const esFutura = c.fecha > hoy;
              return (
                <div key={c.id} className={cn("flex items-start gap-3 text-sm", c.realizada && "opacity-70")}>
                  <span className="w-12 text-gray-400 text-xs flex-shrink-0 pt-1">{diaCorto(c.fecha)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TIPOS_COLOR[c.tipo])}>
                        {TIPOS_LABEL[c.tipo]}
                      </span>
                      {c.realizada && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                          ✓ Realizada
                        </span>
                      )}
                      {!c.realizada && esPasadaOHoy && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">
                          Pendiente
                        </span>
                      )}
                      {!c.realizada && esFutura && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-700">
                          Próxima
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-800">{c.titulo}</p>
                    <p className="text-gray-500 text-xs">
                      {c.hora}{c.lugar ? ` · ${c.lugar}` : ""}
                    </p>
                    {c.notas && <p className="text-gray-400 text-xs italic mt-0.5">{c.notas}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </MesPlegable>
      ))}
    </div>
  );
}

// ── Calendario mensual ────────────────────────────────────────────────────────
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES_NOMBRE = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getMesesEnRango(desde: string, hasta: string): { año: number; mes: number }[] {
  const result: { año: number; mes: number }[] = [];
  const [dA, dM] = desde.split("-").map(Number);
  const [hA, hM] = hasta.split("-").map(Number);
  let a = dA, m = dM;
  while (a < hA || (a === hA && m <= hM)) {
    result.push({ año: a, mes: m - 1 });
    m++; if (m > 12) { m = 1; a++; }
  }
  return result;
}


function CalendarioMes({ año, mes, renderDia, leyenda }: {
  año: number; mes: number;
  renderDia: (fecha: string) => React.ReactNode;
  leyenda?: React.ReactNode;
}) {
  const primerDia = new Date(año, mes, 1);
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  let offset = primerDia.getDay() - 1;
  if (offset < 0) offset = 6;

  const celdas: (string | null)[] = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++)
    celdas.push(`${año}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const filas: (string | null)[][] = [];
  for (let i = 0; i < celdas.length; i += 7) filas.push(celdas.slice(i, i + 7));

  return (
    <div className="cal-mes-completo flex flex-col border border-gray-300 overflow-hidden mb-8 print:mb-0"
         style={{ height: "440px" }}>
      {/* Cabecera del mes */}
      <div className="bg-sky-600 text-white text-center py-2 font-bold text-sm flex-shrink-0 print:py-1">
        {MESES_NOMBRE[mes]} {año}
      </div>
      {leyenda && (
        <div className="px-2 py-0.5 bg-gray-50 border-b border-gray-200 flex-shrink-0 text-[9px] flex flex-wrap gap-1">
          {leyenda}
        </div>
      )}
      {/* Cabecera días semana */}
      <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200 flex-shrink-0">
        {DIAS_SEMANA.map((d, i) => (
          <div key={d} className={cn("text-center py-1 text-[10px] font-semibold text-gray-600",
            i < 6 && "border-r border-gray-200")}>
            {d}
          </div>
        ))}
      </div>
      {/* Filas del calendario — flex para repartir altura uniformemente */}
      <div className="flex-1 flex flex-col min-h-0">
        {filas.map((fila, fi) => (
          <div key={fi} className={cn("flex-1 grid grid-cols-7 min-h-0", fi < filas.length - 1 && "border-b border-gray-100")}>
            {fila.map((fecha, ci) => (
              <div key={ci} className={cn("p-0.5 overflow-hidden flex flex-col min-h-0",
                ci < 6 && "border-r border-gray-100")}>
                {fecha && (
                  <>
                    <span className="text-[10px] font-bold text-gray-400 leading-tight flex-shrink-0">
                      {parseInt(fecha.split("-")[2])}
                    </span>
                    <div className="flex-1 overflow-hidden mt-0.5 space-y-px">
                      {renderDia(fecha)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarioTareas({ tareas, calDesde, calHasta }: { tareas: Tarea[]; calDesde: string; calHasta: string }) {
  const porFecha = useMemo(() => {
    const m: Record<string, Tarea[]> = {};
    for (const t of tareas) (m[t.fecha] ??= []).push(t);
    return m;
  }, [tareas]);

  return (
    <div>
      {getMesesEnRango(calDesde, calHasta).map(({ año, mes }) => (
        <CalendarioMes key={`${año}-${mes}`} año={año} mes={mes}
          renderDia={(fecha) => (porFecha[fecha] ?? []).map((t) => (
            <div key={t.id} className={cn("text-[9px] leading-tight truncate",
              t.completada ? "text-green-700 line-through" : "text-gray-700")}>
              {t.completada ? "✓" : "·"} {t.texto}
            </div>
          ))}
        />
      ))}
    </div>
  );
}

function CalendarioMedicacion({ meds, calDesde, calHasta }: { meds: Medicacion[]; calDesde: string; calHasta: string }) {
  const hoy = hoyLocal();
  return (
    <div>
      {getMesesEnRango(calDesde, calHasta).map(({ año, mes }) => (
        <CalendarioMes key={`${año}-${mes}`} año={año} mes={mes}
          leyenda={meds.map((m) => (
            <span key={m.id} className="bg-purple-100 text-purple-700 px-1 py-px rounded">{m.nombre}</span>
          ))}
          renderDia={(fecha) => {
            if (fecha > hoy) return null;
            return meds.filter((m) => m.fechaInicio <= fecha && fecha <= m.fechaFin).map((m) => {
              const tomadas = m.horas.filter((h) => m.completadasEn.includes(`${fecha}_${h}`)).length;
              const total = m.horas.length;
              return (
                <div key={m.id} className={cn("text-[9px] leading-tight truncate font-medium",
                  tomadas === total ? "text-green-700" : tomadas === 0 ? "text-red-600" : "text-amber-600")}>
                  {tomadas === total ? "✓" : tomadas === 0 ? "✗" : `${tomadas}/${total}`} {m.nombre}
                </div>
              );
            });
          }}
        />
      ))}
    </div>
  );
}

function CalendarioCitas({ citas, calDesde, calHasta }: { citas: Cita[]; calDesde: string; calHasta: string }) {
  const hoy = hoyLocal();
  const porFecha = useMemo(() => {
    const m: Record<string, Cita[]> = {};
    for (const c of citas) (m[c.fecha] ??= []).push(c);
    return m;
  }, [citas]);

  return (
    <div>
      {getMesesEnRango(calDesde, calHasta).map(({ año, mes }) => (
        <CalendarioMes key={`${año}-${mes}`} año={año} mes={mes}
          renderDia={(fecha) => (porFecha[fecha] ?? []).map((c) => (
            <div key={c.id} className={cn("text-[9px] leading-tight truncate",
              c.realizada ? "text-green-700" : fecha <= hoy ? "text-red-600" : "text-sky-700")}>
              {c.realizada ? "✓" : "·"} {c.hora} {c.titulo}
            </div>
          ))}
        />
      ))}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function HistorialPage() {
  const [tab, setTab] = useState<Tab>("tareas");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    if (p === "medicacion" || p === "tareas" || p === "citas") setTab(p);
  }, []);
  const [periodoIdx, setPeriodo]         = useState(1);
  const [tareas, setTareas]             = useState<Tarea[]>([]);
  const [citas, setCitas]               = useState<Cita[]>([]);
  const [meds, setMeds]                 = useState<Medicacion[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [sesion]                        = useState(getSesion);
  const [vistaCalendario, setVistaCalendario] = useState(false);

  // Ventana de meses naturales que termina en mesFin (por defecto, el mes actual).
  // La comparten la vista Lista y la vista Calendario.
  const [mesFin, setMesFin] = useState(mesActual);
  const numMeses = PERIODOS[periodoIdx].meses;
  const mesIni = sumarMeses(mesFin, -(numMeses - 1));
  const desde = `${mesIni}-01`;
  const hasta = ultimoDiaMes(mesFin);
  const esMesActual = mesFin === mesActual();
  // Hacia delante solo hasta 12 meses (citas futuras); hacia atrás sin límite
  const puedeAvanzar = mesFin < sumarMeses(mesActual(), 12);

  const seleccionarPeriodo = (i: number) => {
    setPeriodo(i);
    setMesFin(mesActual());
  };
  const moverVentana = (sentido: 1 | -1) => setMesFin((m) => sumarMeses(m, sentido * numMeses));

  useEffect(() => {
    setCargando(true);

    if (!sesion) {
      const t: Tarea[]      = JSON.parse(localStorage.getItem("cf_tareas")        ?? "[]");
      const c: Cita[]       = JSON.parse(localStorage.getItem("cf_citas")         ?? "[]");
      const m: Medicacion[] = JSON.parse(localStorage.getItem("cf_medicaciones")  ?? "[]");
      setTareas(t.filter(x => x.fecha >= desde && x.fecha <= hasta));
      setCitas(c.filter(x => x.fecha >= desde && x.fecha <= hasta));
      setMeds(m);
      setCargando(false);
    } else {
      (async () => {
        const gid = sesion.grupoId;
        const [{ data: t }, { data: c }, { data: m }] = await Promise.all([
          supabase.from("tareas").select("*").eq("grupo_id", gid)
            .gte("fecha", desde).lte("fecha", hasta),
          supabase.from("citas").select("*").eq("grupo_id", gid)
            .gte("fecha", desde).lte("fecha", hasta),
          supabase.from("medicaciones").select("*").eq("grupo_id", gid),
        ]);
        setTareas((t ?? []).map(fromDbTarea));
        setCitas((c ?? []).map(fromDbCita));
        setMeds((m ?? []).map(fromDbMed));
        setCargando(false);
      })();
    }
  }, [sesion?.grupoId, desde, hasta]);

  const perfil = useMemo(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("cf_perfil") ?? "null"); } catch { return null; }
  }, []);

  const tituloPrint = perfil?.nombre
    ? `Historial de cuidados — ${perfil.nombre}`
    : "Historial de cuidados — Cuidador Familiar";

  const tabs: { id: Tab; label: string; Icon: React.ElementType; color: string; colorInactivo: string }[] = [
    { id: "tareas",     label: "Tareas",     Icon: ClipboardList, color: "bg-sage-500 text-white shadow-sm",   colorInactivo: "bg-sage-200 text-sage-800 hover:bg-sage-300"      },
    { id: "medicacion", label: "Medicación", Icon: Pill,          color: "bg-purple-500 text-white shadow-sm", colorInactivo: "bg-purple-200 text-purple-800 hover:bg-purple-300" },
    { id: "citas",      label: "Citas",      Icon: CalendarDays,  color: "bg-sky-500 text-white shadow-sm",    colorInactivo: "bg-sky-200 text-sky-800 hover:bg-sky-300"          },
  ];

  return (
    <>
      {/* CSS impresión: siempre A4 horizontal para máxima legibilidad */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: ${vistaCalendario ? "6mm" : "12mm"}; }
          main { padding: 0 !important; }
          ${vistaCalendario ? `
          .cal-mes-completo {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: 194mm !important;
            max-height: 194mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .cal-mes-completo:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          ` : `
          .print-section { page-break-inside: avoid; break-inside: avoid; }
          .print-month { page-break-inside: avoid; break-inside: avoid; }
          `}
        }
      `}</style>

      {/* Título solo para impresión — oculto en calendario (cada mes ya lleva cabecera) */}
      {!vistaCalendario && (
        <div className="hidden print:block mb-4">
          <h1 className="text-xl font-bold text-gray-800">{tituloPrint}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tab === "tareas" ? "Tareas" : tab === "medicacion" ? "Medicación" : "Citas"}
            {" · "}Período: {etiquetaVentana(mesIni, mesFin)}
          </p>
          <hr className="mt-2 border-gray-200" />
        </div>
      )}

      <div className="space-y-5 print:space-y-4">
        {/* Controles — ocultos al imprimir */}
        <div className="no-print space-y-4">
          {/* Selector de período */}
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              {PERIODOS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => seleccionarPeriodo(i)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    periodoIdx === i
                      ? "bg-sky-500 text-white border-sky-500"
                      : "border-beige-200 text-gray-600 hover:bg-beige-50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Navegador de meses */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => moverVentana(-1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-beige-200 text-gray-600 hover:bg-beige-50"
                aria-label={numMeses === 1 ? "Mes anterior" : `${numMeses} meses anteriores`}
              >
                <ChevronLeft size={22} />
              </button>
              <div className="flex-1 text-center">
                <p className="font-semibold text-gray-800">{etiquetaVentana(mesIni, mesFin)}</p>
                {!esMesActual && (
                  <button
                    onClick={() => setMesFin(mesActual())}
                    className="text-xs text-sky-600 underline min-h-[24px]"
                  >
                    Volver a este mes
                  </button>
                )}
              </div>
              <button
                onClick={() => moverVentana(1)}
                disabled={!puedeAvanzar}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-beige-200 text-gray-600 hover:bg-beige-50 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={numMeses === 1 ? "Mes siguiente" : `${numMeses} meses siguientes`}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex gap-2">
            {tabs.map(({ id, label, Icon, color, colorInactivo }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-semibold transition-all border",
                  tab === id ? cn(color, "border-gray-900") : cn(colorInactivo, "border-transparent")
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Vista lista / calendario */}
          <div className="flex gap-2">
            <button
              onClick={() => setVistaCalendario(false)}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all",
                !vistaCalendario ? "bg-gray-700 text-white border-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50")}
            >
              <List size={15} /> Lista
            </button>
            <button
              onClick={() => setVistaCalendario(true)}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all",
                vistaCalendario ? "bg-gray-700 text-white border-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50")}
            >
              <LayoutGrid size={15} /> Calendario
            </button>
          </div>

          {/* Botón imprimir */}
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-sky-200 text-sky-600 hover:bg-sky-50 transition-colors font-medium text-sm"
          >
            <Printer size={18} />
            {vistaCalendario ? "Imprimir calendario (A4 horizontal · 1 mes por hoja)" : "Imprimir / Guardar como PDF"}
          </button>
        </div>

        {/* Contenido */}
        {cargando ? (
          <p className="text-gray-400 text-center py-12">Cargando...</p>
        ) : (
          <div className="print:pt-2">
            {vistaCalendario ? (
              <>
                {tab === "tareas"     && <CalendarioTareas tareas={tareas} calDesde={mesIni} calHasta={mesFin} />}
                {tab === "medicacion" && <CalendarioMedicacion meds={meds} calDesde={mesIni} calHasta={mesFin} />}
                {tab === "citas"      && <CalendarioCitas citas={citas} calDesde={mesIni} calHasta={mesFin} />}
              </>
            ) : (
              <>
                {tab === "tareas"     && <SeccionTareas tareas={tareas} claveRango={`${desde}-${hasta}`} />}
                {tab === "medicacion" && <SeccionMedicacion meds={meds} desde={desde} hasta={hasta} />}
                {tab === "citas"      && <SeccionCitas citas={citas} claveRango={`${desde}-${hasta}`} />}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
