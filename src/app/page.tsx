"use client";
import Link from "next/link";
import { FileText } from "lucide-react";
import { MedicacionSection } from "@/components/hoy/MedicacionSection";
import { TareasSection } from "@/components/hoy/TareasSection";
import { CitasSection } from "@/components/hoy/CitasSection";

function useFechaHoy() {
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const ahora = new Date();
  return `${diasSemana[ahora.getDay()]}, ${ahora.getDate()} de ${meses[ahora.getMonth()]}`;
}

export default function HoyPage() {
  const fechaTexto = useFechaHoy();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 bg-gradient-to-br from-sage-100 via-sage-50 to-warm-50 border border-sage-200">
        <p className="text-sage-600 text-sm font-semibold capitalize mb-1">{fechaTexto}</p>
        <p className="text-gray-700 text-lg leading-snug">
          Hoy no tienes que recordarlo todo tú.{" "}
          <span className="font-semibold text-sage-700">Vamos paso a paso.</span>
        </p>
      </div>

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
  );
}
