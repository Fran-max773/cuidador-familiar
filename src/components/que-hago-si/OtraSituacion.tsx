"use client";
import { useState } from "react";
import { Send, Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Estado = "idle" | "cargando" | "ok" | "error";

export function OtraSituacion() {
  const [abierto, setAbierto]       = useState(false);
  const [texto, setTexto]           = useState("");
  const [respuesta, setRespuesta]   = useState("");
  const [estado, setEstado]         = useState<Estado>("idle");

  const consultar = async () => {
    if (!texto.trim() || estado === "cargando") return;
    setEstado("cargando");
    setRespuesta("");

    try {
      const res = await fetch("/api/consulta-situacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situacion: texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      setRespuesta(data.respuesta);
      setEstado("ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar";
      setRespuesta(msg);
      setEstado("error");
    }
  };

  const reiniciar = () => {
    setTexto(""); setRespuesta(""); setEstado("idle");
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-sage-200 bg-white shadow-sm">
      {/* Cabecera — siempre visible */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sage-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-sage-500" />
          <span className="font-semibold text-gray-800 text-lg">Otra situación</span>
        </div>
        <span className="text-sm text-sage-600 font-medium">Consultar con IA</span>
      </button>

      {/* Cuerpo desplegable */}
      {abierto && (
        <div className="px-5 pb-5 border-t border-sage-100 pt-4 space-y-4">

          {estado !== "ok" ? (
            <>
              <p className="text-gray-600 leading-relaxed">
                Describe la situación que estás viviendo con tu familiar. La IA
                te dará orientación práctica para ese momento.
              </p>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ej: Mi madre lleva dos días muy triste y no quiere salir de la cama..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none text-base leading-relaxed"
              />
              <Button
                onClick={consultar}
                disabled={!texto.trim() || estado === "cargando"}
                tamaño="lg"
                className="w-full"
              >
                {estado === "cargando" ? (
                  <>
                    <span className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                    Consultando...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Consultar
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Respuesta de la IA */}
              <div className="bg-sage-50 rounded-xl p-4 text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                {respuesta}
              </div>

              {/* Aviso profesional */}
              <Card className="bg-amber-50 border-amber-200">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <span className="font-semibold">Estos consejos son orientativos.</span>{" "}
                    Para el bienestar de tu familiar, lo más recomendable siempre
                    es el seguimiento y asesoramiento de un profesional sanitario
                    (médico, psicólogo o trabajador social especializado). Esta
                    herramienta puede ayudarte en el día a día, pero no sustituye
                    la supervisión de un experto.
                  </p>
                </div>
              </Card>

              <button
                onClick={reiniciar}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mx-auto"
              >
                <RotateCcw size={14} /> Hacer otra consulta
              </button>
            </>
          )}

          {estado === "error" && (
            <p className="text-red-500 text-sm text-center">{respuesta}</p>
          )}
        </div>
      )}
    </div>
  );
}
