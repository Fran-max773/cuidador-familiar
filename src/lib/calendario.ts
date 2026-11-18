// Pasar una cita al calendario del usuario: enlace de Google Calendar (sin permisos ni cuentas) o archivo .ics.
// El enlace de Google NO admite avisos (no existe parámetro para ello); el .ics sí lleva los suyos.
import type { Cita } from "@/types";

const DURACION_MIN = 60;
const TIPOS: Record<Cita["tipo"], string> = { medico: "Médico", hospital: "Hospital", analisis: "Análisis", otro: "Otra" };

const p2 = (n: number) => String(n).padStart(2, "0");

// "2026-11-20" + "10:30" → Date local (sin zona: la del dispositivo)
function inicioLocal(c: Cita): Date {
  const [y, m, d] = c.fecha.split("-").map(Number);
  const [h, min] = (c.hora || "00:00").split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, h || 0, min || 0, 0);
}

// Formato calendario "AAAAMMDDTHHMMSS" (hora local, sin Z)
function formato(d: Date) {
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;
}

function fin(c: Cita): Date {
  return new Date(inicioLocal(c).getTime() + DURACION_MIN * 60000);
}

function detalle(c: Cita): string {
  const partes = [`Cita (${TIPOS[c.tipo]}) · añadida desde Cuidador Familiar`];
  if (c.notas?.trim()) partes.push(c.notas.trim());
  return partes.join("\n");
}

export function urlGoogleCalendar(c: Cita): string {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: c.titulo,
    dates: `${formato(inicioLocal(c))}/${formato(fin(c))}`,
    details: detalle(c),
  });
  if (c.lugar?.trim()) q.set("location", c.lugar.trim());
  try {
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zona) q.set("ctz", zona);
  } catch { /* sin zona: Google usará la de la cuenta */ }
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// Escapa texto para iCalendar (RFC 5545)
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// Pliega líneas largas a 75 caracteres (RFC 5545)
function plegar(linea: string): string {
  if (linea.length <= 75) return linea;
  const trozos: string[] = [linea.slice(0, 75)];
  for (let i = 75; i < linea.length; i += 74) trozos.push(" " + linea.slice(i, i + 74));
  return trozos.join("\r\n");
}

export function contenidoIcs(c: Cita): string {
  const aviso = (trigger: string, texto: string) => [
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(texto)}`, `TRIGGER:${trigger}`, "END:VALARM",
  ];
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cuidador Familiar//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${c.id}@cuidador-familiar`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${formato(inicioLocal(c))}`,
    `DTEND:${formato(fin(c))}`,
    `SUMMARY:${esc(c.titulo)}`,
    ...(c.lugar?.trim() ? [`LOCATION:${esc(c.lugar.trim())}`] : []),
    `DESCRIPTION:${esc(detalle(c))}`,
    ...aviso("-P1D", `Mañana: ${c.titulo}`),
    ...aviso("-PT2H", `En 2 horas: ${c.titulo}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.map(plegar).join("\r\n") + "\r\n";
}

export function descargarIcs(c: Cita) {
  const blob = new Blob([contenidoIcs(c)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cita-${c.fecha}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
