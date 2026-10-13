"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMediciones } from "@/hooks/useMediciones";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/mediciones/Chip";
import { FilaMedicion } from "@/components/mediciones/FilaMedicion";
import { GraficoMedicion } from "@/components/mediciones/GraficoMedicion";
import { ModalMedicion } from "@/components/mediciones/ModalMedicion";
import { TIPOS_MEDICION, ORDEN_TIPOS } from "@/lib/mediciones";
import { formatearFecha } from "@/lib/utils";
import type { Medicion, TipoMedicion } from "@/types";

const TODAS = "__todas__";

function agruparPorFecha(lista: Medicion[]): [string, Medicion[]][] {
  const grupos = new Map<string, Medicion[]>();
  lista.forEach((m) => grupos.set(m.fecha, [...(grupos.get(m.fecha) ?? []), m]));
  return Array.from(grupos.entries());
}

export default function MedicionesPage() {
  const { mediciones, cargado, agregar, eliminar, error, sesion } = useMediciones();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [persona, setPersona] = useState<string>(TODAS);
  const [tipo, setTipo] = useState<TipoMedicion | typeof TODAS>(TODAS);
  const [pendienteBorrar, setPendienteBorrar] = useState<string | null>(null);

  const personas = Array.from(new Set(mediciones.map((m) => m.persona))).filter(Boolean);
  const tiposConDatos = ORDEN_TIPOS.filter((t) => mediciones.some((m) => m.tipo === t));

  // Si el filtro elegido deja de existir (p. ej. se borró la última medición), volver a "Todas"
  const personaActiva = persona !== TODAS && !personas.includes(persona) ? TODAS : persona;
  const tipoActivo = tipo !== TODAS && !tiposConDatos.includes(tipo) ? TODAS : tipo;

  const filtradas = mediciones.filter((m) =>
    (personaActiva === TODAS || m.persona === personaActiva) &&
    (tipoActivo === TODAS || m.tipo === tipoActivo)
  );

  // El gráfico necesita un tipo y una sola persona
  const personaGrafico = personaActiva !== TODAS ? personaActiva : personas.length === 1 ? personas[0] : null;

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-gray-500 text-base">
          Tensión, azúcar, temperatura… de tu familiar, tuyas o de quien quieras.
        </p>
        <Button tamaño="md" className="flex-shrink-0" onClick={() => setModalAbierto(true)}>
          <Plus size={18} /> Añadir
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {cargado && mediciones.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center font-medium py-1">Todavía no hay mediciones.</p>
          <p className="text-gray-400 text-sm text-center mt-1">
            Pulsa «Añadir» y apunta la primera. Con el tiempo verás aquí cómo evolucionan.
          </p>
        </Card>
      ) : mediciones.length > 0 && (
        <>
          {personas.length > 1 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Persona</p>
              <div className="flex flex-wrap gap-2">
                <Chip activo={personaActiva === TODAS} onClick={() => setPersona(TODAS)}>Todas</Chip>
                {personas.map((p) => (
                  <Chip key={p} activo={personaActiva === p} onClick={() => setPersona(p)}>{p}</Chip>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Tipo</p>
            <div className="flex flex-wrap gap-2">
              <Chip activo={tipoActivo === TODAS} onClick={() => setTipo(TODAS)}>Todas</Chip>
              {tiposConDatos.map((t) => (
                <Chip key={t} activo={tipoActivo === t} onClick={() => setTipo(t)}>
                  <span className="mr-1">{TIPOS_MEDICION[t].emoji}</span>{TIPOS_MEDICION[t].corta}
                </Chip>
              ))}
            </div>
          </div>

          <Card>
            {tipoActivo === TODAS ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Elige un tipo (por ejemplo, Tensión) para ver el gráfico de su evolución.
              </p>
            ) : !personaGrafico ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Elige una persona para ver el gráfico de su {TIPOS_MEDICION[tipoActivo].corta.toLowerCase()}.
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-600 mb-2 text-center">
                  {TIPOS_MEDICION[tipoActivo].etiqueta} · {personaGrafico}
                </p>
                <GraficoMedicion
                  tipo={tipoActivo}
                  mediciones={mediciones.filter((m) => m.tipo === tipoActivo && m.persona === personaGrafico)}
                />
              </>
            )}
          </Card>

          <div className="space-y-4">
            {agruparPorFecha(filtradas).map(([fecha, lista]) => (
              <div key={fecha}>
                <p className="text-sm font-medium text-gray-500 first-letter:uppercase mb-2">{formatearFecha(fecha)}</p>
                <div className="space-y-2">
                  {lista.map((m) => (
                    <div key={m.id}>
                      <FilaMedicion
                        medicion={m}
                        mostrarFecha={false}
                        onEliminar={(id) => setPendienteBorrar(pendienteBorrar === id ? null : id)}
                      />
                      {pendienteBorrar === m.id && (
                        <div className="flex items-center justify-end gap-2 mt-1.5">
                          <span className="text-sm text-gray-500">¿Borrar esta medición?</span>
                          <Button variante="secundario" tamaño="sm" className="min-h-[44px]" onClick={() => setPendienteBorrar(null)}>
                            No
                          </Button>
                          <Button variante="peligro" tamaño="sm" className="min-h-[44px]"
                            onClick={() => { eliminar(m.id); setPendienteBorrar(null); }}>
                            Sí, borrar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Este registro es para llevar un seguimiento y enseñárselo al médico. La app no interpreta los valores:
        si te preocupa alguna cifra, consulta con un profesional sanitario.
      </p>

      <ModalMedicion
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={agregar}
        sesion={sesion}
        personasPrevias={personas}
        tipoInicial={tipoActivo === TODAS ? "tension" : tipoActivo}
      />
    </div>
  );
}
