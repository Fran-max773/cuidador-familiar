"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Upload, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  descargarCopia, leerCopia, restaurarCopia, resumir,
  type CopiaSeguridad as Copia, type ResumenCopia,
} from "@/lib/copiaSeguridad";

const CLAVE_ULTIMA = "cf_ultima_copia"; // fecha (texto) de la última copia descargada desde este dispositivo

function describir(r: ResumenCopia) {
  return `${r.medicaciones} medicamentos (con sus tomas), ${r.tareas} tareas, ${r.citas} citas, ${r.mediciones} mediciones` +
    `${r.bienestar ? `, ${r.bienestar} registros de bienestar` : ""}${r.tienePerfil ? " y el perfil" : ""}`;
}

// Copia de seguridad: descargar un archivo con todos los datos del dispositivo y restaurarlo después.
export function CopiaSeguridad() {
  const [ultima, setUltima] = useState<string | null>(null);
  useEffect(() => {
    try { setUltima(localStorage.getItem(CLAVE_ULTIMA)); } catch { /* sin almacenamiento */ }
  }, []);
  const [descargada, setDescargada] = useState<ResumenCopia | null>(null);
  const [pendiente, setPendiente] = useState<Copia | null>(null);
  const [restaurada, setRestaurada] = useState<ResumenCopia | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const descargar = () => {
    setError(""); setRestaurada(null);
    try {
      setDescargada(descargarCopia());
      const hoy = new Date().toLocaleDateString("es-ES");
      try { localStorage.setItem(CLAVE_ULTIMA, hoy); } catch { /* sin almacenamiento */ }
      setUltima(hoy);
    } catch {
      setError("No se ha podido crear la copia. Inténtalo de nuevo.");
    }
  };

  const elegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite elegir de nuevo el mismo archivo
    if (!archivo) return;
    setError(""); setDescargada(null); setRestaurada(null); setPendiente(null);
    try {
      if (archivo.size > 20 * 1024 * 1024) throw new Error("El archivo es demasiado grande para ser una copia de la app.");
      setPendiente(leerCopia(await archivo.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido leer el archivo.");
    }
  };

  const restaurar = () => {
    if (!pendiente) return;
    try {
      restaurarCopia(pendiente);
      setRestaurada(resumir(pendiente));
      setPendiente(null);
    } catch {
      setError("No se ha podido restaurar la copia. No se ha cambiado nada importante; inténtalo de nuevo.");
    }
  };

  return (
    <Card className="border-sky-200">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-sky-600" />
        <h2 className="font-semibold text-gray-800 text-lg">Copia de seguridad</h2>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-1">
        Todo lo que apuntas se guarda solo en este dispositivo. Si cambias de móvil o borras los datos del navegador, se pierde.
        Descarga una copia de vez en cuando y guárdala en un sitio seguro (por ejemplo, envíatela por correo).
      </p>
      <p className="text-xs text-gray-400 mb-4">
        El archivo contiene datos de salud: no lo compartas con quien no deba verlos.
        {ultima ? ` Última copia descargada: ${ultima}.` : " Aún no has descargado ninguna copia."}
      </p>

      <Button className="w-full" onClick={descargar}>
        <Download size={18} /> Descargar copia de seguridad
      </Button>
      {descargada && (
        <p className="flex gap-2 items-start text-sm text-sage-700 mt-3">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>Copia descargada con {describir(descargada)}. Búscala en la carpeta de descargas.</span>
        </p>
      )}

      <div className="border-t border-beige-200 mt-5 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Restaurar desde una copia</p>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          Añade lo que falte a este dispositivo. No borra nada de lo que ya tienes.
        </p>
        <input ref={inputRef} type="file" accept=".json,application/json" onChange={elegirArchivo} className="hidden" />
        <Button variante="secundario" className="w-full" onClick={() => inputRef.current?.click()}>
          <Upload size={18} /> Elegir archivo de copia
        </Button>

        {pendiente && (
          <div className="mt-3 rounded-xl bg-sky-50 border border-sky-100 p-3">
            <p className="text-sm text-sky-900 leading-relaxed">
              Copia encontrada{pendiente.fecha ? ` (${new Date(pendiente.fecha).toLocaleDateString("es-ES")})` : ""}: {describir(resumir(pendiente))}.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variante="secundario" className="flex-1" onClick={() => setPendiente(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={restaurar}>Restaurar</Button>
            </div>
          </div>
        )}
        {restaurada && (
          <div className="mt-3 text-sm text-sage-700">
            <p className="flex gap-2 items-start">
              <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
              <span>Copia restaurada.</span>
            </p>
            {/* Recarga completa para que todas las pantallas lean los datos nuevos */}
            <a href="/" className="inline-flex items-center mt-1 font-medium underline min-h-[44px]">Ir a Hoy</a>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-3" role="alert">{error}</p>}
    </Card>
  );
}
