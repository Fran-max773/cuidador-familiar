// Copia de seguridad de lo que la app guarda en el dispositivo (localStorage).
// Se descarga como un archivo .json y se puede restaurar en este u otro dispositivo.
// Restaurar NUNCA borra lo que ya hay: añade lo que falte (por id) y suma las tomas de medicación.
import type { Medicacion } from "@/types";

const APP = "cuidador-familiar";
const VERSION = 1;

// Listas de elementos con id → se combinan al restaurar
const LISTAS = {
  medicaciones: "cf_medicaciones",
  tareas: "cf_tareas",
  citas: "cf_citas",
  mediciones: "cf_mediciones",
  bienestar: "cf_bienestar",
} as const;
// Lista de ids de texto (tareas archivadas en este dispositivo)
const CLAVE_OCULTAS = "cf_tareas_ocultas";
const CLAVE_PERFIL = "cf_perfil";

type NombreLista = keyof typeof LISTAS;

export interface CopiaSeguridad {
  app: typeof APP;
  version: number;
  fecha: string; // ISO
  datos: {
    perfil: unknown | null;
    tareasOcultas: string[];
  } & Record<NombreLista, { id: string }[]>;
}

export interface ResumenCopia {
  medicaciones: number; tareas: number; citas: number; mediciones: number;
  bienestar: number; tienePerfil: boolean;
}

function leerJson(clave: string): unknown {
  try { const v = localStorage.getItem(clave); return v ? JSON.parse(v) : null; } catch { return null; }
}
function leerLista<T>(clave: string): T[] {
  const v = leerJson(clave);
  return Array.isArray(v) ? (v as T[]) : [];
}

export function crearCopia(): CopiaSeguridad {
  const datos = { perfil: leerJson(CLAVE_PERFIL), tareasOcultas: leerLista<string>(CLAVE_OCULTAS) } as CopiaSeguridad["datos"];
  for (const n of Object.keys(LISTAS) as NombreLista[]) datos[n] = leerLista(LISTAS[n]);
  return { app: APP, version: VERSION, fecha: new Date().toISOString(), datos };
}

export function resumir(c: CopiaSeguridad): ResumenCopia {
  const d = c.datos;
  return {
    medicaciones: d.medicaciones.length, tareas: d.tareas.length, citas: d.citas.length,
    mediciones: d.mediciones.length, bienestar: d.bienestar.length, tienePerfil: !!d.perfil,
  };
}

// Descarga el archivo. Devuelve el resumen de lo guardado.
export function descargarCopia(): ResumenCopia {
  const copia = crearCopia();
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const nombre = `cuidador-familiar-copia-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
  const blob = new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return resumir(copia);
}

// Lee y valida un archivo de copia. Lanza Error con un mensaje para mostrar al usuario.
export function leerCopia(texto: string): CopiaSeguridad {
  let o: unknown;
  try { o = JSON.parse(texto); } catch { throw new Error("El archivo no es una copia de Cuidador Familiar."); }
  const c = o as Partial<CopiaSeguridad> | null;
  if (!c || c.app !== APP || typeof c.version !== "number" || !c.datos || typeof c.datos !== "object") {
    throw new Error("El archivo no es una copia de Cuidador Familiar.");
  }
  if (c.version > VERSION) throw new Error("Esta copia es de una versión más nueva de la app. Actualiza la app e inténtalo de nuevo.");
  const d = c.datos as Record<string, unknown>;
  const datos = { perfil: d.perfil ?? null, tareasOcultas: Array.isArray(d.tareasOcultas) ? d.tareasOcultas.filter((x) => typeof x === "string") : [] } as CopiaSeguridad["datos"];
  for (const n of Object.keys(LISTAS) as NombreLista[]) {
    const lista = d[n];
    // Solo elementos con id de texto: lo demás se ignora
    datos[n] = Array.isArray(lista) ? lista.filter((x) => x && typeof x === "object" && typeof (x as { id?: unknown }).id === "string") : [];
  }
  return { app: APP, version: c.version, fecha: typeof c.fecha === "string" ? c.fecha : "", datos };
}

function combinar(clave: string, entrantes: { id: string }[], unir?: (actual: never, nuevo: never) => unknown) {
  const actuales = leerLista<{ id: string }>(clave);
  const porId = new Map(actuales.map((x) => [x.id, x]));
  for (const e of entrantes) {
    const a = porId.get(e.id);
    porId.set(e.id, a && unir ? (unir(a as never, e as never) as { id: string }) : (a ?? e));
  }
  localStorage.setItem(clave, JSON.stringify(Array.from(porId.values())));
}

// Restaura sin borrar nada: añade lo que falte y suma tomas. El perfil solo se rellena si aquí está vacío.
export function restaurarCopia(c: CopiaSeguridad) {
  const d = c.datos;
  combinar(LISTAS.medicaciones, d.medicaciones, (a: Medicacion, n: Medicacion) => ({
    ...a, completadasEn: Array.from(new Set([...(a.completadasEn ?? []), ...(n.completadasEn ?? [])])),
  }));
  combinar(LISTAS.tareas, d.tareas);
  combinar(LISTAS.citas, d.citas);
  combinar(LISTAS.mediciones, d.mediciones);
  combinar(LISTAS.bienestar, d.bienestar);

  const ocultas = new Set([...leerLista<string>(CLAVE_OCULTAS), ...d.tareasOcultas]);
  localStorage.setItem(CLAVE_OCULTAS, JSON.stringify(Array.from(ocultas)));

  if (d.perfil && typeof d.perfil === "object") {
    const actual = leerJson(CLAVE_PERFIL) as { nombre?: string } | null;
    if (!actual || !actual.nombre?.trim()) localStorage.setItem(CLAVE_PERFIL, JSON.stringify(d.perfil));
  }
}
