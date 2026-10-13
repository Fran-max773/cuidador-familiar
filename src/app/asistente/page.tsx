import { AlertCircle } from "lucide-react";
import { ChatInterface } from "@/components/asistente/ChatInterface";

export default function AsistentePage() {
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 9rem)" }}>
      <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-sage-50 to-warm-50 border border-sage-200 mb-3">
        <p className="text-sage-700 font-semibold mb-0.5">Asistente IA</p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Pregúntame sobre situaciones del día a día. Estoy aquí para orientarte.
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-xl px-4 py-2.5 mb-4 bg-amber-50 border border-amber-200 text-amber-700">
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          Orientación general: no sustituye a un profesional sanitario. Ante una situación urgente, busca atención profesional.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
