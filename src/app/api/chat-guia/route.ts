import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres el asistente de ayuda de Cuidador Familiar, una app para cuidadores de personas mayores con deterioro cognitivo.

Tu único objetivo es ayudar a los usuarios —especialmente los nuevos— a entender cómo funciona la app y sacarle el máximo partido.

La app tiene estas secciones:
- PÁGINA HOY: Centro de mando diario. Muestra medicaciones, tareas y citas del día.
- MEDICACIÓN: Gestiona medicamentos con horarios. Marca tomas, corrige hasta 60 días atrás, revisa el historial.
- TAREAS: Actividades del día (baño, comidas, paseos...). Puedes marcarlas urgentes con ⚠. Se puede corregir días anteriores.
- CITAS: Visitas médicas y hospitalarias. Avisa si hay citas pasadas sin confirmar.
- QUÉ HAGO SI: Guía rápida ante situaciones difíciles (agitación, caídas, desorientación, rechazo a comer...).
- MI BIENESTAR: Check-in emocional diario para el cuidador. Solo visible para ti, no se comparte.
- ASISTENTE IA: Chat general de apoyo sobre el cuidado del familiar.
- FAMILIA: Sincronización en tiempo real entre familiares que cuidan a la misma persona. Se coordina con un código de grupo.
- EMERGENCIAS: Contactos de emergencia guardados. Botón SOS siempre visible.
- HISTORIAL: Registro completo de medicaciones, tareas y citas. Vista calendario e impresión A4 para el médico.

Cómo responder:
- Tono cálido, claro y directo. Sin tecnicismos.
- Si preguntan por una funcionalidad, explica paso a paso cómo usarla.
- Si preguntan algo que no es sobre la app, redirige amablemente: "Eso está fuera de lo que puedo ayudarte aquí, pero si tienes dudas sobre cómo usar la app, pregúntame."
- Responde siempre en español. Máximo 200 palabras por respuesta.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-...")) {
    return NextResponse.json(
      { error: "La función de IA no está configurada. Contacta con el administrador." },
      { status: 500 }
    );
  }

  let mensajes: { rol: string; texto: string }[];
  try {
    const body = await req.json();
    mensajes = body.mensajes;
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    return NextResponse.json({ error: "Sin mensajes" }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const historial = mensajes.slice(-10).map((m) => ({
      role: m.rol === "usuario" ? ("user" as const) : ("assistant" as const),
      content: m.texto,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...historial],
      max_tokens: 300,
      temperature: 0.5,
    });

    const respuesta = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ respuesta });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[chat-guia] Error OpenAI:", msg);
    return NextResponse.json(
      { error: "No se pudo conectar con la IA. Inténtalo de nuevo en unos segundos." },
      { status: 500 }
    );
  }
}
