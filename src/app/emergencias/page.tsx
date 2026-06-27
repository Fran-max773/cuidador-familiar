"use client";
import { useEffect, useState } from "react";
import { PhoneCall, Phone } from "lucide-react";
import type { PerfilFamiliar, ContactoEmergencia } from "@/types";

export default function EmergenciasPage() {
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cf_perfil");
    if (saved) {
      try {
        const perfil: PerfilFamiliar = JSON.parse(saved);
        let lista = perfil.contactosEmergencia ?? [];
        // Migrar teléfono legacy
        if (!lista.length && perfil.telefonoEmergencia) {
          lista = [{ id: "legacy", nombre: "Emergencia", telefono: perfil.telefonoEmergencia }];
        }
        setContactos(lista);
      } catch { /* ignorar */ }
    }
  }, []);

  return (
    <div className="space-y-6 pb-6">

      {/* Contactos personales */}
      {contactos.length > 0 ? (
        <div className="space-y-3">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Contactos de confianza</p>
          {contactos.map((c) => (
            <a
              key={c.id}
              href={`tel:${c.telefono}`}
              className="flex items-center gap-4 bg-white border border-beige-200 rounded-2xl px-5 py-4 shadow-sm hover:bg-sage-50 active:bg-sage-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Phone size={22} className="text-sage-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-lg truncate">{c.nombre || "Sin nombre"}</p>
                <p className="text-gray-500 text-base">{c.telefono}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0">
                <PhoneCall size={18} className="text-white" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-beige-200 rounded-2xl px-5 py-5 text-center space-y-1">
          <p className="text-gray-500 text-base">No hay contactos guardados todavía.</p>
          <a href="/perfil" className="text-sm text-sage-600 underline">
            Añádelos en Perfil
          </a>
        </div>
      )}

      {/* Separador */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-beige-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">Emergencias generales</span>
        <div className="flex-1 h-px bg-beige-200" />
      </div>

      {/* 112 siempre visible */}
      <a
        href="tel:112"
        className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-5 shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Phone size={26} className="text-red-500" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-xl">112</p>
          <p className="text-gray-500 text-sm">Emergencias generales</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <PhoneCall size={24} className="text-white" />
        </div>
      </a>

      <a
        href="tel:061"
        className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Phone size={20} className="text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-lg">061</p>
          <p className="text-gray-500 text-sm">Urgencias médicas</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
          <PhoneCall size={18} className="text-white" />
        </div>
      </a>

    </div>
  );
}
