"use client";
import { useState, useEffect, useId } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "@/lib/supabase";
import { getSesion } from "./useGrupo";
import type { Tarea } from "@/types";

const HOY = new Date().toISOString().split("T")[0];
function hace3diasStr() {
  const d = new Date(); d.setDate(d.getDate() - 3);
  return d.toISOString().split("T")[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDb(r: any): Tarea {
  return {
    id: r.id,
    texto: r.texto,
    completada: r.completada,
    fecha: r.fecha,
    prioridad: r.prioridad ?? "normal",
    completadaPor: r.completada_por ?? "",
    asignadaA: r.asignada_a ?? "",
    creadaPor: r.creada_por ?? "",
  };
}

export function useTareas() {
  // Cada instancia del hook (p.ej. TareasSection y BottomNav a la vez) necesita
  // su propio nombre de canal: Supabase reutiliza el canal si el nombre coincide,
  // y añadir un segundo .on() a un canal ya suscrito lanza un error.
  const instanceId = useId();
  const [sesion, setSesion] = useState(getSesion);
  const [tareasLocal, setTareasLocal] = useLocalStorage<Tarea[]>("cf_tareas", []);
  const [tareasRemoto, setTareasRemoto] = useState<Tarea[]>([]);
  // Tareas completadas que este dispositivo ha decidido dejar de ver hoy (no afecta a los demás)
  const [ocultas, setOcultas] = useLocalStorage<string[]>("cf_tareas_ocultas", []);

  useEffect(() => { setSesion(getSesion()); }, []);

  useEffect(() => {
    if (!sesion) return;

    const cargar = async () => {
      const { data } = await supabase
        .from("tareas")
        .select("*")
        .eq("grupo_id", sesion.grupoId)
        .gte("fecha", hace3diasStr())
        .lte("fecha", HOY);
      setTareasRemoto((data ?? []).map(fromDb));
    };
    cargar();

    const channel = supabase
      .channel(`tareas-${sesion.grupoId}-${instanceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tareas",
        filter: `grupo_id=eq.${sesion.grupoId}` },
        (payload) => {
          if (payload.eventType === "INSERT")
            setTareasRemoto((p) => p.some((t) => t.id === payload.new.id) ? p : [...p, fromDb(payload.new)]);
          else if (payload.eventType === "UPDATE")
            setTareasRemoto((p) => p.map((t) => t.id === payload.new.id ? fromDb(payload.new) : t));
          else if (payload.eventType === "DELETE")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTareasRemoto((p) => p.filter((t) => t.id !== (payload.old as any).id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sesion?.grupoId]);

  const tareas = (sesion ? tareasRemoto : tareasLocal)
    .filter((t) => t.fecha === HOY && !ocultas.includes(t.id));

  const tareasRecientes = sesion
    ? tareasRemoto
    : tareasLocal.filter((t) => t.fecha >= hace3diasStr() && t.fecha <= HOY);

  const agregar = async (texto: string, prioridad: Tarea["prioridad"] = "normal", asignadaA = "") => {
    if (!sesion) {
      setTareasLocal((prev) => [
        ...prev,
        { id: crypto.randomUUID(), texto, completada: false, fecha: HOY, prioridad, asignadaA },
      ]);
      return;
    }
    const { data, error } = await supabase.from("tareas").insert({
      grupo_id: sesion.grupoId, texto, completada: false,
      fecha: HOY, prioridad, completada_por: "", asignada_a: asignadaA, creada_por: sesion.miNombre,
    }).select().single();
    if (error) { console.error("Error al añadir tarea:", error); return; }
    setTareasRemoto((prev) => prev.some((t) => t.id === data.id) ? prev : [...prev, fromDb(data)]);
  };

  // Deja de mostrar una tarea completada en "Hoy" solo para este dispositivo
  const archivar = (id: string) => {
    setOcultas((prev) => prev.includes(id) ? prev : [...prev, id]);
  };

  const toggleCompletar = async (id: string) => {
    if (!sesion) {
      setTareasLocal((prev) =>
        prev.map((t) => t.id === id ? { ...t, completada: !t.completada } : t)
      );
      return;
    }
    const tarea = tareasRemoto.find((t) => t.id === id);
    if (!tarea) return;
    const completada = !tarea.completada;
    // Optimista
    setTareasRemoto((p) => p.map((t) => t.id === id
      ? { ...t, completada, completadaPor: completada ? sesion.miNombre : "" }
      : t));
    await supabase.from("tareas")
      .update({ completada, completada_por: completada ? sesion.miNombre : "" })
      .eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const editar = async (id: string, texto: string, asignadaA = "") => {
    if (!sesion) {
      setTareasLocal((prev) => prev.map((t) => t.id === id ? { ...t, texto, asignadaA } : t));
      return;
    }
    setTareasRemoto((p) => p.map((t) => t.id === id ? { ...t, texto, asignadaA } : t));
    await supabase.from("tareas").update({ texto, asignada_a: asignadaA })
      .eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const eliminar = async (id: string) => {
    if (!sesion) {
      setTareasLocal((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    setTareasRemoto((p) => p.filter((t) => t.id !== id));
    await supabase.from("tareas").delete()
      .eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const togglePrioridad = async (id: string) => {
    if (!sesion) {
      setTareasLocal((prev) =>
        prev.map((t) => t.id === id
          ? { ...t, prioridad: t.prioridad === "alta" ? "normal" : "alta" }
          : t)
      );
      return;
    }
    const tarea = tareasRemoto.find((t) => t.id === id);
    if (!tarea) return;
    const nueva: Tarea["prioridad"] = tarea.prioridad === "alta" ? "normal" : "alta";
    setTareasRemoto((p) => p.map((t) => t.id === id ? { ...t, prioridad: nueva } : t));
    await supabase.from("tareas").update({ prioridad: nueva })
      .eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  return { tareas, tareasRecientes, agregar, toggleCompletar, editar, eliminar, togglePrioridad, archivar };
}
