"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pill, CheckSquare, Calendar,
  Lightbulb, Heart, MessageSquare, Users, User, Phone,
  History, BookOpen, MessageCircle, Home,
} from "lucide-react";
import { ChatInterface } from "@/components/asistente/ChatInterface";
import type { PerfilFamiliar } from "@/types";

const secciones = [
  {
    emoji: "🏠",
    bg: "bg-sage-100",
    href: "/",
    LinkIcono: Home,
    linkTexto: "Ve a la página de Hoy",
    titulo: "La página de Hoy",
    descripcion:
      "Tu punto de partida cada mañana. Medicamentos, tareas y citas del día en un solo vistazo.",
    tips: [
      "Ábrela cada día para ver qué hay pendiente",
      "Las secciones están ordenadas por prioridad: medicación, tareas y citas",
      "Toca 'Ver historial' al pie de cada sección para revisar días pasados",
    ],
  },
  {
    emoji: "💊",
    bg: "bg-sky-100",
    href: "/#medicacion",
    LinkIcono: Pill,
    linkTexto: "Ve a Medicación",
    titulo: "Medicación",
    descripcion:
      "Gestiona todos los medicamentos con sus horarios. Toca el círculo para marcar cada toma como administrada.",
    tips: [
      "¿Olvidaste marcar una toma? Usa 'Corrección de tomas' (hasta 60 días atrás)",
      "Puedes añadir varios horarios al mismo medicamento",
      "El historial muestra un calendario visual del cumplimiento",
    ],
  },
  {
    emoji: "✅",
    bg: "bg-sage-100",
    href: "/#tareas",
    LinkIcono: CheckSquare,
    linkTexto: "Ve a Tareas",
    titulo: "Tareas",
    descripcion:
      "Organiza el día a día: baño, comidas, paseos, ejercicios… Marca cada una cuando la completes.",
    tips: [
      "Toca ⚠ para marcar una tarea como urgente",
      "Puedes corregir tareas no marcadas de días anteriores",
      "En grupos familiares, las tareas pueden asignarse a personas concretas",
      "Verás quién pidió cada tarea y quién la completó; archívala cuando ya la hayas visto",
    ],
  },
  {
    emoji: "📅",
    bg: "bg-amber-100",
    href: "/#citas",
    LinkIcono: Calendar,
    linkTexto: "Ve a Citas",
    titulo: "Citas",
    descripcion:
      "Anota visitas médicas, análisis y hospitalizaciones. La app te avisa si hay citas pasadas sin confirmar.",
    tips: [
      "Toca el check-circle para marcar una cita como realizada",
      "Añade lugar y notas a cada cita para llevar la información a la consulta",
      "El historial permite imprimirlo en A4 para el médico",
    ],
  },
  {
    emoji: "💡",
    bg: "bg-yellow-100",
    href: "/que-hago-si",
    LinkIcono: Lightbulb,
    linkTexto: "Ve a Qué hago si…",
    titulo: "Qué hago si…",
    descripcion:
      "Guía rápida para situaciones difíciles: agitación, desorientación, caídas, rechazo a comer…",
    tips: [
      "Cada situación explica qué puede estar pasando, qué evitar y qué hacer",
      "Al final hay un cuadro para describir una situación no listada",
      "Accede desde la pestaña 'Qué hago' de la barra inferior",
    ],
  },
  {
    emoji: "❤️",
    bg: "bg-rose-100",
    href: "/bienestar",
    LinkIcono: Heart,
    linkTexto: "Ve a Mi bienestar",
    titulo: "Mi bienestar",
    descripcion:
      "Cuidarte a ti también es parte del cuidado. Haz un check-in rápido cada día para registrar cómo te encuentras.",
    tips: [
      "Solo te lleva 30 segundos completarlo",
      "El gráfico semanal te ayuda a detectar señales de agotamiento",
      "Tus datos de bienestar son privados y no se comparten con el grupo",
    ],
  },
  {
    emoji: "🤖",
    bg: "bg-violet-100",
    href: "/asistente",
    LinkIcono: MessageSquare,
    linkTexto: "Ve al Asistente IA",
    titulo: "Asistente IA",
    descripcion:
      "Un asistente de inteligencia artificial disponible siempre para preguntarle lo que necesites sobre el cuidado.",
    tips: [
      "Puedes pedirle frases concretas para hablar con tu familiar",
      "Te orienta en situaciones difíciles, pero no sustituye al médico",
      "El historial del chat no se guarda entre sesiones",
    ],
  },
  {
    emoji: "👨‍👩‍👧",
    bg: "bg-sky-100",
    href: "/grupo",
    LinkIcono: Users,
    linkTexto: "Ve a Familia",
    titulo: "Familia",
    descripcion:
      "Comparte el cuidado con otros familiares. Todos ven en tiempo real las mismas medicaciones, tareas y citas.",
    tips: [
      "Crea un grupo y comparte el código con tus familiares",
      "Los cambios de un miembro se reflejan al instante en todos los móviles",
      "Las tareas pueden asignarse a personas específicas del grupo",
      "Si te asignan una tarea, verás un aviso y un punto en la pestaña 'Hoy'",
    ],
  },
  {
    emoji: "📞",
    bg: "bg-red-100",
    href: "/emergencias",
    LinkIcono: Phone,
    linkTexto: "Ve a Emergencias",
    titulo: "Emergencias",
    descripcion:
      "Guarda los contactos clave y accede a ellos en segundos. El botón SOS rojo siempre está visible.",
    tips: [
      "Añade el teléfono del médico, especialistas y familiares de confianza",
      "El botón SOS rojo aparece en todas las pantallas de la app",
      "En una emergencia real, llama siempre al 112",
    ],
  },
  {
    emoji: "👤",
    bg: "bg-violet-100",
    href: "/perfil",
    LinkIcono: User,
    linkTexto: "Ve a Perfil",
    titulo: "Perfil",
    descripcion:
      "Guarda los datos de tu familiar: nombre, edad, diagnóstico y notas importantes. La app los usa para personalizar la experiencia.",
    tips: [
      "Añade el nombre para que la app te llame por él en los mensajes",
      "Anota el diagnóstico y las observaciones del médico para tenerlas siempre a mano",
      "Los datos del perfil son privados y solo se guardan en tu dispositivo",
    ],
  },
  {
    emoji: "📋",
    bg: "bg-gray-100",
    href: "/historial",
    LinkIcono: History,
    linkTexto: "Ve al Historial",
    titulo: "Historial",
    descripcion:
      "Revisa el registro completo de medicaciones, tareas y citas con vista lista o calendario.",
    tips: [
      "Filtra por medicación, tareas o citas usando las pestañas",
      "Ajusta el rango de fechas con el selector",
      "Usa el botón de impresión para generar un PDF para el médico",
    ],
  },
];

export default function GuiaPage() {
  const [nombreFamiliar, setNombreFamiliar] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cf_perfil");
      if (raw) {
        const perfil: PerfilFamiliar = JSON.parse(raw);
        if (perfil.nombre) setNombreFamiliar(perfil.nombre);
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-5 pb-10">
      {/* Header personalizado */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-500 rounded-3xl p-6 text-white">
        <BookOpen size={30} className="mb-3 opacity-90" />
        <h2 className="text-2xl font-bold mb-2 leading-tight">
          {nombreFamiliar
            ? `Cuidando a ${nombreFamiliar}`
            : "Bienvenido a Cuidador Familiar"}
        </h2>
        <p className="text-sky-100 text-base leading-relaxed">
          {nombreFamiliar
            ? `Esta app está diseñada para ayudarte a organizar el cuidado de ${nombreFamiliar} sin olvidarte de nada, y coordinarte con el resto de la familia.`
            : "Esta app está diseñada para ayudarte a organizar el cuidado de tu familiar sin olvidarte de nada, y coordinarte con el resto de la familia."}
        </p>
      </div>

      {/* Secciones */}
      <div className="space-y-3">
        {secciones.map(({ emoji, bg, href, LinkIcono, linkTexto, titulo, descripcion, tips }) => (
          <div key={titulo} className="bg-white rounded-3xl border border-beige-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl ${bg}`}>
                {emoji}
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">{titulo}</h3>
            </div>
            <p className="text-gray-600 text-base leading-relaxed">{descripcion}</p>
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-gray-500">
                  <span className="mt-0.5 text-sage-400 font-bold flex-shrink-0">·</span>
                  {tip}
                </li>
              ))}
            </ul>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-base font-medium text-sage-600 hover:text-sage-700 transition-colors pt-1"
            >
              <LinkIcono size={15} />
              {linkTexto}
            </Link>
          </div>
        ))}
      </div>

      {/* Chat IA especializado */}
      <div className="bg-white rounded-3xl border border-beige-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sage-500 to-sage-400 px-5 py-4 flex items-center gap-3">
          <MessageCircle size={22} className="text-white" />
          <div>
            <p className="font-semibold text-white text-sm">¿Tienes alguna duda?</p>
            <p className="text-sage-100 text-xs">Pregúntale a la IA sobre cómo usar la app</p>
          </div>
        </div>
        <div className="p-4 h-80 flex flex-col">
          <ChatInterface
            endpoint="/api/chat-guia"
            mensajeInicial="Hola, soy tu asistente de ayuda. Pregúntame lo que necesites sobre cómo usar Cuidador Familiar: cómo añadir una medicación, cómo funciona la corrección de tomas, cómo crear un grupo familiar… Estoy aquí para ayudarte."
          />
        </div>
      </div>
    </div>
  );
}
