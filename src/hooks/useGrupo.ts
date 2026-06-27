"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const palabras = ["LUNA","SOL","MAR","RIO","PAZ","LUZ","OLA","VID","ROSa","NUBE"];
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${palabra}-${num}`;
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
