"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "@/lib/supabase";
import { getSesion } from "./useGrupo";
import type { Medicacion } from "@/types";

function hoyStr() { return new Date().toISOString().split("T")[0]; }
function clave(fecha: string, hora: string) { return `${fecha}_${hora}`; }

// ── Mapeo Supabase ↔ TypeScript ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDb(r: any): Medicacion {
  return {
    id: r.id,
    nombre: r.nombre,
    horas: r.horas ?? [],
    dosis: r.dosis ?? "",
    fechaInicio: r.fecha_inicio,
    fechaFin: r.fecha_fin,
    completadasEn: r.completadas_en ?? [],
  };
}

export function useMedicacion() {
  const [sesion, setSesion] = useState(getSesion);

  // Siempre inicializamos ambos estados (reglas de hooks)
  const [medicacionesLocal, setMedicacionesLocal] = useLocalStorage<Medicacion[]>("cf_medicaciones", []);
  const [medicacionesRemoto, setMedicacionesRemoto] = useState<Medicacion[]>([]);

  useEffect(() => { setSesion(getSesion()); }, []);

  // Carga y suscripción en tiempo real cuando hay grupo
  useEffect(() => {
    if (!sesion) return;
    const hoy = hoyStr();

    const cargar = async () => {
      const { data } = await supabase
        .from("medicaciones")
        .select("*")
        .eq("grupo_id", sesion.grupoId)
        .lte("fecha_inicio", hoy)
        .gte("fecha_fin", hoy);
      setMedicacionesRemoto((data ?? []).map(fromDb));
    };
    cargar();

    const channel = supabase
      .channel(`med-${sesion.grupoId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "medicaciones",
        filter: `grupo_id=eq.${sesion.grupoId}` },
        (payload) => {
          if (payload.eventType === "INSERT")
            setMedicacionesRemoto((p) => p.some((m) => m.id === payload.new.id) ? p : [...p, fromDb(payload.new)]);
          else if (payload.eventType === "UPDATE")
            setMedicacionesRemoto((p) => p.map((m) => m.id === payload.new.id ? fromDb(payload.new) : m));
          else if (payload.eventType === "DELETE")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMedicacionesRemoto((p) => p.filter((m) => m.id !== (payload.old as any).id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sesion?.grupoId]);

  const hoy = hoyStr();
  const todas = sesion ? medicacionesRemoto : medicacionesLocal.filter(
    (m) => m.fechaInicio <= hoy && hoy <= m.fechaFin
  );

  const tomadaHoy = (m: Medicacion, hora: string) =>
    m.completadasEn.includes(clave(hoy, hora));

  const todasTomadas = (m: Medicacion) => m.horas.every((h) => tomadaHoy(m, h));

  const agregar = async (datos: Omit<Medicacion, "id" | "completadasEn">) => {
    if (!sesion) {
      setMedicacionesLocal((prev) => [
        ...prev, { ...datos, id: crypto.randomUUID(), completadasEn: [] },
      ]);
      return;
    }
    await supabase.from("medicaciones").insert({
      grupo_id: sesion.grupoId,
      nombre: datos.nombre, horas: datos.horas, dosis: datos.dosis,
      fecha_inicio: datos.fechaInicio, fecha_fin: datos.fechaFin,
      completadas_en: [],
    });
  };

  const toggleToma = async (id: string, hora: string) => {
    if (!sesion) {
      setMedicacionesLocal((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const k = clave(hoy, hora);
          return {
            ...m,
            completadasEn: m.completadasEn.includes(k)
              ? m.completadasEn.filter((c) => c !== k)
              : [...m.completadasEn, k],
          };
        })
      );
      return;
    }
    const med = medicacionesRemoto.find((m) => m.id === id);
    if (!med) return;
    const k = clave(hoy, hora);
    const nuevas = med.completadasEn.includes(k)
      ? med.completadasEn.filter((c) => c !== k)
      : [...med.completadasEn, k];
    await supabase.from("medicaciones")
      .update({ completadas_en: nuevas })
      .eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const editar = async (id: string, datos: Omit<Medicacion, "id" | "completadasEn">) => {
    if (!sesion) {
      setMedicacionesLocal((prev) =>
        prev.map((m) => m.id === id ? { ...m, ...datos } : m)
      );
      return;
    }
    setMedicacionesRemoto((prev) =>
      prev.map((m) => m.id === id ? { ...m, ...datos } : m)
    );
    await supabase.from("medicaciones").update({
      nombre: datos.nombre, horas: datos.horas, dosis: datos.dosis,
      fecha_inicio: datos.fechaInicio, fecha_fin: datos.fechaFin,
    }).eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  const eliminar = async (id: string) => {
    if (!sesion) {
      setMedicacionesLocal((prev) => prev.filter((m) => m.id !== id));
      return;
    }
    setMedicacionesRemoto((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("medicaciones").delete()
      .eq("id", id).eq("grupo_id", sesion.grupoId);
  };

  return { medicaciones: todas, tomadaHoy, todasTomadas, agregar, editar, toggleToma, eliminar };
}
