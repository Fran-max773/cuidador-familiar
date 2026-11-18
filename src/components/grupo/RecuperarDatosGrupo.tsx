"use client";
import { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { grupoAccesible, recuperarDatosDelGrupo, type ResumenRecuperacion } from "@/lib/recuperarGrupo";

// Botón para copiar al dispositivo lo apuntado en un grupo en pausa.
// Solo aparece si el grupo se puede leer en ese momento (si Supabase está pausado, no se muestra).
export function RecuperarDatosGrupo({ grupoId }: { grupoId: string }) {
  const [accesible, setAccesible] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");
  const [resumen, setResumen] = useState<ResumenRecuperacion | null>(null);

  useEffect(() => { grupoAccesible(grupoId).then(setAccesible); }, [grupoId]);

  const recuperar = async () => {
    setTrabajando(true); setError("");
    try {
      setResumen(await recuperarDatosDelGrupo(grupoId));
    } catch (e) {
      console.error("Error al recuperar los datos del grupo:", e);
      setError("No se han podido traer los datos. Comprueba tu conexión e inténtalo de nuevo.");
    } finally { setTrabajando(false); }
  };

  if (resumen) {
    return (
      <Card className="bg-sage-50 border-sage-200">
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={22} className="text-sage-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sage-800">Datos copiados a este dispositivo</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {resumen.medicaciones} medicamentos (con sus tomas), {resumen.tareas} tareas,{" "}
              {resumen.citas} citas y {resumen.mediciones} mediciones.
            </p>
            {/* Recarga completa para que todas las pantallas lean los datos nuevos */}
            <a href="/" className="inline-flex items-center mt-2 text-sm font-medium text-sage-700 underline min-h-[44px]">
              Ir a Hoy
            </a>
          </div>
        </div>
      </Card>
    );
  }

  if (!accesible) return null;

  return (
    <Card className="border-sky-200">
      <h2 className="font-semibold text-gray-800 text-lg mb-1">Traer tus datos a este dispositivo</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Copia aquí la medicación (con sus tomas), las tareas, las citas y las mediciones de tu grupo,
        para seguir usándolas mientras el grupo está en pausa. No se borra nada del grupo y no se duplica lo que ya tengas.
      </p>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <Button className="w-full" onClick={recuperar} disabled={trabajando}>
        <Download size={18} /> {trabajando ? "Copiando…" : "Traer mis datos"}
      </Button>
    </Card>
  );
}
