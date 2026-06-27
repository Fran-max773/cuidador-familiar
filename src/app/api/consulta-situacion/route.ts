import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres un asistente especializado en apoyo a cuidadores familiares de personas mayores con deterioro cognitivo leve o principios de Alzheimer.

Tu misión es ofrecer orientación práctica, empática y comprensible para personas de 45 a 70 años sin formación sanitaria.

Cuando el cuidador describa una situación:
1. Explica brevemente qué puede estar ocurriendo (en 1-2 frases).
2. Da 2-3 consejos concretos y fáciles de aplicar, escritos como párrafos cortos, no como lista larga.
3. Si corresponde, sugiere una frase corta que puedan decirle al familiar.

Usa siempre un tono cálido, tranquilizador y sin tecnicismos médicos.
Responde en español. Máximo 220 palabras. No uses cabeceras ni asteriscos, solo texto natural.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-...")) {
    return NextResponse.json(
      { error: "Falta configurar la clave OPENAI_API_KEY en .env.local" },
      { status: 500 }
    );
  }

  const { situacion } = await req.json();
  if (!situacion?.trim()) {
    return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: situacion.trim() },
    ],
    max_tokens: 350,
    temperature: 0.5,
  });

  const respuesta = completion.choices[0]?.message?.content ?? "";
  return NextResponse.json({ respuesta });
}
