import type { SituacionFrecuente } from "@/types";

export const situaciones: SituacionFrecuente[] = [
  {
    id: "1",
    titulo: "Repite las mismas preguntas",
    quePasando: [
      "La memoria a corto plazo está afectada y no retiene la información nueva.",
      "No es intencional ni un intento de llamar la atención.",
    ],
    queEvitar: [
      "Decir frases como «ya te lo dije» o «me lo preguntas todo el rato».",
      "Mostrar impaciencia o suspirar visiblemente.",
      "Dar largas explicaciones que no podrá retener.",
    ],
    queHacer: [
      "Responder con calma cada vez, como si fuera la primera.",
      "Usar frases cortas y directas.",
      "Distraerle con una actividad si la pregunta genera ansiedad.",
    ],
    fraseRecomendada:
      "Hoy es martes. Estás en casa, todo está bien.",
  },
  {
    id: "2",
    titulo: "No quiere ducharse",
    quePasando: [
      "Puede sentir el baño como algo amenazante o frío.",
      "Puede haber perdido el sentido del tiempo y creer que ya se duchó.",
      "Puede sentir vergüenza o miedo a caerse.",
    ],
    queEvitar: [
      "Forzarle o dar un ultimátum.",
      "Discutir sobre si se ha duchado o no.",
      "Hacer que se sienta infantilizado.",
    ],
    queHacer: [
      "Elegir el momento del día en que está más tranquilo.",
      "Convertirlo en una rutina agradable: música suave, agua caliente lista.",
      "Ofrecer opciones pequeñas: ¿prefieres ducharte ahora o después de comer?",
    ],
    fraseRecomendada:
      "He preparado el baño a tu temperatura favorita, ¿te apetece?",
  },
  {
    id: "3",
    titulo: "Se enfada fácilmente",
    quePasando: [
      "La frustración de no recordar o no poder hacer cosas genera irritabilidad.",
      "Puede ser un efecto del deterioro cognitivo en el control emocional.",
      "A veces el entorno (ruido, cambios) es el desencadenante.",
    ],
    queEvitar: [
      "Responder con el mismo tono enfadado.",
      "Razonar o discutir en ese momento.",
      "Corregirle delante de otras personas.",
    ],
    queHacer: [
      "Mantener la calma y hablar en voz baja.",
      "Dar espacio sin abandonarle.",
      "Redirigir la atención hacia algo que le guste.",
    ],
    fraseRecomendada:
      "Veo que estás enfadado. Estoy aquí contigo, no hay prisa.",
  },
  {
    id: "4",
    titulo: "No quiere comer",
    quePasando: [
      "Puede haber perdido el apetito o el sentido del hambre.",
      "Los cambios de gusto son frecuentes en el deterioro cognitivo.",
      "Puede no reconocer la comida o sentir dificultad para manejar los cubiertos.",
    ],
    queEvitar: [
      "Obligarle a comer o presionarle.",
      "Dejarle solo durante la comida si hay dificultades.",
      "Presentar platos muy llenos que abrumen visualmente.",
    ],
    queHacer: [
      "Ofrecer porciones pequeñas y frecuentes.",
      "Elegir sus alimentos favoritos de toda la vida.",
      "Comer juntos para que sea un momento social.",
    ],
    fraseRecomendada:
      "He preparado lo que más te gusta. Solo un poquito, ¿te parece?",
  },
  {
    id: "5",
    titulo: "Quiere salir solo",
    quePasando: [
      "Puede querer mantener su autonomía y sentirse libre.",
      "Puede estar desorientado y querer volver a casa aunque ya esté en casa.",
      "Puede tener un recuerdo antiguo que le impulsa a salir (trabajar, buscar a alguien).",
    ],
    queEvitar: [
      "Prohibirle de forma brusca o cerrar la puerta con llave delante de él.",
      "Entrar en debate sobre si puede o no puede salir.",
    ],
    queHacer: [
      "Acompañarle a dar un paseo corto si es posible.",
      "Redirigir la situación: vamos juntos un momento.",
      "Tener una pulsera de identificación con nombre y teléfono.",
    ],
    fraseRecomendada:
      "¿Qué buena idea salir un rato! Te acompaño yo, ¿te parece bien?",
  },
  {
    id: "6",
    titulo: "Se desorienta",
    quePasando: [
      "La desorientación en tiempo y espacio es muy común en el deterioro cognitivo.",
      "Puede creer que está en otro lugar o en otra época de su vida.",
    ],
    queEvitar: [
      "Contradecirle o insistir en la realidad de forma brusca.",
      "Dejarle solo cuando está desorientado.",
    ],
    queHacer: [
      "Hablar con calma y sin prisas.",
      "Orientarle suavemente: fecha, lugar, nombres familiares.",
      "Usar objetos o fotos conocidas para anclarle al presente.",
    ],
    fraseRecomendada:
      "Estás en casa, estás seguro. Soy [tu nombre], estoy aquí contigo.",
  },
  {
    id: "7",
    titulo: "No quiere tomar la medicación",
    quePasando: [
      "Puede no recordar para qué sirve o no reconocer los medicamentos.",
      "Puede tener dificultad para tragar.",
      "Puede desconfiar de la persona que se los da.",
    ],
    queEvitar: [
      "Insistir de forma repetida y forzada.",
      "Esconder medicamentos en la comida sin explicar nada (puede generar desconfianza).",
    ],
    queHacer: [
      "Ofrecer los medicamentos con normalidad, como parte de la rutina.",
      "Consultar con el médico si se pueden triturar o cambiar de formato.",
      "Darlos junto a algo que le guste (un zumo, una fruta).",
    ],
    fraseRecomendada:
      "El médico dice que estas pastillas te van a ayudar a encontrarte mejor.",
  },
  {
    id: "8",
    titulo: "Está muy nervioso",
    quePasando: [
      "La ansiedad y la agitación son frecuentes, especialmente al atardecer.",
      "Puede responder a estímulos externos: ruido, televisión, cambios de rutina.",
    ],
    queEvitar: [
      "Intentar razonar o explicar en ese momento.",
      "Aumentar los estímulos del entorno.",
    ],
    queHacer: [
      "Bajar el volumen del entorno: televisión, luces, voces.",
      "Hablar en voz baja y con ritmo lento.",
      "Ofrecer contacto físico suave si lo acepta (mano, hombro).",
    ],
    fraseRecomendada:
      "Todo está bien. Estoy aquí. Vamos a respirar juntos.",
  },
  {
    id: "9",
    titulo: "No duerme bien",
    quePasando: [
      "El ritmo circadiano se altera con el deterioro cognitivo.",
      "Puede dormir demasiado durante el día y estar activo de noche.",
      "Puede tener miedo o desorientación nocturna.",
    ],
    queEvitar: [
      "Dejarle dormir largas siestas durante el día.",
      "Tener el dormitorio con mucha luz artificial por la noche.",
    ],
    queHacer: [
      "Establecer rutinas fijas de sueño.",
      "Reducir la actividad y la estimulación en las últimas horas del día.",
      "Dejar una luz tenue encendida por la noche si ayuda.",
    ],
    fraseRecomendada:
      "Es hora de descansar. Todo está tranquilo esta noche.",
  },
];
