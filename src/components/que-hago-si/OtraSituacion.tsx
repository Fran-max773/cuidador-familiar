"use client";
import { useState, useRef } from "react";
import { Send, Sparkles, AlertCircle, RotateCcw, Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Estado    = "idle" | "cargando" | "ok" | "error";
type EstadoVoz = "inactivo" | "escuchando" | "no-soportado";

// Tipos mínimos para Web Speech API (no incluidos en TS por defecto)
interface SpeechRec extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend:    (() => void) | null;
  onerror:  (() => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: { [i: number]: { isFinal: boolean; [j: number]: { transcript: string } }; length: number };
}

function getSR(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export function OtraSituacion() {
  const [abierto, setAbierto]     = useState(false);
  const [texto, setTexto]         = useState("");
  const [interino, setInterino]   = useState("");   // texto en tiempo real aún no confirmado
  const [respuesta, setRespuesta] = useState("");
  const [estado, setEstado]       = useState<Estado>("idle");
  const [voz, setVoz]             = useState<EstadoVoz>("inactivo");
  const recRef                    = useRef<SpeechRec | null>(null);

  const iniciarVoz = () => {
    const SR = getSR();
    if (!SR) { setVoz("no-soportado"); return; }

    const rec = new SR();
    rec.lang             = "es-ES";
    rec.continuous       = false;
    rec.interimResults   = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let final = "", interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final  += r[0].transcript;
        else           interim += r[0].transcript;
      }
      if (final) {
        setTexto((prev) => (prev.trim() ? prev.trimEnd() + " " + final.trim() : final.trim()));
        setInterino("");
      } else {
        setInterino(interim);
      }
    };

    rec.onend  = () => { setVoz("inactivo"); setInterino(""); };
    rec.onerror = () => { setVoz("inactivo"); setInterino(""); };

    recRef.current = rec;
    rec.start();
    setVoz("escuchando");
  };

  const detenerVoz = () => {
    recRef.current?.stop();
    setVoz("inactivo");
    setInterino("");
  };

  const consultar = async () => {
    if (!texto.trim() || estado === "cargando") return;
    setEstado("cargando");
    setRespuesta("");
    try {
      const res  = await fetch("/api/consulta-situacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situacion: texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      setRespuesta(data.respuesta);
      setEstado("ok");
    } catch (err: unknown) {
      setRespuesta(err instanceof Error ? err.message : "Error al conectar");
      setEstado("error");
    }
  };

  const reiniciar = () => {
    setTexto(""); setRespuesta(""); setEstado("idle");
    setVoz("inactivo"); setInterino("");
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-sage-200 bg-white shadow-sm">
      {/* Cabecera */}
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

      {abierto && (
        <div className="px-5 pb-5 border-t border-sage-100 pt-4 space-y-4">
          {estado !== "ok" ? (
            <>
              <p className="text-gray-600 leading-relaxed">
                Describe la situación que estás viviendo. Puedes escribirla o
                dictarla con el micrófono y la IA te dará orientación práctica.
              </p>

              {/* Textarea con botón micrófono integrado */}
              <div className="relative">
                <textarea
                  value={texto}
                  onChange={(e) => voz !== "escuchando" && setTexto(e.target.value)}
                  readOnly={voz === "escuchando"}
                  placeholder="Ej: Mi madre lleva dos días muy triste y no quiere salir de la cama..."
                  rows={4}
                  className={cn(
                    "w-full px-4 py-3 pr-14 rounded-xl border text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none text-base leading-relaxed transition-colors",
                    voz === "escuchando"
                      ? "border-red-300 bg-red-50/30"
                      : "border-beige-200"
                  )}
                />

                {/* Botón micro — dentro del textarea, esquina inferior derecha */}
                {voz !== "no-soportado" && (
                  <button
                    type="button"
                    onClick={voz === "escuchando" ? detenerVoz : iniciarVoz}
                    aria-label={voz === "escuchando" ? "Detener grabación" : "Dictar por voz"}
                    className={cn(
                      "absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                      voz === "escuchando"
                        ? "bg-red-500 text-white shadow-red-200 shadow-md"
                        : "bg-sage-100 text-sage-600 hover:bg-sage-200"
                    )}
                  >
                    {voz === "escuchando"
                      ? <Square size={13} fill="currentColor" />
                      : <Mic size={16} />
                    }
                  </button>
                )}
              </div>

              {/* Texto en tiempo real mientras escucha */}
              {voz === "escuchando" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                    Escuchando… habla con claridad
                  </div>
                  {interino && (
                    <p className="text-sm text-gray-400 italic px-1 leading-relaxed">
                      {interino}
                    </p>
                  )}
                </div>
              )}

              {/* Si el navegador no soporta la API */}
              {voz === "no-soportado" && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <MicOff size={15} />
                  Tu navegador no admite el micrófono. Escribe la situación a mano.
                </p>
              )}

              <Button
                onClick={consultar}
                disabled={!texto.trim() || estado === "cargando" || voz === "escuchando"}
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
                  <><Send size={18} /> Consultar</>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-sage-50 rounded-xl p-4 text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                {respuesta}
              </div>

              <Card className="bg-amber-50 border-amber-200">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <span className="font-semibold">Estos consejos son orientativos.</span>{" "}
                    Para el bienestar de tu familiar, lo más recomendable siempre es el
                    seguimiento de un profesional sanitario (médico, psicólogo o trabajador
                    social). Esta herramienta te ayuda en el día a día, pero no sustituye
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
