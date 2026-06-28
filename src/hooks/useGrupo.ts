"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Medicacion, Tarea, Cita } from "@/types";

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
async function migrarDatosLocales(grupoId: string) {
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
      await migrarDatosLocales(grupo.id);

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
      setError(e instanceof Error ? e.message : "Error al crear el grupo.");
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
      setError(e instanceof Error ? e.message : "Error al unirse al grupo.");
      return false;
    } finally { setCargando(false); }
  };

  const salirDelGrupo = () => {
    localStorage.removeItem(CLAVE);
    setSesionState(null);
  };

  return { sesion, cargando, error, crearGrupo, unirseAGrupo, salirDelGrupo };
}
