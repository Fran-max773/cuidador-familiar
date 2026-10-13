"use client";
import { useState, useEffect, useId } from "react";
import { supabase } from "@/lib/supabase";
import { getSesion } from "./useGrupo";

// Lista de nombres de los miembros del grupo, para asignar tareas
export function useMiembros() {
  // Se monta varias veces a la vez (Tareas y el formulario de Mediciones en Hoy): canal único por instancia
  const instanceId = useId();
  const [sesion, setSesion] = useState(getSesion);
  const [miembros, setMiembros] = useState<string[]>([]);

  useEffect(() => { setSesion(getSesion()); }, []);

  useEffect(() => {
    if (!sesion) { setMiembros([]); return; }

    const cargar = async () => {
      const { data } = await supabase
        .from("miembros").select("nombre").eq("grupo_id", sesion.grupoId);
      setMiembros((data ?? []).map((m) => m.nombre));
    };
    cargar();

    const channel = supabase
      .channel(`miembros-${sesion.grupoId}-${instanceId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "miembros",
        filter: `grupo_id=eq.${sesion.grupoId}` },
        (payload) => setMiembros((p) => p.includes(payload.new.nombre) ? p : [...p, payload.new.nombre]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sesion?.grupoId, instanceId]);

  return miembros;
}
