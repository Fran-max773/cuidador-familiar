"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, MessageSquareQuote } from "lucide-react";
import { situaciones } from "@/data/situaciones";
import { Card } from "@/components/ui/Card";
import { OtraSituacion } from "@/components/que-hago-si/OtraSituacion";

export default function QueHagoSiPage() {
  const [abierto, setAbierto] = useState<string | null>(null);

  const toggle = (id: string) => setAbierto((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-sky-50 to-sage-50 border border-sky-100 mb-2">
        <p className="text-sky-700 font-semibold mb-0.5">¿Qué hago si…?</p>
        <p className="text-gray-600 text-base leading-relaxed">
          Situaciones frecuentes y cómo manejarlas con calma.
        </p>
      </div>

      {situaciones.map((sit) => (
        <div key={sit.id} className="rounded-2xl overflow-hidden border border-beige-200 bg-white shadow-sm">
          <button
            onClick={() => toggle(sit.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-beige-50 transition-colors"
          >
            <span className="font-semibold text-gray-800 text-lg">{sit.titulo}</span>
            {abierto === sit.id ? (
              <ChevronUp size={20} className="text-sage-500 flex-shrink-0" />
            ) : (
              <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
            )}
          </button>

          {abierto === sit.id && (
            <div className="px-5 pb-5 space-y-4 border-t border-beige-200 pt-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <h3 className="font-semibold text-amber-700 text-sm uppercase tracking-wide">Qué puede estar pasando</h3>
                </div>
                <ul className="space-y-1">
                  {sit.quePasando.map((item, i) => (
                    <li key={i} className="text-gray-700 text-base pl-3 border-l-2 border-amber-200">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={16} className="text-red-400" />
                  <h3 className="font-semibold text-red-600 text-sm uppercase tracking-wide">Qué evitar</h3>
                </div>
                <ul className="space-y-1">
                  {sit.queEvitar.map((item, i) => (
                    <li key={i} className="text-gray-700 text-base pl-3 border-l-2 border-red-100">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-sage-500" />
                  <h3 className="font-semibold text-sage-600 text-sm uppercase tracking-wide">Qué hacer</h3>
                </div>
                <ul className="space-y-1">
                  {sit.queHacer.map((item, i) => (
                    <li key={i} className="text-gray-700 text-base pl-3 border-l-2 border-sage-300">{item}</li>
                  ))}
                </ul>
              </div>

              <Card className="bg-sage-50 border-sage-200">
                <div className="flex gap-2">
                  <MessageSquareQuote size={18} className="text-sage-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide mb-1">Frase que puedes decir</p>
                    <p className="text-gray-700 text-base italic">{sit.fraseRecomendada}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      ))}

      <OtraSituacion />
    </div>
  );
}
