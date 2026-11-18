"use client";
import { useEffect, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const CLAVE_SOLICITADO = "cf_solicitud_grupo"; // fecha de la solicitud enviada desde este dispositivo

const claseInput =
  "w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300 text-gray-800";

// Formulario "Solicitar que se active el grupo familiar": envía un correo a Fran (/api/solicitar-grupo)
export function SolicitarGrupo() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [web, setWeb] = useState(""); // campo trampa para bots
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [solicitadoEl, setSolicitadoEl] = useState<string | null>(null);

  useEffect(() => {
    try { setSolicitadoEl(localStorage.getItem(CLAVE_SOLICITADO)); } catch { /* sin almacenamiento */ }
  }, []);

  const enviar = async () => {
    setEnviando(true); setError("");
    try {
      const r = await fetch("/api/solicitar-grupo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje, web }),
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok) { setError(datos.error ?? "No se ha podido enviar la solicitud. Inténtalo más tarde."); return; }
      const hoy = new Date().toLocaleDateString("es-ES");
      try { localStorage.setItem(CLAVE_SOLICITADO, hoy); } catch { /* sin almacenamiento */ }
      setSolicitadoEl(hoy);
    } catch {
      setError("No se ha podido enviar la solicitud. Comprueba tu conexión e inténtalo de nuevo.");
    } finally { setEnviando(false); }
  };

  if (solicitadoEl) {
    return (
      <Card className="bg-sage-50 border-sage-200">
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={22} className="text-sage-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sage-800">Solicitud enviada el {solicitadoEl}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Gracias. Nos ayuda a saber cuántas familias lo necesitan. Si nos dejaste tu correo, te avisaremos cuando esté disponible.
            </p>
            <button
              onClick={() => setSolicitadoEl(null)}
              className="mt-2 text-sm text-sage-600 underline min-h-[44px]"
            >
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold text-gray-800 text-lg mb-1">¿Te gustaría usarlo?</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Pídenos que lo activemos. Así sabremos cuántas familias lo necesitan. Todos los campos son opcionales.
      </p>
      <div className="space-y-3">
        <input
          type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre" className={claseInput} maxLength={80} autoComplete="name"
        />
        <div>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo electrónico" className={claseInput} maxLength={120} autoComplete="email"
          />
          <p className="text-xs text-gray-400 mt-1">Solo para avisarte cuando esté disponible.</p>
        </div>
        <textarea
          value={mensaje} onChange={(e) => setMensaje(e.target.value)}
          placeholder="¿Con quién compartirías los cuidados? (opcional)"
          className={`${claseInput} min-h-[90px] resize-y`} maxLength={1000}
        />
        {/* Campo trampa: oculto a las personas, los bots lo rellenan */}
        <input
          type="text" value={web} onChange={(e) => setWeb(e.target.value)}
          tabIndex={-1} autoComplete="off" aria-hidden="true"
          className="absolute -left-[9999px] w-px h-px opacity-0" name="web"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" onClick={enviar} disabled={enviando}>
          <Send size={18} /> {enviando ? "Enviando…" : "Solicitar que se active"}
        </Button>
      </div>
    </Card>
  );
}
