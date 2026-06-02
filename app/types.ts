import { LucideIcon } from "lucide-react";

export type HealthResponse = {
  ok: boolean;
  baseDatos: {
    configurada: boolean;
    conectada: boolean;
    error: string | null;
  };
  integraciones: Record<string, boolean>;
};

export type DecisionResponse = {
  ok: boolean;
  decision?: {
    agente: string;
    intencion: string;
    requiereHumano: boolean;
    respuesta: string;
    decisionSeguridad: string;
    catalogoVisual?: {
      nombre: string;
      url: string;
      tipo: string;
      prioridadEnvio: boolean;
    } | null;
  };
  error?: string;
};

export type MensajeLaboratorio = {
  id: string;
  rol: "cliente" | "agente";
  texto: string;
  canal: Canal;
  cliente: string;
  creadoEn: string;
  decision?: DecisionResponse["decision"];
};

export type IntegracionEstado = {
  nombre: string;
  activo: boolean;
  detalle: string;
  icono: LucideIcon;
};

export type Canal = "whatsapp" | "instagram" | "facebook";

export type MetricasResponse = {
  ok: boolean;
  metricas?: {
    totalHoy: number;
    ventasHoy: number;
    casosHumano: number;
    contenidoPendiente: number;
    porCanal: { whatsapp: number; instagram: number; facebook: number };
  };
};

export type ConversacionDB = {
  id: string;
  canal: Canal;
  estado: string;
  ultimaIntencion: string | null;
  requiereHumano: boolean;
  actualizadoEn: string;
  cliente: {
    id: string;
    nombre: string | null;
    whatsappId: string | null;
    instagramId: string | null;
    facebookId: string | null;
  };
  mensajes: Array<{ texto: string; direccion: string; creadoEn: string }>;
  decisiones: Array<{ intencion: string; salida: string }>;
};

export type Vista = "dashboard" | "whatsapp" | "instagram" | "facebook" | "laboratorio" | "configuracion";
