"use client";
import { useState, useEffect } from "react";
import { User, Save, Phone, Stethoscope, Pill, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PerfilFamiliar, ContactoEmergencia } from "@/types";

const PERFIL_VACIO: PerfilFamiliar = {
  nombre: "",
  edad: "",
  diagnostico: "",
  medicacion: "",
  medico: "",
  telefonoEmergencia: "",
  alergias: "",
  contactosEmergencia: [],
};

// ── Fuera del componente para que React no lo destruya en cada render ──────────
function Campo({
  label,
  field,
  placeholder,
  multiline = false,
  perfil,
  setPerfil,
}: {
  label: string;
  field: Exclude<keyof PerfilFamiliar, "contactosEmergencia">;
  placeholder?: string;
  multiline?: boolean;
  perfil: PerfilFamiliar;
  setPerfil: React.Dispatch<React.SetStateAction<PerfilFamiliar>>;
}) {
  const cls = "w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-sage-300 text-gray-800";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={perfil[field]}
          onChange={(e) => setPerfil((p) => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={perfil[field]}
          onChange={(e) => setPerfil((p) => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilFamiliar>(PERFIL_VACIO);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cf_perfil");
    if (saved) {
      try {
        const parsed: PerfilFamiliar = JSON.parse(saved);
        if (parsed.telefonoEmergencia && !parsed.contactosEmergencia?.length) {
          parsed.contactosEmergencia = [{
            id: crypto.randomUUID(),
            nombre: "Emergencia",
            telefono: parsed.telefonoEmergencia,
          }];
        }
        setPerfil({ ...PERFIL_VACIO, ...parsed });
      } catch { /* ignorar */ }
    }
  }, []);

  const handleGuardar = () => {
    localStorage.setItem("cf_perfil", JSON.stringify(perfil));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const campoProps = { perfil, setPerfil };

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-base">
        Información de tu familiar. Se guarda solo en este dispositivo.
      </p>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-sage-500" />
          <h2 className="font-semibold text-gray-800 text-lg">Datos personales</h2>
        </div>
        <div className="space-y-4">
          <Campo {...campoProps} label="Nombre" field="nombre" placeholder="Nombre completo" />
          <Campo {...campoProps} label="Edad" field="edad" placeholder="Ej: 78 años" />
          <Campo {...campoProps} label="Diagnóstico" field="diagnostico" placeholder="Ej: Deterioro cognitivo leve" multiline />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Pill size={18} className="text-sage-500" />
          <h2 className="font-semibold text-gray-800 text-lg">Medicación habitual</h2>
        </div>
        <Campo
          {...campoProps}
          label="Medicamentos"
          field="medicacion"
          placeholder="Ej: Donepezilo 5 mg (noche), Ácido fólico (mañana)…"
          multiline
        />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope size={18} className="text-sage-500" />
          <h2 className="font-semibold text-gray-800 text-lg">Médico de referencia</h2>
        </div>
        <Campo {...campoProps} label="Nombre del médico" field="medico" placeholder="Ej: Dr. Martínez (neurología)" />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="font-semibold text-gray-800 text-lg">Alergias</h2>
        </div>
        <Campo {...campoProps} label="Alergias conocidas" field="alergias" placeholder="Ej: Penicilina, ibuprofeno…" multiline />
      </Card>

      <Card className="border-red-100 bg-red-50">
        <div className="flex items-center gap-2 mb-4">
          <Phone size={18} className="text-red-500" />
          <h2 className="font-semibold text-gray-800 text-lg">Teléfonos para emergencias</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Añade personas de confianza: familiares, vecinos, amigos… Aparecerán en la pestaña SOS.
        </p>

        <div className="space-y-3">
          {(perfil.contactosEmergencia ?? []).map((contacto, i) => (
            <div key={contacto.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={contacto.nombre}
                  onChange={(e) => {
                    const lista = [...(perfil.contactosEmergencia ?? [])];
                    lista[i] = { ...lista[i], nombre: e.target.value };
                    setPerfil((p) => ({ ...p, contactosEmergencia: lista }));
                  }}
                  placeholder="Ej: Hijo Juan"
                  className="px-3 py-2.5 rounded-xl border border-red-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                />
                <input
                  type="tel"
                  value={contacto.telefono}
                  onChange={(e) => {
                    const lista = [...(perfil.contactosEmergencia ?? [])];
                    lista[i] = { ...lista[i], telefono: e.target.value };
                    setPerfil((p) => ({ ...p, contactosEmergencia: lista }));
                  }}
                  placeholder="Ej: 612 345 678"
                  className="px-3 py-2.5 rounded-xl border border-red-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                />
              </div>
              <button
                onClick={() => {
                  const lista = (perfil.contactosEmergencia ?? []).filter((_, j) => j !== i);
                  setPerfil((p) => ({ ...p, contactosEmergencia: lista }));
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-300 hover:text-red-500 transition-colors"
                aria-label="Eliminar contacto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const nuevo: ContactoEmergencia = { id: crypto.randomUUID(), nombre: "", telefono: "" };
            setPerfil((p) => ({ ...p, contactosEmergencia: [...(p.contactosEmergencia ?? []), nuevo] }));
          }}
          className="mt-3 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <Plus size={16} /> Añadir contacto
        </button>
      </Card>

      <Button tamaño="lg" className="w-full" onClick={handleGuardar}>
        <Save size={18} />
        {guardado ? "¡Guardado!" : "Guardar perfil"}
      </Button>
    </div>
  );
}
