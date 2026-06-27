"use client";
import { useLocalStorage } from "./useLocalStorage";
import type { CheckinBienestar } from "@/types";

function calcularNivel(total: number): CheckinBienestar["nivel"] {
  if (total <= 10) return "bajo";
  if (total <= 16) return "moderado";
  return "alto";
}

export function useBienestar() {
  const [checkins, setCheckins] = useLocalStorage<CheckinBienestar[]>(
    "cf_bienestar",
    []
  );

  const hoy = new Date().toISOString().split("T")[0];
  const checkinHoy = checkins.find((c) => c.fecha === hoy);

  const guardarCheckin = (respuestas: {
    comoTeEncuentras: number;
    hasDormidoBien: number;
    tesSientesAgotado: number;
    hasTenidoTiempoParaTi: number;
  }) => {
    const total =
      respuestas.comoTeEncuentras +
      respuestas.hasDormidoBien +
      respuestas.tesSientesAgotado +
      respuestas.hasTenidoTiempoParaTi;

    const nuevo: CheckinBienestar = {
      id: crypto.randomUUID(),
      fecha: hoy,
      ...respuestas,
      puntuacionTotal: total,
      nivel: calcularNivel(total),
    };

    setCheckins((prev) => {
      const sinHoy = prev.filter((c) => c.fecha !== hoy);
      return [...sinHoy, nuevo];
    });
  };

  const ultimosSieteDias = (() => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fecha = d.toISOString().split("T")[0];
      const checkin = checkins.find((c) => c.fecha === fecha);
      dias.push({
        fecha,
        dia: d.toLocaleDateString("es-ES", { weekday: "short" }),
        puntuacion: checkin?.puntuacionTotal ?? null,
        nivel: checkin?.nivel ?? null,
      });
    }
    return dias;
  })();

  return { checkinHoy, guardarCheckin, ultimosSieteDias };
}
