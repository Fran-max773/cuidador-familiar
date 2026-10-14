"use client";
import { useState } from "react";
import { useMediciones } from "@/hooks/useMediciones";
import { Card } from "@/components/ui/Card";
import { BotonAnadir } from "@/components/ui/BotonAnadir";
import { ModalMedicion } from "@/components/mediciones/ModalMedicion";
import { FilaMedicion } from "@/components/mediciones/FilaMedicion";

export function MedicionesSection() {
  const { mediciones, agregar, error, sesion } = useMediciones();
  const [modalAbierto, setModalAbierto] = useState(false);
  const personasPrevias = Array.from(new Set(mediciones.map((m) => m.persona))).filter(Boolean);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <h2 className="text-lg font-semibold text-gray-800">Mediciones</h2>
        </div>
        <BotonAnadir color="rose" onClick={() => setModalAbierto(true)} />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {mediciones.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center font-medium py-1">
            Apunta la tensión, el azúcar, la temperatura…
          </p>
          <p className="text-gray-400 text-sm text-center mt-1">
            De tu familiar, tuyas o de quien quieras. Así podrás enseñarle al médico cómo evolucionan.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {mediciones.slice(0, 4).map((m) => (
            <FilaMedicion key={m.id} medicion={m} />
          ))}
        </div>
      )}

      <ModalMedicion
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={agregar}
        sesion={sesion}
        personasPrevias={personasPrevias}
      />
    </section>
  );
}
