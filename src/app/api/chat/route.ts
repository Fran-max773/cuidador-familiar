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
      { error: "Falta configurar OPENAI_API_KEY en .env.local" },
      { status: 500 }
    );
  }

  const { mensajes } = await req.json();
  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    return NextResponse.json({ error: "Sin mensajes" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  // Enviamos los últimos 10 mensajes para mantener contexto sin exceder tokens
  const historial = mensajes.slice(-10).map(
    (m: { rol: string; texto: string }) => ({
      role: m.rol === "usuario" ? ("user" as const) : ("assistant" as const),
      content: m.texto,
    })
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...historial],
    max_tokens: 280,
    temperature: 0.6,
  });

  const respuesta = completion.choices[0]?.message?.content ?? "";
  return NextResponse.json({ respuesta });
}
