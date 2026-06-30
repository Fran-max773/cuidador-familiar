import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres un asistente de apoyo para cuidadores familiares de personas mayores con deterioro cognitivo leve o principios de Alzheimer.

Tu objetivo es acompañar al cuidador en el día a día: escucharle, orientarle y darle herramientas prácticas para las situaciones que se encuentra.

Cómo responder:
- Usa un tono cálido, cercano y tranquilizador. El cuidador puede estar agotado o angustiado.
- Da consejos concretos y fáciles de aplicar, sin tecnicismos médicos.
- Si el cuidador describe una situación difícil con su familiar, explica brevemente qué puede estar pasando y qué puede hacer.
- Si el cuidador habla de su propio agotamiento, valida sus sentimientos y ofrece apoyo.
- Puedes sugerir frases concretas que el cuidador puede decirle a su familiar.
- Si la situación requiere atención médica urgente, indícalo claramente.
- Responde siempre en español. Máximo 180 palabras por respuesta. Sin listas largas ni asteriscos, usa párrafos cortos y naturales.`;

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
      max_tokens: 280,
      temperature: 0.6,
    });

    const respuesta = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ respuesta });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[chat] Error OpenAI:", msg);
    return NextResponse.json(
      { error: "No se pudo conectar con la IA. Inténtalo de nuevo en unos segundos." },
      { status: 500 }
    );
  }
}
