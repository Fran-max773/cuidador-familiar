"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Dato {
  dia: string;
  puntuacion: number | null;
  nivel: "bajo" | "moderado" | "alto" | null;
}

const COLORES: Record<string, string> = {
  bajo:     "#a0c0a0",
  moderado: "#e8c560",
  alto:     "#e07070",
  vacio:    "#e8dfd0",
};

export function GraficoSemanal({ datos }: { datos: Dato[] }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3 text-center">
        Tu nivel de carga esta semana
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={datos} barCategoryGap="25%">
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 13, fill: "#8a8a8a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, 20]} />
          <Tooltip
            formatter={(value: number) => [`${value} pts`, "Puntuación"]}
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
          />
          <Bar dataKey="puntuacion" radius={[6, 6, 0, 0]}>
            {datos.map((d, i) => (
              <Cell
                key={i}
                fill={d.nivel ? COLORES[d.nivel] : COLORES.vacio}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {[
          { color: COLORES.bajo,     texto: "Bien" },
          { color: COLORES.moderado, texto: "Moderado" },
          { color: COLORES.alto,     texto: "Alto" },
        ].map(({ color, texto }) => (
          <div key={texto} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
