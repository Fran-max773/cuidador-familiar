"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "@/lib/supabase";
import { getSesion } from "./useGrupo";
import type { Cita } from "@/types";

const HOY = new Date().toISOString().split("T")[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDb(r: any): Cita {
  return {
    id: r.id,
    tipo: r.tipo,
    titulo: r.titulo,
    fecha: r.fecha,
    hora: r.hora,
    lugar: r.lugar ?? "",
    notas: r.notas ?? "",
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
        .from("citas")
        .select("*")
        .eq("grupo_id", sesion.grupoId)
        .gte("fecha", HOY)
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
            setCitasRemoto((p) => [...p, fromDb(payload.new)].sort((a, b) =>
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

  const proximas = sesion
    ? citasRemoto
    : [...citasLocal]
        .filter((c) => c.fecha >= HOY)
        .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

  const agregar = async (datos: Omit<Cita, "id">) => {
    if (!sesion) {
      setCitasLocal((prev) => [...prev, { ...datos, id: crypto.randomUUID() }]);
      return;
    }
    const { data } = await supabase.from("citas")
      .insert({ grupo_id: sesion.grupoId, ...datos }).select().single();
    if (data) setCitasRemoto((p) => [...p, fromDb(data)].sort((a, b) =>
      `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)));
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

  return { citas: proximas, agregar, editar, eliminar };
}
