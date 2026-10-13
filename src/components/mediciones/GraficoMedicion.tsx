"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Medicion, TipoMedicion } from "@/types";
import { TIPOS_MEDICION } from "@/lib/mediciones";
import { formatearFechaCorta } from "@/lib/utils";

const COLOR_PRINCIPAL = "#e11d48";
const COLOR_SECUNDARIO = "#5a8a5a";

interface Props {
  tipo: TipoMedicion;
  mediciones: Medicion[]; // ya filtradas por tipo y persona
}

export function GraficoMedicion({ tipo, mediciones }: Props) {
  const cfg = TIPOS_MEDICION[tipo];
  const datos = [...mediciones]
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
    .slice(-30)
    .map((m) => ({
      etiqueta: formatearFechaCorta(m.fecha),
      detalle: `${formatearFechaCorta(m.fecha)}, ${m.hora}`,
      valor: m.valor,
      valor2: m.valor2 ?? undefined,
    }));

  if (datos.length < 2) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        Cuando haya al menos dos mediciones verás aquí cómo evolucionan.
      </p>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={datos} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#f4f0e8" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 12, fill: "#8a8a8a" }} axisLine={false} tickLine={false}
            interval="preserveStartEnd" minTickGap={16} />
          <YAxis tick={{ fontSize: 12, fill: "#8a8a8a" }} axisLine={false} tickLine={false}
            domain={["auto", "auto"]} width={44} />
          <Tooltip
            labelFormatter={(_, payload) => payload?.[0]?.payload?.detalle ?? ""}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString("es-ES")} ${cfg.unidad}`,
              cfg.doble ? (name === "valor" ? "Máxima" : "Mínima") : cfg.corta,
            ]}
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
          />
          <Line type="monotone" dataKey="valor" stroke={COLOR_PRINCIPAL} strokeWidth={2.5}
            dot={{ r: 3.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          {cfg.doble && (
            <Line type="monotone" dataKey="valor2" stroke={COLOR_SECUNDARIO} strokeWidth={2.5}
              dot={{ r: 3.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
      {cfg.doble && (
        <div className="flex justify-center gap-4 mt-1">
          {[{ color: COLOR_PRINCIPAL, texto: "Máxima" }, { color: COLOR_SECUNDARIO, texto: "Mínima" }].map(({ color, texto }) => (
            <div key={texto} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-500">{texto}</span>
            </div>
          ))}
        </div>
      )}
      {mediciones.length > 30 && (
        <p className="text-xs text-gray-400 text-center mt-1">Se muestran las 30 mediciones más recientes.</p>
      )}
    </div>
  );
}
