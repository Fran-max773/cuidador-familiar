const MENSAJES = [
  "Lo que estás haciendo importa más de lo que imaginas.",
  "Cuidar con amor es un acto de valentía silenciosa.",
  "Hoy, date permiso para respirar. Te lo has ganado.",
  "No tienes que ser perfecto. Ser constante ya es mucho.",
  "Tu presencia es el mejor regalo que puedes darle.",
  "Los días difíciles también pasan. Mañana empieza de nuevo.",
  "Pedir ayuda no es rendirse, es ser inteligente.",
  "Recuerda: cuidarte a ti mismo también es cuidar a tu familiar.",
  "Hay días en que solo aguantar ya es un logro. Hoy cuenta.",
  "El amor que das cada día vuelve de formas que aún no ves.",
  "Ser cuidador te hace más fuerte de lo que crees.",
  "Un momento de paz hoy, aunque sea pequeño, es tuyo.",
  "Nadie te pide que lo hagas solo. Apóyate en quien puedes.",
  "Cada día que cuidas con cariño deja una huella que perdura.",
  "No te olvides de ti: tu bienestar también es parte del cuidado.",
  "Hoy puede que sea duro, pero estás más preparado de lo que piensas.",
  "La paciencia que tienes cada día es un superpoder.",
  "Hay millones de personas que entienden exactamente lo que sientes.",
  "Ser imperfecto y amar con todo el corazón es más que suficiente.",
  "Cuando sientas que no puedes más, recuerda por qué empezaste.",
  "Lo tuyo es una forma de amor que pocas personas son capaces de dar.",
  "Tu familiar tiene suerte de tenerte a su lado.",
  "Hoy, solo por hoy: uno a uno. Paso a paso.",
  "El agotamiento que sientes es la prueba de cuánto te importa.",
  "Descansar también es cuidar. No lo olvides.",
  "Gracias por lo que haces. Aunque a veces no lo diga nadie.",
  "En los momentos difíciles, tu calma es su ancla.",
  "Eres más de lo que te piden. Eres exactamente lo que necesitan.",
  "Cada pequeño gesto de hoy tiene más valor del que parece.",
  "Cuídate. Porque quien te cuida a ti, cuida también a tu familiar.",
];

function indiceDia(): number {
  const inicio = new Date("2024-01-01").getTime();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.floor((hoy.getTime() - inicio) / 86400000) % MENSAJES.length;
}

export function MensajeDiario() {
  const mensaje = MENSAJES[indiceDia()];
  return (
    <div className="bg-warm-50 border border-warm-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
      <span className="text-2xl flex-shrink-0 mt-0.5">🌿</span>
      <p className="text-gray-700 text-base leading-relaxed italic">{mensaje}</p>
    </div>
  );
}
