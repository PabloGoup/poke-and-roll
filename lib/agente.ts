import OpenAI from "openai";
import { z } from "zod";

export const mensajeEntranteSchema = z.object({
  canal: z.enum(["whatsapp", "instagram", "facebook"]),
  cliente: z.string().min(1),
  texto: z.string().min(1),
  conversacionId: z.string().optional()
});

export type MensajeEntrante = z.infer<typeof mensajeEntranteSchema>;

type DecisionAgente = {
  agente: string;
  intencion: string;
  requiereHumano: boolean;
  respuesta: string;
  decisionSeguridad: string;
};

const palabrasReclamo = ["atraso", "demora", "malo", "reclamo", "equivocado", "frio", "no llego", "nunca llego", "cancelar"];
const palabrasVenta = ["quiero", "promo", "combo", "comprar", "pedido", "recomienda", "cuanto", "precio", "menu", "carta", "pedir"];

export function clasificarIntencion(texto: string) {
  const n = texto.toLowerCase();

  if (palabrasReclamo.some((p) => n.includes(p))) {
    return { agente: "Reclamos", intencion: "reclamo", requiereHumano: true };
  }
  if (palabrasVenta.some((p) => n.includes(p))) {
    return { agente: "Ventas", intencion: "venta", requiereHumano: false };
  }
  return { agente: "Atencion al Cliente", intencion: "consulta", requiereHumano: false };
}

export function redactarRespuestaBase(mensaje: MensajeEntrante): DecisionAgente {
  const c = clasificarIntencion(mensaje.texto);

  if (c.intencion === "reclamo") {
    return {
      ...c,
      respuesta:
        "Lamento mucho el problema. Para revisarlo ahora con el equipo, enviame por favor tu nombre y numero de pedido o telefono asociado.",
      decisionSeguridad: "escalar_a_humano"
    };
  }
  if (c.intencion === "venta") {
    return {
      ...c,
      respuesta:
        "Te ayudo altiro. Puedo recomendarte combos, rolls y extras segun cuantas personas son y si prefieres salmon, pollo, vegetariano o caliente.",
      decisionSeguridad: "aprobado"
    };
  }
  return {
    ...c,
    respuesta:
      "Hola, gracias por escribir a Poke & Roll. Te puedo ayudar con menu, promos, horarios, retiro, despacho y medios de pago.",
    decisionSeguridad: "aprobado"
  };
}

const SYSTEM_PROMPT = `Eres Roly, el agente de atencion al cliente de Poke & Roll, restaurante de poke bowls y rolls en Chile.

Habla en espanol chileno informal y cordial (tuteo, palabras como "altiro", "cachai", "bacán"). Respuestas cortas, maximo 3 oraciones.

Debes responder SOLO con JSON valido con esta estructura exacta:
{"intencion": "venta|reclamo|consulta", "requiereHumano": boolean, "respuesta": string, "decisionSeguridad": "aprobado|escalar_a_humano"}

Reglas:
- intencion "venta": el cliente quiere pedir, consultar precios, combos o recomendaciones
- intencion "reclamo": hay un problema con un pedido (atraso, error, mala calidad)
- intencion "consulta": preguntas generales sobre horario, despacho, local, medios de pago
- requiereHumano: true solo para reclamos o situaciones que no puedas resolver
- decisionSeguridad: "escalar_a_humano" si requiereHumano, "aprobado" en caso contrario
- NUNCA prometas precios exactos o tiempos de despacho especificos
- Para reclamos, pide nombre y numero de pedido`;

let openaiClient: OpenAI | null = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI();
  return openaiClient;
}

export async function generarRespuesta(mensaje: MensajeEntrante): Promise<DecisionAgente> {
  const openai = getOpenAI();

  if (!openai) return redactarRespuestaBase(mensaje);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Canal: ${mensaje.canal}. Cliente: ${mensaje.cliente}. Mensaje: "${mensaje.texto}"` }
      ]
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}") as Partial<DecisionAgente & { intencion: string }>;
    const intencion = parsed.intencion ?? "consulta";
    const agentes: Record<string, string> = {
      reclamo: "Reclamos",
      venta: "Ventas",
      consulta: "Atencion al Cliente"
    };

    return {
      agente: agentes[intencion] ?? "Atencion al Cliente",
      intencion,
      requiereHumano: Boolean(parsed.requiereHumano),
      respuesta: parsed.respuesta ?? redactarRespuestaBase(mensaje).respuesta,
      decisionSeguridad: parsed.decisionSeguridad ?? (parsed.requiereHumano ? "escalar_a_humano" : "aprobado")
    };
  } catch {
    return redactarRespuestaBase(mensaje);
  }
}
