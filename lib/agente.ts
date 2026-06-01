import { z } from "zod";

export const mensajeEntranteSchema = z.object({
  canal: z.enum(["whatsapp", "instagram"]),
  cliente: z.string().min(1),
  texto: z.string().min(1),
  conversacionId: z.string().optional()
});

export type MensajeEntrante = z.infer<typeof mensajeEntranteSchema>;

const palabrasReclamo = ["atraso", "demora", "malo", "reclamo", "equivocado", "frio", "no llego"];
const palabrasVenta = ["quiero", "promo", "combo", "comprar", "pedido", "recomienda", "cuanto"];

export function clasificarIntencion(texto: string) {
  const normalizado = texto.toLowerCase();

  if (palabrasReclamo.some((palabra) => normalizado.includes(palabra))) {
    return {
      agente: "Reclamos",
      intencion: "reclamo",
      requiereHumano: true
    };
  }

  if (palabrasVenta.some((palabra) => normalizado.includes(palabra))) {
    return {
      agente: "Ventas",
      intencion: "venta",
      requiereHumano: false
    };
  }

  return {
    agente: "Atencion al Cliente",
    intencion: "consulta",
    requiereHumano: false
  };
}

export function redactarRespuestaBase(mensaje: MensajeEntrante) {
  const clasificacion = clasificarIntencion(mensaje.texto);

  if (clasificacion.intencion === "reclamo") {
    return {
      ...clasificacion,
      respuesta:
        "Lamento mucho el problema. Para revisarlo ahora con el equipo, enviame por favor tu nombre y numero de pedido o telefono asociado.",
      decisionSeguridad: "escalar_a_humano"
    };
  }

  if (clasificacion.intencion === "venta") {
    return {
      ...clasificacion,
      respuesta:
        "Te ayudo altiro. Puedo recomendarte combos, rolls y extras segun cuantas personas son y si prefieres salmon, pollo, vegetariano o caliente.",
      decisionSeguridad: "aprobado"
    };
  }

  return {
    ...clasificacion,
    respuesta:
      "Hola, gracias por escribir a Poke & Roll. Te puedo ayudar con menu, promos, horarios, retiro, despacho y medios de pago.",
    decisionSeguridad: "aprobado"
  };
}
