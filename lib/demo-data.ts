import {
  AlertTriangle,
  BadgePercent,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";

export const metricasPanel = [
  {
    titulo: "Conversaciones hoy",
    valor: "86",
    detalle: "WhatsApp concentra el 74%",
    icono: MessageCircle,
    tono: "green"
  },
  {
    titulo: "Ventas asistidas",
    valor: "$428k",
    detalle: "Ticket medio estimado $18.600",
    icono: TrendingUp,
    tono: "red"
  },
  {
    titulo: "Casos humanos",
    valor: "7",
    detalle: "4 reclamos, 3 pedidos sensibles",
    icono: AlertTriangle,
    tono: "amber"
  },
  {
    titulo: "Contenido listo",
    valor: "12",
    detalle: "Historias, carruseles y posts",
    icono: CalendarDays,
    tono: "blue"
  }
];

export const conversacionesDemo = [
  {
    cliente: "Camila R.",
    canal: "WhatsApp",
    hora: "13:42",
    estado: "requiere humano",
    intencion: "Reclamo por atraso",
    mensaje: "Hola, mi pedido lleva mas de 50 minutos y aun no llega.",
    respuesta:
      "Camila, lamento la espera. Voy a pedir tus datos para revisar el pedido con el equipo ahora.",
    prioridad: "alta"
  },
  {
    cliente: "@nachofood",
    canal: "Instagram",
    hora: "13:35",
    estado: "auto respondido",
    intencion: "Consulta promociones",
    mensaje: "Que promos tienen para 2?",
    respuesta:
      "Tenemos opciones ideales para compartir. Te recomiendo un combo mixto y agregar gyosas para completar.",
    prioridad: "media"
  },
  {
    cliente: "Valentina M.",
    canal: "WhatsApp",
    hora: "13:21",
    estado: "venta guiada",
    intencion: "Armar pedido",
    mensaje: "Quiero algo sin palta y con salmon.",
    respuesta:
      "Perfecto, te puedo recomendar rolls con salmon sin palta y revisar alternativas calientes.",
    prioridad: "normal"
  }
];

export const agentesDemo = [
  {
    nombre: "Atencion",
    estado: "activo",
    descripcion: "Menu, horarios, despacho, retiro y medios de pago.",
    icono: Bot
  },
  {
    nombre: "Ventas",
    estado: "activo",
    descripcion: "Recomienda combos, extras y promociones segun contexto.",
    icono: BadgePercent
  },
  {
    nombre: "Reclamos",
    estado: "alerta",
    descripcion: "Pide datos minimos y deriva casos sensibles.",
    icono: AlertTriangle
  },
  {
    nombre: "Contenido",
    estado: "programando",
    descripcion: "Historias, carruseles y calendario diario.",
    icono: Instagram
  },
  {
    nombre: "Seguridad",
    estado: "activo",
    descripcion: "Bloquea promesas no confirmadas y datos riesgosos.",
    icono: ShieldCheck
  }
];

export const contenidoDemo = [
  {
    tipo: "Historia",
    titulo: "Almuerzo express",
    horario: "12:30",
    estado: "programado",
    piezas: 3,
    idea: "Promo de horario con CTA a WhatsApp."
  },
  {
    tipo: "Carrusel",
    titulo: "Combos para compartir",
    horario: "18:20",
    estado: "borrador",
    piezas: 5,
    idea: "Tres rutas de compra: economico, mixto y premium."
  },
  {
    tipo: "Post",
    titulo: "Roll destacado",
    horario: "20:45",
    estado: "aprobado",
    piezas: 1,
    idea: "Producto hero con foco en salmon y crispy."
  }
];

export const integracionesDemo = [
  {
    nombre: "WhatsApp Business",
    estado: "prioridad",
    detalle: "Webhook, respuestas y alertas al numero de atencion.",
    icono: MessageCircle
  },
  {
    nombre: "Instagram",
    estado: "contenido",
    detalle: "DMs, historias, publicaciones y carruseles.",
    icono: Instagram
  },
  {
    nombre: "n8n",
    estado: "alertas",
    detalle: "Deriva reclamos y resumen diario al equipo.",
    icono: Flame
  },
  {
    nombre: "OpenAI",
    estado: "cerebro",
    detalle: "Clasifica intenciones, redacta y aplica seguridad.",
    icono: Sparkles
  },
  {
    nombre: "Neon Postgres",
    estado: "datos",
    detalle: "Clientes, mensajes, reclamos, contenidos y auditoria.",
    icono: CheckCircle2
  },
  {
    nombre: "Meta Webhooks",
    estado: "entrada",
    detalle: "Eventos oficiales de WhatsApp e Instagram.",
    icono: Clock3
  }
];
