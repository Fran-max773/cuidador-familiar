export interface Medicacion {
  id: string;
  nombre: string;
  horas: string[];          // una o varias horas del día
  dosis: string;
  fechaInicio: string;
  fechaFin: string;
  completadasEn: string[];  // claves "YYYY-MM-DD_HH:MM" por toma
}

export interface Tarea {
  id: string;
  texto: string;
  completada: boolean;
  fecha: string;
  prioridad: "alta" | "normal" | "baja";
  completadaPor?: string;
  asignadaA?: string;
}

export interface Cita {
  id: string;
  tipo: "medico" | "hospital" | "analisis" | "otro";
  titulo: string;
  fecha: string;
  hora: string;
  lugar?: string;
  notas?: string;
}

export interface ContactoEmergencia {
  id: string;
  nombre: string;
  telefono: string;
}

export interface PerfilFamiliar {
  nombre: string;
  edad: string;
  diagnostico: string;
  medicacion: string;
  medico: string;
  telefonoEmergencia: string; // legacy — se migra a contactosEmergencia
  alergias: string;
  contactosEmergencia: ContactoEmergencia[];
}

export interface CheckinBienestar {
  id: string;
  fecha: string;
  comoTeEncuentras: number;
  hasDormidoBien: number;
  tesSientesAgotado: number;
  hasTenidoTiempoParaTi: number;
  puntuacionTotal: number;
  nivel: "bajo" | "moderado" | "alto";
}

export interface MensajeChat {
  id: string;
  rol: "usuario" | "asistente";
  texto: string;
  timestamp: string;
}

export interface SituacionFrecuente {
  id: string;
  titulo: string;
  quePasando: string[];
  queEvitar: string[];
  queHacer: string[];
  fraseRecomendada: string;
}

export interface ConocimientoBase {
  palabrasClave: string[];
  respuesta: string;
}
