// Interruptor de los grupos familiares. El proyecto de Supabase está pausado desde el 13-nov-2026
// (Fran usa ese hueco del plan gratuito para otra app). Mientras esté en false:
//  - la app funciona en modo local aunque el dispositivo tenga guardada una sesión de grupo
//    (la sesión NO se borra: al reactivar, ese dispositivo vuelve a su grupo tal cual);
//  - la pantalla Familia muestra el aviso y el formulario "Solicitar que se active".
// Para reactivar: reanudar el proyecto en supabase.com y poner esto en true.
export const GRUPOS_DISPONIBLES = false;

// Evento que lanzan los hooks cuando no pueden leer los datos del grupo (Supabase caído, sin red…)
export const EVENTO_FALLO_GRUPO = "cf-fallo-grupo";

export function avisarFalloGrupo(detalle: unknown) {
  console.error("No se han podido cargar los datos del grupo:", detalle);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_FALLO_GRUPO));
}
