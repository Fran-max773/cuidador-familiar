"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff, PauseCircle, X } from "lucide-react";
import { getSesionGuardada } from "@/hooks/useGrupo";
import { GRUPOS_DISPONIBLES, EVENTO_FALLO_GRUPO } from "@/lib/grupoConfig";

const CLAVE_PAUSA_VISTO = "cf_aviso_grupo_pausa_visto";

// Avisos sobre el grupo familiar, visibles en todas las pantallas:
//  - "en pausa": el dispositivo estaba en un grupo y los grupos están desactivados (se puede cerrar);
//  - "sin conexión": un hook no ha podido leer los datos del grupo (para no mostrar listas vacías sin explicación).
// En Hoy el hero va pegado a la cabecera: el layout no lo pinta ahí y la página lo pone bajo el hero (enHoy).
export function AvisoGrupo({ enHoy = false }: { enHoy?: boolean }) {
  const pathname = usePathname();
  const esHoy = pathname === "/";
  const [enPausa, setEnPausa] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    if (!GRUPOS_DISPONIBLES && getSesionGuardada()) {
      let visto = false;
      try { visto = localStorage.getItem(CLAVE_PAUSA_VISTO) === "1"; } catch { /* sin almacenamiento */ }
      setEnPausa(!visto);
    }
    const onFallo = () => setSinConexion(true);
    window.addEventListener(EVENTO_FALLO_GRUPO, onFallo);
    return () => window.removeEventListener(EVENTO_FALLO_GRUPO, onFallo);
  }, []);

  const cerrarPausa = () => {
    try { localStorage.setItem(CLAVE_PAUSA_VISTO, "1"); } catch { /* sin almacenamiento */ }
    setEnPausa(false);
  };

  if (esHoy !== enHoy) return null;

  if (sinConexion) {
    return (
      <div role="alert" className="mb-4 flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
        <WifiOff size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800 leading-relaxed">
          <span className="font-semibold">No se ha podido conectar con tu grupo familiar.</span>{" "}
          Lo que ves puede estar incompleto. Comprueba tu conexión a internet y vuelve a abrir la app.
        </p>
      </div>
    );
  }

  if (enPausa && pathname !== "/grupo") {
    return (
      <div className="mb-4 flex gap-3 items-start bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3">
        <PauseCircle size={20} className="text-sky-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sky-900 leading-relaxed flex-1">
          <span className="font-semibold">Tu grupo familiar está en pausa.</span>{" "}
          Ahora ves lo guardado en este dispositivo. Lo que apuntasteis en el grupo no se ha perdido.{" "}
          <Link href="/grupo" className="underline font-medium">Más información</Link>
        </p>
        <button
          onClick={cerrarPausa}
          className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center text-sky-500 hover:text-sky-700"
          aria-label="Cerrar aviso"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return null;
}
