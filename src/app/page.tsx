"use client";
import Link from "next/link";
import { FileText, Heart } from "lucide-react";
import { MedicacionSection } from "@/components/hoy/MedicacionSection";
import { TareasSection } from "@/components/hoy/TareasSection";
import { CitasSection } from "@/components/hoy/CitasSection";

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
      {/* Hero — full-bleed compensando el padding del layout */}
      <div className="-mx-4 -mt-6 px-6 pt-10 pb-14 mb-8 bg-gradient-to-br from-sage-700 via-sage-600 to-sage-400 text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-white/20 rounded-2xl flex items-center justify-center">
          <Heart size={30} fill="white" className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Cuidador Familiar
        </h1>
        <p className="text-sage-100 text-base leading-relaxed max-w-[260px] mx-auto">
          Cuida a quien quieres sin olvidarte de cuidarte a ti también.
        </p>
        <div className="mt-5 inline-block bg-white/20 rounded-full px-4 py-1.5">
          <p className="text-white/90 text-sm font-medium capitalize">{fechaTexto}</p>
        </div>
      </div>

      <div className="space-y-6">
        <MedicacionSection />
        <TareasSection />
        <CitasSection />

        <Link
          href="/historial"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-sky-200 text-sky-600 hover:bg-sky-50 active:bg-sky-100 transition-colors font-medium text-sm"
        >
          <FileText size={18} />
          Ver historial e imprimir registros
        </Link>
      </div>
    </div>
  );
}
