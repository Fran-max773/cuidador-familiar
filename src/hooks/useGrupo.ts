"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Medicacion, Tarea, Cita, Medicion, PerfilFamiliar } from "@/types";

export interface SesionGrupo {
  grupoId: string;
  codigo: string;
  miNombre: string;
  esPrincipal: boolean;
}

const CLAVE = "cf_grupo_sesion";

export function getSesion(): SesionGrupo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setSesion(s: SesionGrupo) {
  localStorage.setItem(CLAVE, JSON.stringify(s));
}

function generarCodigo(): string {
  const palabras = ["LUNA","SOL","MAR","RIO","PAZ","LUZ","OLA","VID","ROSA","NUBE"];
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${palabra}-${num}`;
}

// Sube todos los datos locales a Supabase al crear un grupo
async function migrarDatosLocales(grupoId: string, miNombre: string) {
  try {
    const meds: Medicacion[] = JSON.parse(localStorage.getItem("cf_medicaciones") ?? "[]");
    if (meds.length) {
      await supabase.from("medicaciones").insert(
        meds.map((m) => ({
          id: m.id,
          grupo_id: grupoId,
          nombre: m.nombre,
          horas: m.horas,
          dosis: m.dosis,
          fecha_inicio: m.fechaInicio,
          fecha_fin: m.fechaFin,
          completadas_en: m.completadasEn,
        }))
      );
    }

    const tareas: Tarea[] = JSON.parse(localStorage.getItem("cf_tareas") ?? "[]");
    if (tareas.length) {
      await supabase.from("tareas").insert(
        tareas.map((t) => ({
          id: t.id,
          grupo_id: grupoId,
          texto: t.texto,
          completada: t.completada,
          fecha: t.fecha,
          prioridad: t.prioridad,
          completada_por: t.completadaPor ?? "",
          asignada_a: t.asignadaA ?? "",
        }))
      );
    }

    const citas: Cita[] = JSON.parse(localStorage.getItem("cf_citas") ?? "[]");
    if (citas.length) {
      await supabase.from("citas").insert(
        citas.map((c) => ({
          id: c.id,
          grupo_id: grupoId,
          tipo: c.tipo,
          titulo: c.titulo,
          fecha: c.fecha,
          hora: c.hora,
          lugar: c.lugar ?? "",
          notas: c.notas ?? "",
        }))
      );
    }

    // Solo se suben las del familiar: las del cuidador u otras personas siguen privadas en el dispositivo
    const mediciones: Medicion[] = JSON.parse(localStorage.getItem("cf_mediciones") ?? "[]");
    let nombreFamiliar = "";
    try { nombreFamiliar = (JSON.parse(localStorage.getItem("cf_perfil") ?? "{}") as PerfilFamiliar).nombre?.trim() ?? ""; } catch { /* sin perfil */ }
    const familiar = nombreFamiliar || "Mi familiar";
    const delFamiliar = mediciones.filter((m) => m.persona === familiar);
    if (delFamiliar.length) {
      const { error } = await supabase.from("mediciones").insert(
        delFamiliar.map((m) => ({
          id: m.id,
          grupo_id: grupoId,
          tipo: m.tipo,
          valor: m.valor,
          valor2: m.valor2 ?? null,
          persona: m.persona,
          registrada_por: miNombre,
          fecha: m.fecha,
          hora: m.hora,
          notas: m.notas ?? "",
        }))
      );
      // Ya están en el grupo: quitarlas del dispositivo para que no aparezcan duplicadas
      if (!error) {
        const subidas = new Set(delFamiliar.map((m) => m.id));
        localStorage.setItem("cf_mediciones", JSON.stringify(mediciones.filter((m) => !subidas.has(m.id))));
      }
    }
  } catch {
    // La migración es best-effort: si falla no bloqueamos la creación del grupo
  }
}

export function useGrupo() {
  const [sesion, setSesionState] = useState<SesionGrupo | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSesionState(getSesion());
  }, []);

  const crearGrupo = async (miNombre: string) => {
    if (!miNombre.trim()) { setError("Escribe tu nombre."); return false; }
    setCargando(true); setError("");
    try {
      const codigo = generarCodigo();

      const { data: grupo, error: eGrupo } = await supabase
        .from("grupos")
        .insert({ codigo })
        .select()
        .single();
      if (eGrupo) throw eGrupo;

      const { error: eMiembro } = await supabase
        .from("miembros")
        .insert({ grupo_id: grupo.id, nombre: miNombre.trim(), es_principal: true });
      if (eMiembro) throw eMiembro;

      // Subir datos locales para que los familiares que se unan después los vean
      await migrarDatosLocales(grupo.id, miNombre.trim());

      const s: SesionGrupo = {
        grupoId: grupo.id,
        codigo: grupo.codigo,
        miNombre: miNombre.trim(),
        esPrincipal: true,
      };
      setSesion(s);
      setSesionState(s);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message
        : (typeof e === "object" && e !== null && "message" in e)
          ? String((e as { message: unknown }).message)
          : "Error al crear el grupo.";
      setError(msg);
      return false;
    } finally { setCargando(false); }
  };

  const unirseAGrupo = async (codigo: string, miNombre: string) => {
    if (!codigo.trim() || !miNombre.trim()) {
      setError("Rellena el código y tu nombre."); return false;
    }
    setCargando(true); setError("");
    try {
      const { data: grupo, error: eGrupo } = await supabase
        .from("grupos")
        .select()
        .eq("codigo", codigo.trim().toUpperCase())
        .single();
      if (eGrupo || !grupo) { setError("Código no encontrado. Compruébalo e inténtalo de nuevo."); return false; }

      const { error: eMiembro } = await supabase
        .from("miembros")
        .insert({ grupo_id: grupo.id, nombre: miNombre.trim(), es_principal: false });
      if (eMiembro) throw eMiembro;

      const s: SesionGrupo = {
        grupoId: grupo.id,
        codigo: grupo.codigo,
        miNombre: miNombre.trim(),
        esPrincipal: false,
      };
      setSesion(s);
      setSesionState(s);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message
        : (typeof e === "object" && e !== null && "message" in e)
          ? String((e as { message: unknown }).message)
          : "Error al unirse al grupo.";
      setError(msg);
      return false;
    } finally { setCargando(false); }
  };

  const salirDelGrupo = () => {
    localStorage.removeItem(CLAVE);
    setSesionState(null);
  };

  // El nombre de miembro se guarda como texto en varias tablas (no hay id de miembro),
  // así que hay que cambiarlo en todas para no perder lo asignado a esa persona.
  const cambiarNombre = async (nuevoNombre: string): Promise<boolean> => {
    const actual = getSesion();
    const nuevo = nuevoNombre.trim();
    if (!actual) return false;
    if (!nuevo) { setError("Escribe un nombre."); return false; }
    if (nuevo === actual.miNombre) return true;
    setCargando(true); setError("");
    try {
      const g = actual.grupoId;
      const viejo = actual.miNombre;

      const { data: existentes } = await supabase.from("miembros").select("nombre").eq("grupo_id", g);
      if ((existentes ?? []).some((m) => m.nombre.toLowerCase() === nuevo.toLowerCase())) {
        setError("Ya hay alguien con ese nombre en el grupo. Elige otro.");
        return false;
      }

      const { error: eMiembro } = await supabase.from("miembros")
        .update({ nombre: nuevo }).eq("grupo_id", g).eq("nombre", viejo);
      if (eMiembro) throw eMiembro;

      await Promise.all([
        supabase.from("tareas").update({ asignada_a: nuevo }).eq("grupo_id", g).eq("asignada_a", viejo),
        supabase.from("tareas").update({ completada_por: nuevo }).eq("grupo_id", g).eq("completada_por", viejo),
        supabase.from("tareas").update({ creada_por: nuevo }).eq("grupo_id", g).eq("creada_por", viejo),
        supabase.from("mediciones").update({ persona: nuevo }).eq("grupo_id", g).eq("persona", viejo),
        supabase.from("mediciones").update({ registrada_por: nuevo }).eq("grupo_id", g).eq("registrada_por", viejo),
      ]);

      // Mediciones privadas de este dispositivo apuntadas con el nombre antiguo
      try {
        const locales: Medicion[] = JSON.parse(localStorage.getItem("cf_mediciones") ?? "[]");
        localStorage.setItem("cf_mediciones", JSON.stringify(
          locales.map((m) => (m.persona === viejo ? { ...m, persona: nuevo } : m))
        ));
      } catch { /* sin mediciones locales */ }

      const s: SesionGrupo = { ...actual, miNombre: nuevo };
      setSesion(s);
      setSesionState(s);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se ha podido cambiar el nombre.");
      return false;
    } finally { setCargando(false); }
  };

  return { sesion, cargando, error, crearGrupo, unirseAGrupo, salirDelGrupo, cambiarNombre };
}
