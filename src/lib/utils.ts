import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatearFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
    "es-ES",
    { weekday: "long", day: "numeric", month: "long" }
  );
}

export function formatearFechaCorta(iso: string): string {
  const [year, month, day] = iso.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "short" }
  );
}

export function diasHasta(iso: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [year, month, day] = iso.split("-");
  const fecha = new Date(Number(year), Number(month) - 1, Number(day));
  return Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
}
