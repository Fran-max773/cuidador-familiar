"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import type { MensajeChat } from "@/types";
import { cn } from "@/lib/utils";

const TEXTO_BIENVENIDA_DEFAULT =
  "Hola. Estoy aquí para ayudarte. Puedes preguntarme sobre situaciones del día a día: agitación, desorientación, medicación, cómo comunicarte mejor… Cuéntame qué está pasando.";

interface Props {
  endpoint?: string;
  mensajeInicial?: string;
}

export function ChatInterface({ endpoint = "/api/chat", mensajeInicial }: Props) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>(() => [
    {
      id: "bienvenida",
      rol: "asistente",
      texto: mensajeInicial ?? TEXTO_BIENVENIDA_DEFAULT,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput]       = useState("");
  const [cargando, setCargando] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    setInput("");

    const msgUsuario: MensajeChat = {
      id: crypto.randomUUID(),
      rol: "usuario",
      texto,
      timestamp: new Date().toISOString(),
    };

    const historialActualizado = [...mensajes, msgUsuario];
    setMensajes(historialActualizado);
    setCargando(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: historialActualizado }),
      });
      const data = await res.json();
      const textoRespuesta = res.ok
        ? data.respuesta
        : "Lo siento, ha habido un problema al conectar. Inténtalo de nuevo.";

      setMensajes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          rol: "asistente",
          texto: textoRespuesta,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          rol: "asistente",
          texto: "No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.rol === "usuario" ? "flex-row-reverse" : "flex-row")}
          >
            {msg.rol === "asistente" && (
              <div className="w-9 h-9 rounded-full bg-sage-100 flex-shrink-0 flex items-center justify-center text-sage-600">
                <Bot size={18} />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-base leading-relaxed",
                msg.rol === "usuario"
                  ? "bg-sage-500 text-white rounded-tr-sm"
                  : "bg-white border border-beige-200 text-gray-800 rounded-tl-sm"
              )}
            >
              {msg.texto}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-sage-100 flex-shrink-0 flex items-center justify-center text-sage-600">
              <Bot size={18} />
            </div>
            <div className="bg-white border border-beige-200 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 bg-sage-300 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-sage-300 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-sage-300 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="flex gap-2 pt-3 border-t border-beige-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escribe tu pregunta…"
          className="flex-1 px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300 text-gray-800"
        />
        <button
          onClick={enviar}
          disabled={!input.trim() || cargando}
          className="w-12 h-12 bg-sage-500 text-white rounded-xl flex items-center justify-center hover:bg-sage-600 transition-colors disabled:opacity-50"
          aria-label="Enviar"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
