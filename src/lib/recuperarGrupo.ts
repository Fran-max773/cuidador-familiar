// Copia al dispositivo (localStorage) todo lo que hay en el grupo: medicación con sus tomas, tareas,
// citas y mediciones. Sirve para seguir usando la app en local mientras los grupos están en pausa.
// Es idempotente: se puede repetir sin duplicar nada (se combina por id).
import { supabase } from "@/lib/supabase";
import { fromDb as medFromDb } from "@/hooks/useMedicacion";
import { fromDb as tareaFromDb } from "@/hooks/useTareas";
import { fromDb as citaFromDb } from "@/hooks/useCitas";
import { fromDb as medicionFromDb } from "@/hooks/useMediciones";
import type { Medicacion } from "@/types";

export interface ResumenRecuperacion {
  medicaciones: number; tareas: number; citas: number; mediciones: number;
}

// ¿Se puede leer el grupo ahora mismo? (Supabase activo y el grupo existe). Corta a los 6 s.
export async function grupoAccesible(grupoId: string): Promise<boolean> {
  try {
    const consulta = supabase.from("grupos").select("id").eq("id", grupoId).limit(1);
    const limite = new Promise<{ data: null; error: Error }>((r) =>
      setTimeout(() => r({ data: null, error: new Error("timeout") }), 6000));
    const { data, error } = await Promise.race([consulta, limite]);
    return !error && Array.isArray(data) && data.length > 0;
  } catch { return false; }
}

function leer<T>(clave: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(clave) ?? "[]"); return Array.isArray(v) ? v : []; }
  catch { return []; }
}

// Añade los elementos del grupo que no estén ya en el dispositivo
function combinar<T extends { id: string }>(clave: string, remotos: T[]): number {
  const locales = leer<T>(clave);
  const ids = new Set(locales.map((x) => x.id));
  const nuevos = remotos.filter((x) => !ids.has(x.id));
  localStorage.setItem(clave, JSON.stringify([...locales, ...nuevos]));
  return remotos.length;
}

async function todo(tabla: string, grupoId: string) {
  const { data, error } = await supabase.from(tabla).select("*").eq("grupo_id", grupoId).limit(10000);
  if (error) throw error;
  return data ?? [];
}

export async function recuperarDatosDelGrupo(grupoId: string): Promise<ResumenRecuperacion> {
  // Se lee todo ANTES de escribir nada: si una tabla falla, el dispositivo queda como estaba
  const [meds, tareas, citas, mediciones] = await Promise.all([
    todo("medicaciones", grupoId), todo("tareas", grupoId), todo("citas", grupoId), todo("mediciones", grupoId),
  ]);

  // Medicación: si ya existe en el dispositivo, se suman las tomas de ambos lados
  const medsRemotas = meds.map(medFromDb);
  const medsLocales = leer<Medicacion>("cf_medicaciones");
  const porId = new Map(medsLocales.map((m) => [m.id, m]));
  for (const r of medsRemotas) {
    const l = porId.get(r.id);
    porId.set(r.id, l
      ? { ...r, completadasEn: Array.from(new Set([...l.completadasEn, ...r.completadasEn])) }
      : r);
  }
  localStorage.setItem("cf_medicaciones", JSON.stringify(Array.from(porId.values())));

  return {
    medicaciones: medsRemotas.length,
    tareas: combinar("cf_tareas", tareas.map(tareaFromDb)),
    citas: combinar("cf_citas", citas.map(citaFromDb)),
    mediciones: combinar("cf_mediciones", mediciones.map(medicionFromDb)),
  };
}
