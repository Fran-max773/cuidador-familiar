import type { Medicion, TipoMedicion } from "@/types";

export interface ConfigMedicion {
  etiqueta: string;
  corta: string;
  unidad: string;
  emoji: string;
  doble?: boolean;    // tensión: dos valores (máxima / mínima)
  decimales: boolean;
  // Límites de lo físicamente plausible, solo para detectar errores al teclear (no son rangos médicos)
  min: number;
  max: number;
  placeholder: string;
  sugerenciasNota: string[];
}

export const TIPOS_MEDICION: Record<TipoMedicion, ConfigMedicion> = {
  tension: {
    etiqueta: "Tensión arterial", corta: "Tensión", unidad: "mmHg", emoji: "🩺",
    doble: true, decimales: false, min: 30, max: 300, placeholder: "120",
    sugerenciasNota: ["En reposo", "Tras la medicación", "Brazo izquierdo", "Brazo derecho"],
  },
  glucosa: {
    etiqueta: "Azúcar (glucosa)", corta: "Azúcar", unidad: "mg/dL", emoji: "🩸",
    decimales: false, min: 10, max: 800, placeholder: "100",
    sugerenciasNota: ["En ayunas", "Antes de comer", "2 h después de comer", "Antes de dormir"],
  },
  temperatura: {
    etiqueta: "Temperatura", corta: "Temperatura", unidad: "°C", emoji: "🌡️",
    decimales: true, min: 30, max: 45, placeholder: "36,5",
    sugerenciasNota: ["Axilar", "Oído", "Frente"],
  },
  peso: {
    etiqueta: "Peso", corta: "Peso", unidad: "kg", emoji: "⚖️",
    decimales: true, min: 10, max: 300, placeholder: "70",
    sugerenciasNota: ["En ayunas", "Con ropa"],
  },
  saturacion: {
    etiqueta: "Saturación de oxígeno", corta: "Saturación", unidad: "%", emoji: "🫁",
    decimales: false, min: 40, max: 100, placeholder: "97",
    sugerenciasNota: ["En reposo", "Tras caminar"],
  },
  pulso: {
    etiqueta: "Pulso", corta: "Pulso", unidad: "lpm", emoji: "💓",
    decimales: false, min: 20, max: 250, placeholder: "70",
    sugerenciasNota: ["En reposo", "Tras caminar"],
  },
};

export const ORDEN_TIPOS: TipoMedicion[] = ["tension", "glucosa", "temperatura", "peso", "saturacion", "pulso"];

const fmt = (n: number, decimales: boolean) =>
  n.toLocaleString("es-ES", { maximumFractionDigits: decimales ? 1 : 0 });

export function formatearValor(m: Pick<Medicion, "tipo" | "valor" | "valor2">): string {
  const cfg = TIPOS_MEDICION[m.tipo];
  if (cfg.doble) return `${fmt(m.valor, false)}/${m.valor2 != null ? fmt(m.valor2, false) : "–"}`;
  return fmt(m.valor, cfg.decimales);
}

// Acepta coma o punto decimal ("36,5" o "36.5")
export function parsearNumero(texto: string): number | null {
  const limpio = texto.trim().replace(",", ".");
  if (!limpio) return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

export function fechaLocalHoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function horaLocalAhora(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ordenarRecientesPrimero(a: Medicion, b: Medicion): number {
  return `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`);
}
