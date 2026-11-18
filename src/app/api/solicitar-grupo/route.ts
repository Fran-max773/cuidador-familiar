import { NextRequest, NextResponse } from "next/server";

// Solicitud de un usuario para que se activen los grupos familiares.
// Envía un correo a Fran (AVISOS_EMAIL) vía Resend, desde el dominio verificado mail.mygardenlive.com.
// Sirve para medir la demanda antes de decidir si se reactiva el proyecto de Supabase.

const REMITENTE = "Cuidador Familiar <avisos@mail.mygardenlive.com>";
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpiar(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.AVISOS_EMAIL;
  if (!apiKey || !destino) {
    console.error("[solicitar-grupo] Falta RESEND_API_KEY o AVISOS_EMAIL");
    return NextResponse.json({ error: "No se ha podido enviar la solicitud. Inténtalo más tarde." }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  // Campo trampa para bots: un humano nunca lo ve ni lo rellena
  if (limpiar(body?.web, 200)) return NextResponse.json({ ok: true });

  const nombre = limpiar(body?.nombre, 80);
  const email = limpiar(body?.email, 120);
  const mensaje = limpiar(body?.mensaje, 1000);
  if (email && !EMAIL_VALIDO.test(email)) {
    return NextResponse.json({ error: "El correo no parece válido. Revísalo o déjalo en blanco." }, { status: 400 });
  }

  const fecha = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const texto = [
    "Alguien ha pedido que se activen los grupos familiares en Cuidador Familiar.",
    "",
    `Fecha: ${fecha}`,
    `Nombre: ${nombre || "(no lo ha indicado)"}`,
    `Correo: ${email || "(no lo ha indicado)"}`,
    `Mensaje: ${mensaje || "(sin mensaje)"}`,
    "",
    email ? "Puedes responder a este correo para escribirle directamente." : "No ha dejado correo, así que no se le puede avisar.",
  ].join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: REMITENTE,
        to: [destino],
        subject: `Solicitud de grupo familiar${nombre ? ` — ${nombre}` : ""}`,
        text: texto,
        ...(email ? { reply_to: email } : {}),
      }),
    });
    if (!r.ok) {
      console.error("[solicitar-grupo] Resend respondió", r.status, await r.text());
      return NextResponse.json({ error: "No se ha podido enviar la solicitud. Inténtalo más tarde." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[solicitar-grupo] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "No se ha podido enviar la solicitud. Inténtalo más tarde." }, { status: 500 });
  }
}
