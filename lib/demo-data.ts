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

export type MensajeDemo = {
  texto: string;
  direccion: "entrada" | "salida";
  hora: string;
  fecha?: string;
};

export const threadsDemo: Record<string, MensajeDemo[]> = {
  "Camila R.": [
    { texto: "Hola buenas tardes!", direccion: "entrada", hora: "13:38", fecha: "Hoy" },
    { texto: "¡Hola Camila! Bienvenida a Poke & Roll 🍣 ¿En qué te puedo ayudar?", direccion: "salida", hora: "13:38" },
    { texto: "Hice un pedido hace rato y todavía no llega", direccion: "entrada", hora: "13:39" },
    { texto: "Entiendo tu preocupación. Para revisar tu pedido, ¿me puedes dar el número de orden?", direccion: "salida", hora: "13:39" },
    { texto: "No tengo el número, lo hice por la app hace como 1 hora", direccion: "entrada", hora: "13:40" },
    { texto: "No hay problema. Con tu nombre y dirección de entrega puedo encontrarlo en el sistema 🙏", direccion: "salida", hora: "13:40" },
    { texto: "Camila Rodríguez, Av. Providencia 1234", direccion: "entrada", hora: "13:41" },
    { texto: "Encontré tu pedido. Hay un retraso por alta demanda. El tiempo estimado es 15 minutos más. Disculpa las molestias 🙇", direccion: "salida", hora: "13:41" },
    { texto: "Hola, mi pedido lleva mas de 50 minutos y aun no llega.", direccion: "entrada", hora: "13:42" },
    { texto: "Camila, lamento la espera. Voy a derivar tu caso al equipo ahora mismo para que te contacten directamente.", direccion: "salida", hora: "13:42" },
  ],
  "@nachofood": [
    { texto: "Hola! qué tal?", direccion: "entrada", hora: "13:28", fecha: "Hoy" },
    { texto: "¡Hola! Todo bien por acá 😊 ¿Qué se te antoja hoy?", direccion: "salida", hora: "13:29" },
    { texto: "Somos 2 personas y queremos pedir algo rico", direccion: "entrada", hora: "13:30" },
    { texto: "¡Perfecto para compartir! Tenemos combos especiales para dos. ¿Prefieren algo frío, caliente o mixto?", direccion: "salida", hora: "13:31" },
    { texto: "mixto ojalá, con algo caliente también", direccion: "entrada", hora: "13:32" },
    { texto: "El Combo Mix (8 rolls + 4 tempuras) es ideal para eso. También podría agregar gyosas que son un hit 🔥", direccion: "salida", hora: "13:33" },
    { texto: "qué precio tiene eso?", direccion: "entrada", hora: "13:34" },
    { texto: "El Combo Mix está a $18.900 y las gyosas a $4.500 adicional. ¿Te interesa?", direccion: "salida", hora: "13:34" },
    { texto: "Que promos tienen para 2?", direccion: "entrada", hora: "13:35" },
    { texto: "Tenemos opciones ideales para compartir. Te recomiendo un combo mixto y agregar gyosas para completar.", direccion: "salida", hora: "13:35" },
  ],
  "Valentina M.": [
    { texto: "Buenas! tienen opciones sin palta?", direccion: "entrada", hora: "13:18", fecha: "Hoy" },
    { texto: "¡Hola Valentina! Claro que sí, tenemos varias opciones sin palta 🙌", direccion: "salida", hora: "13:18" },
    { texto: "Qué tienen con salmón pero sin palta? soy alérgica", direccion: "entrada", hora: "13:19" },
    { texto: "Tenemos el Roll Salmón Clásico (queso crema + pepino) y el Spicy Salmon sin palta. Ambos muy buenos 🍣", direccion: "salida", hora: "13:19" },
    { texto: "el spicy suena bien, tiene mucho picante?", direccion: "entrada", hora: "13:20" },
    { texto: "Tiene un picante suave, nada muy intenso. ¿Te armo el pedido con ese?", direccion: "salida", hora: "13:20" },
    { texto: "Quiero algo sin palta y con salmon.", direccion: "entrada", hora: "13:21" },
    { texto: "Perfecto, te puedo recomendar rolls con salmon sin palta y revisar alternativas calientes.", direccion: "salida", hora: "13:21" },
  ],
  // ─── Instagram ───
  "@sofi.gonzalez": [
    { texto: "Hola! vi su post en insta y quiero saber más", direccion: "entrada", hora: "12:05", fecha: "Hoy" },
    { texto: "¡Hola Sofi! Gracias por escribirnos 😊 ¿Qué quieres saber?", direccion: "salida", hora: "12:05" },
    { texto: "tienen delivery a vitacura?", direccion: "entrada", hora: "12:06" },
    { texto: "¡Sí! Hacemos delivery a Vitacura. El tiempo estimado es 35-45 minutos 🛵", direccion: "salida", hora: "12:06" },
    { texto: "qué rico! y cuál es el mínimo de pedido?", direccion: "entrada", hora: "12:07" },
    { texto: "El mínimo es $10.000. ¿Te cuento las opciones más populares?", direccion: "salida", hora: "12:07" },
    { texto: "siiiii porfavor!", direccion: "entrada", hora: "12:08" },
    { texto: "Nuestros más pedidos son el Combo Mix ($18.900) y el Salmón Clásico individual ($8.900). ¡Son un hit! 🍣", direccion: "salida", hora: "12:08" },
  ],
  "@poke_fan_cl": [
    { texto: "cuánto sale el combo para 4 personas?", direccion: "entrada", hora: "11:45", fecha: "Hoy" },
    { texto: "Para 4 personas recomendamos 2 combos Mix a $18.900 c/u o nuestro combo familiar a $34.900 🎉", direccion: "salida", hora: "11:45" },
    { texto: "el familiar qué incluye?", direccion: "entrada", hora: "11:46" },
    { texto: "16 rolls variados + 8 tempuras + 4 gyosas. ¡Es ideal para compartir!", direccion: "salida", hora: "11:46" },
    { texto: "tienen promo para 2?", direccion: "entrada", hora: "11:47" },
    { texto: "Sí, el Combo Pareja incluye 8 rolls + 2 bebidas a $16.900 🥢", direccion: "salida", hora: "11:47" },
  ],
  // ─── Facebook ───
  "Carlos Mendoza": [
    { texto: "Buenas, ¿tienen sucursal en Santiago centro?", direccion: "entrada", hora: "10:30", fecha: "Hoy" },
    { texto: "¡Hola Carlos! Somos solo delivery por ahora, pero cubrimos toda la RM 📍", direccion: "salida", hora: "10:30" },
    { texto: "ah ya, y cuánto demora a Maipú?", direccion: "entrada", hora: "10:31" },
    { texto: "A Maipú el tiempo estimado es 50-60 minutos. ¿Te interesa hacer un pedido?", direccion: "salida", hora: "10:31" },
    { texto: "sí, qué opciones tienen para una persona?", direccion: "entrada", hora: "10:32" },
    { texto: "Tenemos rolls individuales desde $6.900 y combos personales desde $12.900. ¿Qué prefieres, salmón, camarón o mixto?", direccion: "salida", hora: "10:32" },
    { texto: "me quedo con el salmón. Cómo pido?", direccion: "entrada", hora: "10:33" },
    { texto: "Por WhatsApp o directo en nuestro sitio 🔗 Te mando el link al tiro.", direccion: "salida", hora: "10:33" },
  ],
  "María José Lagos": [
    { texto: "Hola! quiero hacer un pedido grande para una reunión de trabajo", direccion: "entrada", hora: "09:15", fecha: "Hoy" },
    { texto: "¡Hola María José! Con gusto te ayudamos con pedidos corporativos 🏢", direccion: "salida", hora: "09:15" },
    { texto: "somos 12 personas, qué recomiendan?", direccion: "entrada", hora: "09:16" },
    { texto: "Para 12 personas recomendamos 3 combos familiares variados. Total: $104.700. ¿Te incluyo bebidas?", direccion: "salida", hora: "09:16" },
    { texto: "sí, con bebidas. tienen descuento por volumen?", direccion: "entrada", hora: "09:17" },
    { texto: "Para pedidos sobre $80.000 aplicamos 10% de descuento 🎁 Su pedido calificaría.", direccion: "salida", hora: "09:17" },
    { texto: "perfecto, lo confirmo en un rato", direccion: "entrada", hora: "09:18" },
    { texto: "Perfecto, cuando quieras. Necesitamos al menos 2 horas de anticipación para pedidos grandes ⏰", direccion: "salida", hora: "09:18" },
  ],
  "Pedro Soto": [
    { texto: "su horario de atención?", direccion: "entrada", hora: "08:00", fecha: "Hoy" },
    { texto: "Atendemos de lunes a domingo de 12:00 a 22:30 🕛", direccion: "salida", hora: "08:00" },
    { texto: "y los fines de semana igual?", direccion: "entrada", hora: "08:01" },
    { texto: "¡Sí! Fines de semana hasta las 23:00 🌙 ¿Hay algo más en que pueda ayudarte?", direccion: "salida", hora: "08:01" },
  ],
};

export const conversacionesDemo = [
  // ─── WhatsApp ───
  {
    cliente: "Camila R.",
    canal: "WhatsApp",
    hora: "13:42",
    estado: "requiere humano",
    intencion: "Reclamo por atraso",
    mensaje: "Hola, mi pedido lleva mas de 50 minutos y aun no llega.",
    respuesta: "Camila, lamento la espera. Voy a derivar tu caso al equipo ahora mismo.",
    prioridad: "alta"
  },
  {
    cliente: "Valentina M.",
    canal: "WhatsApp",
    hora: "13:21",
    estado: "venta guiada",
    intencion: "Armar pedido",
    mensaje: "Quiero algo sin palta y con salmon.",
    respuesta: "Perfecto, te puedo recomendar rolls con salmon sin palta y revisar alternativas calientes.",
    prioridad: "normal"
  },
  {
    cliente: "Tomás B.",
    canal: "WhatsApp",
    hora: "12:55",
    estado: "activa",
    intencion: "Consulta horario",
    mensaje: "A qué hora cierran hoy?",
    respuesta: "Hoy cerramos a las 22:30. ¿Quieres hacer un pedido antes?",
    prioridad: "normal"
  },
  // ─── Instagram ───
  {
    cliente: "@sofi.gonzalez",
    canal: "Instagram",
    hora: "12:08",
    estado: "venta guiada",
    intencion: "Consulta delivery",
    mensaje: "siiiii porfavor!",
    respuesta: "Nuestros más pedidos son el Combo Mix ($18.900) y el Salmón Clásico ($8.900).",
    prioridad: "media"
  },
  {
    cliente: "@nachofood",
    canal: "Instagram",
    hora: "13:35",
    estado: "auto respondido",
    intencion: "Consulta promociones",
    mensaje: "Que promos tienen para 2?",
    respuesta: "Tenemos opciones ideales para compartir. Te recomiendo un combo mixto.",
    prioridad: "media"
  },
  {
    cliente: "@poke_fan_cl",
    canal: "Instagram",
    hora: "11:47",
    estado: "activa",
    intencion: "Consulta combo",
    mensaje: "tienen promo para 2?",
    respuesta: "Sí, el Combo Pareja incluye 8 rolls + 2 bebidas a $16.900 🥢",
    prioridad: "normal"
  },
  // ─── Facebook ───
  {
    cliente: "Carlos Mendoza",
    canal: "Facebook",
    hora: "10:33",
    estado: "venta guiada",
    intencion: "Consulta delivery",
    mensaje: "me quedo con el salmón. Cómo pido?",
    respuesta: "Por WhatsApp o directo en nuestro sitio 🔗 Te mando el link al tiro.",
    prioridad: "normal"
  },
  {
    cliente: "María José Lagos",
    canal: "Facebook",
    hora: "09:18",
    estado: "activa",
    intencion: "Pedido corporativo",
    mensaje: "perfecto, lo confirmo en un rato",
    respuesta: "Perfecto. Necesitamos al menos 2 horas de anticipación para pedidos grandes ⏰",
    prioridad: "alta"
  },
  {
    cliente: "Pedro Soto",
    canal: "Facebook",
    hora: "08:01",
    estado: "resuelta",
    intencion: "Consulta horario",
    mensaje: "y los fines de semana igual?",
    respuesta: "¡Sí! Fines de semana hasta las 23:00 🌙",
    prioridad: "normal"
  },
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
