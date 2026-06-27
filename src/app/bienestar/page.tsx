"use client";
import { useBienestar } from "@/hooks/useBienestar";
import { CheckinDiario } from "@/components/bienestar/CheckinDiario";
import { GraficoSemanal } from "@/components/bienestar/GraficoSemanal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";

const MENSAJES: Record<string, { titulo: string; texto: string; color: string }> = {
  bajo: {
    titulo: "Estás llevando bien el día",
    texto: "Tu nivel de carga es bajo hoy. Eso es bueno. Sigue cuidándote a ti también.",
    color: "bg-sage-100 border-sage-200 text-sage-800",
  },
  moderado: {
    titulo: "Estás cargando bastante",
    texto: "Hoy parece que acumulas cierto cansancio. Intenta reservar aunque sea unos minutos para ti. Una pequeña pausa puede marcar la diferencia.",
    color: "bg-amber-50 border-amber-200 text-amber-800",
  },
  alto: {
    titulo: "Estás muy cargado/a hoy",
    texto: "El nivel de carga que sientes hoy es alto. Es normal que ocurra. Intenta pedir ayuda si puedes, y recuerda: para cuidar bien, necesitas estar bien tú primero.",
    color: "bg-red-50 border-red-200 text-red-800",
  },
};

export default function BienestarPage() {
  const { checkinHoy, guardarCheckin, ultimosSieteDias } = useBienestar();

  return (
    <div className="space-y-7">
      <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-rose-50 to-warm-50 border border-rose-100">
        <p className="text-rose-600 font-semibold mb-0.5">Mi bienestar</p>
        <p className="text-gray-600 text-base leading-relaxed">
          Tu bienestar importa. Cuidarte a ti es parte de cuidar a quien quieres.
        </p>
      </div>

      {checkinHoy ? (
        <div className="space-y-5">
          <Card className={`border ${MENSAJES[checkinHoy.nivel].color}`}>
            <div className="flex items-start gap-3">
              <Heart size={22} className="flex-shrink-0 mt-0.5" fill="currentColor" />
              <div>
                <p className="font-semibold text-lg mb-1">{MENSAJES[checkinHoy.nivel].titulo}</p>
                <p className="text-base leading-relaxed">{MENSAJES[checkinHoy.nivel].texto}</p>
              </div>
            </div>
          </Card>

          <Card>
            <GraficoSemanal datos={ultimosSieteDias} />
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Ya has registrado tu estado de hoy.</p>
            <Button
              variante="fantasma"
              tamaño="sm"
              onClick={() => {
                if (confirm("¿Quieres volver a registrar tu estado de hoy?")) {
                  window.location.reload();
                }
              }}
            >
              Volver a registrar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <CheckinDiario onGuardar={guardarCheckin} />

          {ultimosSieteDias.some((d) => d.puntuacion !== null) && (
            <Card>
              <GraficoSemanal datos={ultimosSieteDias} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
