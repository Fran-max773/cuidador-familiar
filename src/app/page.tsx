"use client";
import Link from "next/link";
import { FileText } from "lucide-react";
import { MedicacionSection } from "@/components/hoy/MedicacionSection";
import { TareasSection } from "@/components/hoy/TareasSection";
import { CitasSection } from "@/components/hoy/CitasSection";
import { MedicionesSection } from "@/components/hoy/MedicionesSection";
import { TarjetaGuia } from "@/components/hoy/TarjetaGuia";
import { AvisoGrupo } from "@/components/layout/AvisoGrupo";

function LinkHistorial({ href, texto, claseColor }: { href: string; texto: string; claseColor: string }) {
  return (
    <Link
      href={href}
      className={`mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed text-sm font-medium hover:bg-white/60 active:scale-95 transition-all ${claseColor}`}
    >
      <FileText size={15} />
      {texto}
    </Link>
  );
}

function useFechaHoy() {
  const diasSemana = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const ahora = new Date();
  return `${diasSemana[ahora.getDay()]}, ${ahora.getDate()} de ${meses[ahora.getMonth()]}`;
}

export default function HoyPage() {
  const fechaTexto = useFechaHoy();

  return (
    <div>
      {/* Banda compacta: continúa el degradado de la cabecera. 100vw real con el truco CSS para salir del contenedor.
          (La foto public/hero-cuidado.jpg ya no se usa aquí; se conserva por si se quiere recuperar.) */}
      <div
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
        className="-mt-6 mb-5 bg-gradient-to-r from-warm-600 to-warm-300 rounded-b-3xl"
      >
        <div className="max-w-2xl mx-auto px-4 pt-1 pb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
            Cuidador Familiar
          </h1>
          <p className="text-white/90 text-sm font-medium mt-0.5 drop-shadow-sm first-letter:uppercase">
            {fechaTexto}
          </p>
        </div>
      </div>

      <AvisoGrupo enHoy />
      <TarjetaGuia />

      <div className="space-y-4">
        <div id="medicacion" className="bg-sky-50 rounded-3xl p-4 border border-sky-100">
          <MedicacionSection />
          <LinkHistorial
            href="/historial?tab=medicacion"
            texto="Ver historial de medicación"
            claseColor="border-sky-300 text-sky-600"
          />
        </div>

        <div id="tareas" className="bg-sage-50 rounded-3xl p-4 border border-sage-100">
          <TareasSection />
          <LinkHistorial
            href="/historial?tab=tareas"
            texto="Ver historial de tareas"
            claseColor="border-sage-300 text-sage-600"
          />
        </div>

        <div id="citas" className="bg-amber-50 rounded-3xl p-4 border border-amber-100">
          <CitasSection />
          <LinkHistorial
            href="/historial?tab=citas"
            texto="Ver historial de citas"
            claseColor="border-amber-300 text-amber-700"
          />
        </div>

        <div id="mediciones" className="bg-rose-50 rounded-3xl p-4 border border-rose-100">
          <MedicionesSection />
          <LinkHistorial
            href="/mediciones"
            texto="Ver todas las mediciones y su evolución"
            claseColor="border-rose-200 text-rose-600"
          />
        </div>
      </div>
    </div>
  );
}
