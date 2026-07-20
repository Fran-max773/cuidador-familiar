"use client";
import Link from "next/link";
import Image from "next/image";
import { FileText, HeartHandshake } from "lucide-react";
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
        className="-mt-6 mb-8 relative overflow-hidden rounded-b-[2.5rem]"
      >
        <Image
          src="/hero-cuidado.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Velo cálido/oscuro para que el texto sea legible sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/55" />
        <div className="absolute inset-0 bg-warm-600/25" />

        <div className="relative z-10 px-8 pt-12 pb-16 text-center">
          <div className="w-18 h-18 mx-auto mb-5 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
               style={{ width: "4.5rem", height: "4.5rem" }}>
            <HeartHandshake size={32} strokeWidth={2.25} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">
            Cuidador Familiar
          </h1>
          <p className="text-white/90 text-base leading-relaxed max-w-[280px] mx-auto drop-shadow-sm">
            Cuida a quien quieres sin olvidarte de cuidarte a ti también.
          </p>
          <div className="mt-5 inline-block bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
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
