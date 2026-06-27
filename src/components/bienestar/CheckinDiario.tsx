"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CheckinBienestar } from "@/types";

interface Pregunta {
  id: keyof Omit<CheckinBienestar, "id" | "fecha" | "puntuacionTotal" | "nivel">;
  texto: string;
  invertida: boolean;
}

const PREGUNTAS: Pregunta[] = [
  { id: "comoTeEncuentras",       texto: "¿Cómo te encuentras hoy?",             invertida: false },
  { id: "hasDormidoBien",         texto: "¿Has dormido bien?",                   invertida: false },
  { id: "tesSientesAgotado",      texto: "¿Te sientes agotado?",                 invertida: true  },
  { id: "hasTenidoTiempoParaTi",  texto: "¿Has tenido tiempo para ti hoy?",      invertida: false },
];

const EMOJIS_NORMAL   = ["😔", "😕", "😐", "🙂", "😊"];
const EMOJIS_INVERTIDA = ["😊", "🙂", "😐", "😕", "😔"];

interface Props {
  onGuardar: (r: { comoTeEncuentras: number; hasDormidoBien: number; tesSientesAgotado: number; hasTenidoTiempoParaTi: number }) => void;
}

export function CheckinDiario({ onGuardar }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);

  const handleGuardar = () => {
    if (!todasRespondidas) return;
    onGuardar({
      comoTeEncuentras:      respuestas["comoTeEncuentras"],
      hasDormidoBien:        respuestas["hasDormidoBien"],
      tesSientesAgotado:     respuestas["tesSientesAgotado"],
      hasTenidoTiempoParaTi: respuestas["hasTenidoTiempoParaTi"],
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-lg leading-relaxed">
        Dedica un momento a ti. Responde con honestidad, solo para ti.
      </p>

      {PREGUNTAS.map((pregunta) => {
        const emojis = pregunta.invertida ? EMOJIS_INVERTIDA : EMOJIS_NORMAL;
        return (
          <Card key={pregunta.id}>
            <p className="font-medium text-gray-800 mb-4 text-lg">{pregunta.texto}</p>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((valor, i) => (
                <button
                  key={valor}
                  onClick={() => setRespuestas((r) => ({ ...r, [pregunta.id]: valor }))}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-2xl ${
                    respuestas[pregunta.id] === valor
                      ? "bg-sage-100 ring-2 ring-sage-400 scale-105"
                      : "hover:bg-beige-100"
                  }`}
                  aria-label={`${valor} de 5`}
                >
                  <span>{emojis[i]}</span>
                  <span className="text-xs text-gray-400">{valor}</span>
                </button>
              ))}
            </div>
          </Card>
        );
      })}

      <Button
        onClick={handleGuardar}
        disabled={!todasRespondidas}
        tamaño="lg"
        className="w-full"
      >
        Guardar mi estado de hoy
      </Button>
    </div>
  );
}
