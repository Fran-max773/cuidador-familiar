"use client";
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(valorInicial);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValor(JSON.parse(item));
    } catch {
      // ignorar errores de parse
    }
    setCargado(true);
  }, [key]);

  const guardar = (nuevoValor: T | ((val: T) => T)) => {
    try {
      const valorAGuardar =
        nuevoValor instanceof Function ? nuevoValor(valor) : nuevoValor;
      setValor(valorAGuardar);
      window.localStorage.setItem(key, JSON.stringify(valorAGuardar));
    } catch {
      // ignorar errores de escritura
    }
  };

  return [valor, guardar, cargado] as const;
}
