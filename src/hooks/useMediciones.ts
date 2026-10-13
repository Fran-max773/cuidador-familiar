"use client";
import { useState, useEffect, useId } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "@/lib/supabase";
import { getSesion } from "./useGrupo";
import { ordenarRecientesPrimero } from "@/lib/mediciones";
import type { Medicion } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDb(r: any): Medicion {
  return {
    id: r.id, tipo: r.tipo,
    valor: Number(r.valor),
    valor2: r.valor2 == null ? null : Number(r.valor2),
    persona: r.persona ?? "",
    fecha: r.fecha, hora: r.hora,
    notas: r.notas ?? "",
    registradaPor: r.registrada_por ?? "",
  };
}

export function useMediciones() {
  // Nombre de canal único por instancia: el hook se monta en Hoy y en /mediciones
  const instanceId = useId();
  const [sesion, setSesion] = useState(getSesion);
  const [local, setLocal, cargadoLocal] = useLocalStorage<Medicion[]>("cf_mediciones", []);
  const [remoto, setRemoto] = useState<Medicion[]>([]);
  const [cargadoRemoto, setCargadoRemoto] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setSesion(getSesion()); }, []);

  useEffect(() => {
    if (!sesion) return;

    const cargar = async () => {
      const { data, error: e } = await supabase
        .from("mediciones").select("*").eq("grupo_id", sesion.grupoId)
        .order("fecha", { ascending: false }).order("hora", { ascending: false })
        .limit(2000);
      if (e) {
        console.error("Error al cargar mediciones:", e);
        setError("No se han podido cargar las mediciones del grupo.");
      } else {
        setRemoto((data ?? []).map(fromDb));
        setError("");
      }
      setCargadoRemoto(true);
    };
    cargar();

    const channel = supabase
      .channel(`mediciones-${sesion.grupoId}-${instanceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mediciones",
        filter: `grupo_id=eq.${sesion.grupoId}` },
        (payload) => {
          if (payload.eventType === "INSERT")
            setRemoto((p) => p.some((m) => m.id === payload.new.id) ? p : [...p, fromDb(payload.new)]);
          else if (payload.eventType === "UPDATE")
            setRemoto((p) => p.map((m) => m.id === payload.new.id ? fromDb(payload.new) : m));
          else if (payload.eventType === "DELETE")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setRemoto((p) => p.filter((m) => m.id !== (payload.old as any).id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sesion?.grupoId, instanceId]);

  // Lo local nunca sale del dispositivo. En grupo, se muestra junto a lo compartido marcado como privado.
  const mediciones = [
    ...(sesion ? remoto : []),
    ...local.map((m) => ({ ...m, privada: !!sesion })),
  ].sort(ordenarRecientesPrimero);
  const cargado = cargadoLocal && (!sesion || cargadoRemoto);

  const agregar = async (
    datos: Omit<Medicion, "id" | "registradaPor" | "privada">,
    compartir: boolean,
  ): Promise<boolean> => {
    if (!sesion || !compartir) {
      setLocal((prev) => [...prev, { ...datos, id: crypto.randomUUID(), registradaPor: "" }]);
      return true;
    }
    const { data, error: e } = await supabase.from("mediciones")
      .insert({
        grupo_id: sesion.grupoId,
        tipo: datos.tipo,
        valor: datos.valor,
        valor2: datos.valor2 ?? null,
        persona: datos.persona,
        fecha: datos.fecha,
        hora: datos.hora,
        notas: datos.notas ?? "",
        registrada_por: sesion.miNombre,
      })
      .select().single();
    if (e) {
      console.error("Error al añadir medición:", e);
      return false;
    }
    setRemoto((p) => p.some((m) => m.id === data.id) ? p : [...p, fromDb(data)]);
    return true;
  };

  const eliminar = async (id: string) => {
    if (!sesion || local.some((m) => m.id === id)) {
      setLocal((prev) => prev.filter((m) => m.id !== id));
      return;
    }
    setRemoto((p) => p.filter((m) => m.id !== id));
    await supabase.from("mediciones").delete().eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  return { mediciones, cargado, agregar, eliminar, error, sesion };
}
