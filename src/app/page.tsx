"use client";
import Link from "next/link";
import { FileText, Heart } from "lucide-react";
import { MedicacionSection } from "@/components/hoy/MedicacionSection";
import { TareasSection } from "@/components/hoy/TareasSection";
import { CitasSection } from "@/components/hoy/CitasSection";
import { TarjetaGuia } from "@/components/hoy/TarjetaGuia";

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
      {/* Hero — 100vw real con el truco CSS para salir del contenedor */}
      <div
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
        className="-mt-6 px-8 pt-12 pb-16 mb-8 bg-gradient-to-b from-sage-700 to-sage-500 text-center relative overflow-hidden rounded-b-[2.5rem]"
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-16 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-8 right-8 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="w-18 h-18 mx-auto mb-5 bg-white/20 rounded-2xl flex items-center justify-center"
               style={{ width: "4.5rem", height: "4.5rem" }}>
            <Heart size={32} fill="white" className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Cuidador Familiar
          </h1>
          <p className="text-sage-100 text-base leading-relaxed max-w-[280px] mx-auto">
            Cuida a quien quieres sin olvidarte de cuidarte a ti también.
          </p>
          <div className="mt-5 inline-block bg-white/20 rounded-full px-5 py-2">
            <p className="text-white/90 text-sm font-medium capitalize">{fechaTexto}</p>
          </div>
        </div>
      </div>

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
      </div>
    </div>
  );
}
