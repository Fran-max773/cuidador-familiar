"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMiembros } from "@/hooks/useMiembros";
import type { SesionGrupo } from "@/hooks/useGrupo";
import type { Medicion, PerfilFamiliar, TipoMedicion } from "@/types";
import {
  TIPOS_MEDICION, ORDEN_TIPOS, parsearNumero, fechaLocalHoy, horaLocalAhora,
} from "@/lib/mediciones";
import { cn } from "@/lib/utils";
import { Chip } from "./Chip";

const CLS_INPUT = "w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300 text-gray-800";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (datos: Omit<Medicion, "id" | "registradaPor" | "privada">, compartir: boolean) => Promise<boolean>;
  sesion: SesionGrupo | null;
  personasPrevias: string[];
  tipoInicial?: TipoMedicion;
}

export function ModalMedicion({ abierto, onCerrar, onGuardar, sesion, personasPrevias, tipoInicial = "tension" }: Props) {
  const miembros = useMiembros();
  const [nombreFamiliar, setNombreFamiliar] = useState("");

  const [tipo, setTipo] = useState<TipoMedicion>(tipoInicial);
  const [persona, setPersona] = useState("");
  const [otraPersona, setOtraPersona] = useState(false);
  const [valor, setValor] = useState("");
  const [valor2, setValor2] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [compartir, setCompartir] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cf_perfil");
      if (raw) setNombreFamiliar((JSON.parse(raw) as PerfilFamiliar).nombre?.trim() ?? "");
    } catch { /* ignorar */ }
  }, [abierto]);

  const familiar = nombreFamiliar || "Mi familiar";
  const yo = sesion?.miNombre || "Yo";

  const opciones: { valor: string; etiqueta: string }[] = [];
  const anadir = (valor: string, etiqueta = valor) => {
    if (valor && !opciones.some((o) => o.valor === valor)) opciones.push({ valor, etiqueta });
  };
  anadir(familiar, nombreFamiliar ? `${nombreFamiliar} (familiar)` : "Mi familiar");
  anadir(yo, sesion ? `Yo (${yo})` : "Yo");
  miembros.forEach((m) => anadir(m));
  personasPrevias.forEach((p) => anadir(p));

  // Al abrir: fecha/hora actuales y formulario limpio; la persona por defecto es el familiar
  useEffect(() => {
    if (!abierto) return;
    setTipo(tipoInicial);
    setPersona("");
    setOtraPersona(false);
    setCompartir(true);
    setValor(""); setValor2(""); setNotas(""); setError("");
    setFecha(fechaLocalHoy());
    setHora(horaLocalAhora());
  }, [abierto, tipoInicial]);

  const personaElegida = persona || familiar;
  const cfg = TIPOS_MEDICION[tipo];

  const anadirNota = (s: string) =>
    setNotas((n) => (!n.trim() ? s : n.includes(s) ? n : `${n.trim()}, ${s}`));

  const handleGuardar = async () => {
    setError("");
    const v = parsearNumero(valor);
    const v2 = cfg.doble ? parsearNumero(valor2) : null;
    const quien = personaElegida.trim();

    if (!quien) { setError("Indica a quién se le ha tomado."); return; }
    if (v == null) { setError(cfg.doble ? "Escribe la tensión máxima." : "Escribe el valor."); return; }
    if (cfg.doble && v2 == null) { setError("Escribe la tensión mínima."); return; }
    const fuera = (n: number) => n < cfg.min || n > cfg.max;
    if (fuera(v) || (v2 != null && fuera(v2))) {
      setError("Ese número no parece correcto. Revisa que esté bien escrito.");
      return;
    }
    if (cfg.doble && v2 != null && v2 >= v) {
      setError("La máxima tiene que ser mayor que la mínima. ¿Puede que estén al revés?");
      return;
    }
    if (!fecha || !hora) { setError("Indica la fecha y la hora."); return; }

    setGuardando(true);
    const ok = await onGuardar(
      { tipo, valor: v, valor2: v2, persona: quien, fecha, hora, notas: notas.trim() },
      !!sesion && compartir,
    );
    setGuardando(false);
    if (ok) onCerrar();
    else setError("No se ha podido guardar. Comprueba tu conexión e inténtalo de nuevo.");
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Añadir medición">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué has medido?</label>
          <div className="grid grid-cols-2 gap-2">
            {ORDEN_TIPOS.map((t) => (
              <Chip key={t} activo={tipo === t} onClick={() => { setTipo(t); setError(""); }}>
                <span className="mr-1">{TIPOS_MEDICION[t].emoji}</span>{TIPOS_MEDICION[t].corta}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">¿A quién?</label>
          <div className="flex flex-wrap gap-2">
            {opciones.map((o) => (
              <Chip
                key={o.valor}
                activo={!otraPersona && personaElegida === o.valor}
                onClick={() => { setOtraPersona(false); setPersona(o.valor); setCompartir(o.valor === familiar); }}
              >
                {o.etiqueta}
              </Chip>
            ))}
            <Chip activo={otraPersona} onClick={() => { setOtraPersona(true); setPersona(""); setCompartir(false); }}>
              Otra persona
            </Chip>
          </div>
          {otraPersona && (
            <input
              type="text"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Nombre (ej: Tía Carmen)"
              className={cn(CLS_INPUT, "mt-2")}
              autoFocus
            />
          )}
        </div>

        {cfg.doble ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máxima (alta)</label>
              <input type="text" inputMode="numeric" value={valor} onChange={(e) => setValor(e.target.value)}
                placeholder="120" className={CLS_INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mínima (baja)</label>
              <input type="text" inputMode="numeric" value={valor2} onChange={(e) => setValor2(e.target.value)}
                placeholder="80" className={CLS_INPUT} />
            </div>
            <p className="col-span-2 text-xs text-gray-400 -mt-1">En mmHg. Si el aparato da también el pulso, puedes apuntarlo aparte como «Pulso».</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor ({cfg.unidad})</label>
            <input
              type="text"
              inputMode={cfg.decimales ? "decimal" : "numeric"}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={cfg.placeholder}
              className={CLS_INPUT}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={CLS_INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={CLS_INPUT} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {cfg.sugerenciasNota.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => anadirNota(s)}
                className="px-2.5 py-1.5 rounded-full text-xs border border-beige-200 text-gray-500 hover:bg-beige-100 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
          <input type="text" value={notas} onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: estaba nervioso, se tomó la pastilla tarde…" className={CLS_INPUT} />
        </div>

        {sesion && (
          <button
            type="button"
            role="switch"
            aria-checked={compartir}
            onClick={() => setCompartir((c) => !c)}
            className="w-full flex items-center gap-3 rounded-xl border border-beige-200 px-4 py-3 text-left hover:bg-beige-50 transition-colors"
          >
            <span className={cn(
              "relative w-11 h-6 rounded-full flex-shrink-0 transition-colors",
              compartir ? "bg-sage-500" : "bg-gray-300"
            )}>
              <span className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                compartir && "translate-x-5"
              )} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-gray-800">Compartir con el grupo</span>
              <span className="block text-xs text-gray-500">
                {compartir
                  ? "La verán todos los miembros del grupo familiar."
                  : "🔒 Solo se guarda en este dispositivo. Nadie más la verá."}
              </span>
            </span>
          </button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variante="secundario" className="flex-1" onClick={onCerrar}>Cancelar</Button>
          <Button className="flex-1" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
