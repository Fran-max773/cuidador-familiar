"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "@/lib/supabase";
import { getSesion } from "./useGrupo";
import type { Cita } from "@/types";

function hoyStr() { return new Date().toISOString().split("T")[0]; }
function hace7dias() {
  const d = new Date(); d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDb(r: any): Cita {
  return {
    id: r.id, tipo: r.tipo, titulo: r.titulo,
    fecha: r.fecha, hora: r.hora,
    lugar: r.lugar ?? "", notas: r.notas ?? "",
    realizada: r.realizada ?? false,
  };
}

export function useCitas() {
  const [sesion, setSesion] = useState(getSesion);
  const [citasLocal, setCitasLocal] = useLocalStorage<Cita[]>("cf_citas", []);
  const [citasRemoto, setCitasRemoto] = useState<Cita[]>([]);

  useEffect(() => { setSesion(getSesion()); }, []);

  useEffect(() => {
    if (!sesion) return;

    const cargar = async () => {
      const { data } = await supabase
        .from("citas").select("*").eq("grupo_id", sesion.grupoId)
        .gte("fecha", hace7dias())          // incluye últimos 7 días
        .order("fecha").order("hora");
      setCitasRemoto((data ?? []).map(fromDb));
    };
    cargar();

    const channel = supabase
      .channel(`citas-${sesion.grupoId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "citas",
        filter: `grupo_id=eq.${sesion.grupoId}` },
        (payload) => {
          if (payload.eventType === "INSERT")
            setCitasRemoto((p) => p.some((c) => c.id === payload.new.id) ? p :
              [...p, fromDb(payload.new)].sort((a, b) =>
                `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)));
          else if (payload.eventType === "UPDATE")
            setCitasRemoto((p) => p.map((c) => c.id === payload.new.id ? fromDb(payload.new) : c));
          else if (payload.eventType === "DELETE")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCitasRemoto((p) => p.filter((c) => c.id !== (payload.old as any).id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sesion?.grupoId]);

  // Mostrar: próximas + pasadas recientes no marcadas como realizadas
  const citas = sesion
    ? citasRemoto.filter((c) => c.fecha >= hoyStr() || !c.realizada)
    : [...citasLocal]
        .filter((c) => c.fecha >= hoyStr() || !c.realizada)
        .filter((c) => c.fecha >= hace7dias())
        .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

  const agregar = async (datos: Omit<Cita, "id">) => {
    if (!sesion) {
      setCitasLocal((prev) => [...prev, { ...datos, id: crypto.randomUUID(), realizada: false }]);
      return;
    }
    const { data } = await supabase.from("citas")
      .insert({ grupo_id: sesion.grupoId, ...datos, realizada: false }).select().single();
    if (data) setCitasRemoto((p) => [...p, fromDb(data)].sort((a, b) =>
      `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)));
  };

  const marcarRealizada = async (id: string, realizada: boolean) => {
    if (!sesion) {
      setCitasLocal((prev) => prev.map((c) => c.id === id ? { ...c, realizada } : c));
      return;
    }
    setCitasRemoto((p) => p.map((c) => c.id === id ? { ...c, realizada } : c));
    await supabase.from("citas").update({ realizada }).eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const editar = async (id: string, datos: Partial<Omit<Cita, "id">>) => {
    if (!sesion) {
      setCitasLocal((prev) => prev.map((c) => c.id === id ? { ...c, ...datos } : c));
      return;
    }
    setCitasRemoto((p) => p.map((c) => c.id === id ? { ...c, ...datos } : c));
    await supabase.from("citas").update(datos).eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const eliminar = async (id: string) => {
    if (!sesion) {
      setCitasLocal((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    setCitasRemoto((p) => p.filter((c) => c.id !== id));
    await supabase.from("citas").delete().eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  return { citas, agregar, marcarRealizada, editar, eliminar };
}
