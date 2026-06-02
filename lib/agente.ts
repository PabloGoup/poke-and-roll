import OpenAI from "openai";
import { z } from "zod";
import {
  ContextoNegocio,
  formatearPrecio,
  obtenerContextoNegocio,
  serializarContextoNegocio
} from "@/lib/catalogo";
import { obtenerConfiguracionComercial } from "@/lib/configuracion-comercial";

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
  catalogoVisual?: {
    nombre: string;
    url: string;
    tipo: string;
    prioridadEnvio: boolean;
  } | null;
};

const palabrasReclamo = ["atraso", "demora", "malo", "reclamo", "equivocado", "frio", "no llego", "nunca llego", "cancelar", "mala calidad", "nunca llegó"];
const palabrasVenta = ["quiero", "promo", "combo", "comprar", "pedido", "recomienda", "cuanto", "cuánto", "precio", "vale", "menu", "menú", "carta", "pedir", "opciones", "tienen", "hay algo", "sin palta", "palta", "salmon", "salmón", "que tienen", "que hay"];
const palabrasHorario = ["hora", "horario", "cierran", "abren", "abierto", "cerrado", "cuando abren", "cuando cierran"];
const palabrasPago = ["pago", "pagar", "transferencia", "tarjeta", "efectivo", "como pago"];
const palabrasDespacho = ["delivery", "despacho", "envio", "envío", "reparto", "domicilio", "llevan", "mandan"];
const palabrasQuitarProducto = ["sacar", "quitar", "sin", "no poner", "retirar", "omitir"];

export function clasificarIntencion(texto: string) {
  const n = texto.toLowerCase();

  if (palabrasReclamo.some((p) => n.includes(p))) {
    return { agente: "Reclamos", intencion: "reclamo", requiereHumano: true };
  }
  if (palabrasVenta.some((p) => n.includes(p))) {
    return { agente: "Ventas", intencion: "venta", requiereHumano: false };
  }
  if (palabrasHorario.some((p) => n.includes(p)) || palabrasPago.some((p) => n.includes(p)) || palabrasDespacho.some((p) => n.includes(p))) {
    return { agente: "Atencion al Cliente", intencion: "consulta", requiereHumano: false };
  }
  return { agente: "Atencion al Cliente", intencion: "consulta", requiereHumano: false };
}

function detectarPersonas(texto: string) {
  const match = texto.match(/(\d+)\s*(personas|persona|pax)/i);
  return match ? Number(match[1]) : null;
}

function esSolicitudQuitarProducto(texto: string) {
  const normalizado = normalizar(texto);
  return palabrasQuitarProducto.some((p) => normalizado.includes(normalizar(p)));
}

function redactarRespuestaVenta(mensaje: MensajeEntrante, contexto: ContextoNegocio) {
  const texto = mensaje.texto.toLowerCase();
  const personas = detectarPersonas(mensaje.texto);
  const productoBebida = contexto.productos.find((p) => p.categoria.toLowerCase().includes("bebida") || p.nombre.toLowerCase().includes("bebida"));
  const productos = contexto.productos
    .filter((p) => !(p.categoria.toLowerCase().includes("bebida") || p.nombre.toLowerCase().includes("bebida")))
    .slice(0, 4);
  const promosConPrecio = contexto.promociones.filter((p) => p.precio && p.precio > 0).slice(0, 2);

  const candidatosBase = [
    ...promosConPrecio.map((p) => `${p.nombre} a ${formatearPrecio(p.precio!)}`),
    ...productos.map((p) => `${p.nombre} a ${formatearPrecio(p.precio)}`)
  ];
  const candidatos = Array.from(new Set(candidatosBase)).slice(0, 3);

  const productoPrincipal = productos[0];
  const pideBebidas = texto.includes("bebida");

  if (personas && personas >= 4 && productoPrincipal && productoBebida && pideBebidas) {
    const total = productoPrincipal.precio + productoBebida.precio * personas;
    return `Para ${personas} personas te recomiendo ${productoPrincipal.nombre} (${formatearPrecio(productoPrincipal.precio)}) y agregar ${personas} bebidas (${formatearPrecio(productoBebida.precio)} c/u). Total referencial: ${formatearPrecio(total)}. ¿Lo dejamos para delivery o retiro?`;
  }

  if (candidatos.length === 0) {
    return "Con gusto te ayudo. No veo un combo exacto con esos datos en el catalogo, pero puedo armar una recomendacion con productos disponibles. ¿Prefieres rolls, pokes o sushi burger?";
  }

  const extraBebida = pideBebidas && productoBebida
    ? ` Puedes sumar bebidas a ${formatearPrecio(productoBebida.precio)} c/u.`
    : "";
  const enfoquePersonas = personas
    ? `Para ${personas} ${personas === 1 ? "persona" : "personas"}, te recomiendo ${candidatos.join(" o ")}.`
    : `Te recomiendo ${candidatos.join(" o ")}.`;

  const avisoCombo = texto.includes("combo") && !candidatos.some((candidato) => candidato.toLowerCase().includes("combo"))
    ? " No veo un combo cerrado con ese nombre en catalogo, asi que te paso alternativas disponibles."
    : "";

  return `${avisoCombo} ${enfoquePersonas}${extraBebida} ¿Lo quieres para delivery o retiro?`.trim();
}

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function redactarRespuestaConsulta(mensaje: MensajeEntrante, contexto: ContextoNegocio) {
  const texto = normalizar(mensaje.texto);

  if (palabrasHorario.some((p) => texto.includes(normalizar(p)))) {
    if (contexto.horarios.length > 0) {
      const cierres = Array.from(new Set(contexto.horarios.map((h) => h.horaCierre)));
      const cierre = cierres.length === 1 ? cierres[0] : "22:30";
      return `Atendemos de lunes a domingo de 12:00 a ${cierre} (viernes y sábados hasta las 23:00). ¿Quieres dejar un pedido para delivery o retiro?`;
    }
    return "Atendemos de lunes a domingo desde las 12:00. ¿Quieres dejar un pedido?";
  }

  if (palabrasPago.some((p) => texto.includes(normalizar(p)))) {
    const medios = contexto.mediosPago.length > 0
      ? contexto.mediosPago.map((m) => m.nombre).join(", ")
      : "Transferencia, Tarjeta y Efectivo";
    return `Aceptamos ${medios}. Te puedo ayudar a armar el pedido y te indico el total antes de confirmar.`;
  }

  if (palabrasDespacho.some((p) => texto.includes(normalizar(p)))) {
    if (contexto.zonasDespacho.length > 0) {
      const zona = contexto.zonasDespacho[0];
      return `Sí, hacemos delivery 🛵 Para ${zona.nombre} el costo es ${formatearPrecio(zona.costo)} con ${zona.tiempoEstimadoMin}-${zona.tiempoEstimadoMax} min estimado. ¿A qué dirección sería?`;
    }
    return "Sí, hacemos delivery a varias comunas de Santiago. ¿A qué dirección necesitas el pedido?";
  }

    return "Hola, soy el asistente de Poke & Roll. Te puedo ayudar con menú, promociones, horarios, delivery y medios de pago. ¿Qué necesitas?";
}

export function redactarRespuestaBase(mensaje: MensajeEntrante, contexto?: ContextoNegocio): DecisionAgente {
  const c = clasificarIntencion(mensaje.texto);
  const ctx = contexto ?? {
    productos: [],
    promociones: [],
    zonasDespacho: [],
    horarios: [],
    mediosPago: [],
    fuente: "fallback" as const
  };

  if (c.intencion === "reclamo") {
    return {
      ...c,
      respuesta:
        "Lamento mucho lo ocurrido. Para revisar tu caso con el equipo, ¿me puedes indicar tu nombre y número de pedido o teléfono asociado?",
      decisionSeguridad: "escalar_a_humano"
    };
  }
  if (c.intencion === "venta") {
    if (esSolicitudQuitarProducto(mensaje.texto)) {
      return {
        ...c,
        requiereHumano: false,
        respuesta:
          "Sí, podemos quitar ingredientes o productos del armado sin costo adicional. Lo dejaremos detallado como observación en la orden para que cocina lo prepare correctamente. ¿Qué producto quieres pedir y qué ingrediente debemos retirar?",
        decisionSeguridad: "aprobado"
      };
    }

    return {
      ...c,
      respuesta: redactarRespuestaVenta(mensaje, ctx),
      decisionSeguridad: "aprobado"
    };
  }
  return {
    ...c,
    respuesta: redactarRespuestaConsulta(mensaje, ctx),
    decisionSeguridad: "aprobado"
  };
}

const SYSTEM_PROMPT = `Eres Roly, el agente de atencion al cliente de Poke & Roll, restaurante de poke bowls y rolls en Chile.

Habla en espanol profesional, cercano y respetuoso. Usa tuteo moderado, sin modismos ni muletillas. Evita expresiones como "pucha", "cachai", "bacán", "te tinca", "pa'", "altiro", "compa", "amigo", "amiga". Respuestas cortas, maximo 3 oraciones.

Debes responder SOLO con JSON valido con esta estructura exacta:
{"intencion": "venta|reclamo|consulta", "requiereHumano": boolean, "respuesta": string, "decisionSeguridad": "aprobado|escalar_a_humano"}

Reglas:
- intencion "venta": el cliente quiere pedir, consultar precios, combos o recomendaciones
- intencion "reclamo": hay un problema con un pedido (atraso, error, mala calidad)
- intencion "consulta": preguntas generales sobre horario, despacho, local, medios de pago
- requiereHumano: true solo para reclamos o situaciones que no puedas resolver
- decisionSeguridad: "escalar_a_humano" si requiereHumano, "aprobado" en caso contrario
- Puedes mencionar precios, promociones, horarios y costos de despacho SOLO si aparecen en el contexto de catalogo entregado
- Si el dato no aparece en el catalogo, pide confirmacion o deriva a humano; no inventes precios, descuentos, stock ni tiempos
- No digas que puedes enviar catalogo visual salvo que el contexto indique explicitamente que hay un catalogo visual prioritario disponible
- Si no hay catalogo visual disponible, no expliques que falta el catalogo; responde con alternativas del catalogo de productos
- Si el cliente quiere sacar, quitar, retirar u omitir un ingrediente o producto del armado, no escales a humano y no cobres adicional. Indica que se puede hacer sin costo y que debe quedar detallado como observacion de la orden
- Si el cliente pide "sin palta" u otro ingrediente sin mencionar alergia grave, tratalo como modificacion normal sin costo. Si declara alergia, pide confirmacion y deja observacion clara para cocina
- Para venta, recomienda 1 a 3 opciones concretas del catalogo y haz una pregunta de cierre
- Para reclamos, pide nombre y numero de pedido`;

let openaiClient: OpenAI | null = null;

function getOpenAI() {
  // Prioridad: Gemini (gratis) → Groq (gratis) → OpenAI (pago)
  if (process.env.GEMINI_API_KEY) {
    if (!openaiClient) {
      openaiClient = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    }
    return openaiClient;
  }
  if (process.env.GROQ_API_KEY) {
    if (!openaiClient) {
      openaiClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });
    }
    return openaiClient;
  }
  if (process.env.OPENAI_API_KEY) {
    if (!openaiClient) openaiClient = new OpenAI();
    return openaiClient;
  }
  return null;
}

function getModel() {
  if (process.env.GEMINI_API_KEY) return "gemini-2.5-flash";
  if (process.env.GROQ_API_KEY) return "llama-3.3-70b-versatile";
  return "gpt-4o-mini";
}

function sanitizarTono(respuesta: string, hayCatalogoVisual: boolean) {
  let limpia = respuesta
    .replace(/\bpucha,?\s*/gi, "")
    .replace(/\bcachai\b/gi, "")
    .replace(/\bbacán\b/gi, "muy bueno")
    .replace(/\bbacanes\b/gi, "recomendadas")
    .replace(/\bte tinca\b/gi, "te gustaría")
    .replace(/\bpa['’]?\b/gi, "para")
    .replace(/\baltiro\b/gi, "a la brevedad")
    .replace(/\bcompa\b/gi, "")
    .replace(/\bamig[oa]\b/gi, "")
    .replace(/\bricas opciones\b/gi, "opciones disponibles")
    .replace(/\bricos productos\b/gi, "productos disponibles")
    .replace(/¿?cómo estai\??/gi, "¿cómo estás?");

  if (!hayCatalogoVisual) {
    limpia = limpia
      .replace(/te puedo enviar el cat[aá]logo visual primero[^.]*\.\s*/gi, "")
      .replace(/no tengo un cat[aá]logo visual[^,.;]*[,.;]?\s*/gi, "")
      .replace(/no tengo cat[aá]logo visual[^,.;]*[,.;]?\s*/gi, "");
  } else {
    limpia = limpia
      .replace(/\bte puedo enviar nuestro cat[aá]logo\b/gi, "adjunto nuestro catálogo")
      .replace(/\bte puedo enviar el cat[aá]logo\b/gi, "adjunto el catálogo")
      .replace(/¿quieres que te env[ií]e el cat[aá]logo[^?]*\?/gi, "¿Quieres que te ayude a elegir una opción?")
      .replace(/¿te lo env[ií]o\?/gi, "¿Quieres que te ayude a elegir una opción?");
  }

  return limpia.replace(/\s{2,}/g, " ").trim();
}

function aplicarReglasNegocioLocales(decision: DecisionAgente, mensaje: MensajeEntrante): DecisionAgente {
  if (!esSolicitudQuitarProducto(mensaje.texto)) return decision;

  const respuestaNormalizada = normalizar(decision.respuesta);
  const yaIndicaSinCosto = respuestaNormalizada.includes("sin costo") || respuestaNormalizada.includes("no tiene costo");
  const respuesta = yaIndicaSinCosto
    ? decision.respuesta
    : `${decision.respuesta} Quitar ingredientes o productos del armado no tiene costo adicional; lo dejaremos detallado como observación en la orden.`;

  return {
    ...decision,
    agente: "Ventas",
    intencion: "venta",
    requiereHumano: false,
    respuesta,
    decisionSeguridad: "aprobado"
  };
}

export async function generarRespuesta(mensaje: MensajeEntrante): Promise<DecisionAgente> {
  const openai = getOpenAI();
  const [contexto, configComercial] = await Promise.all([
    obtenerContextoNegocio(mensaje.texto),
    obtenerConfiguracionComercial().catch(() => null)
  ]);
  const respuestaFallback = redactarRespuestaBase(mensaje, contexto);
  const reglaCatalogoVisualActiva = configComercial?.reglas.some((r) => r.id === "catalogo-visual" && r.activa);
  const consultaCatalogo = /menu|menú|carta|promo|promocion|promoción|precio|vale|cuanto|cuánto|catalogo|catálogo/i.test(mensaje.texto);
  const catalogoVisual = reglaCatalogoVisualActiva && consultaCatalogo
    ? configComercial?.imagenes.find((img) => img.prioridadEnvio) ?? null
    : null;

  function aplicarCatalogoVisual(decision: DecisionAgente): DecisionAgente {
    if (!catalogoVisual || decision.requiereHumano) return decision;
    const esPdf = catalogoVisual.url.includes("/api/catalogo/pdf") || catalogoVisual.nombre.toLowerCase().endsWith(".pdf");
    const intro = esPdf
      ? "Adjunto el catálogo completo en PDF como primera opción."
      : "Tengo un catálogo visual disponible; lo usaré como primera opción.";
    const respuesta = decision.respuesta.toLowerCase().includes("catalogo visual")
      ? decision.respuesta
      : `${intro} ${decision.respuesta}`;

    return {
      ...decision,
      respuesta: sanitizarTono(respuesta, true),
      catalogoVisual: {
        nombre: catalogoVisual.nombre,
        url: catalogoVisual.url,
        tipo: catalogoVisual.tipo,
        prioridadEnvio: catalogoVisual.prioridadEnvio
      }
    };
  }

  function prepararDecisionLocal(decision: DecisionAgente) {
    const conReglas = aplicarReglasNegocioLocales(decision, mensaje);
    return {
      ...conReglas,
      respuesta: sanitizarTono(conReglas.respuesta, Boolean(catalogoVisual))
    };
  }

  if (!openai) {
    return aplicarCatalogoVisual(prepararDecisionLocal(respuestaFallback));
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Canal: ${mensaje.canal}. Cliente: ${mensaje.cliente}. Mensaje: "${mensaje.texto}"`,
            "",
            `Catalogo visual prioritario: ${catalogoVisual ? `disponible (${catalogoVisual.tipo}: ${catalogoVisual.nombre})` : "no disponible"}`,
            "",
            "Contexto de catalogo disponible:",
            serializarContextoNegocio(contexto)
          ].join("\n")
        }
      ]
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}") as Partial<DecisionAgente & { intencion: string }>;
    const intencion = parsed.intencion ?? "consulta";
    const agentes: Record<string, string> = {
      reclamo: "Reclamos",
      venta: "Ventas",
      consulta: "Atencion al Cliente"
    };

    const decisionModelo = aplicarReglasNegocioLocales({
      agente: agentes[intencion] ?? "Atencion al Cliente",
      intencion,
      requiereHumano: Boolean(parsed.requiereHumano),
      respuesta: sanitizarTono(parsed.respuesta ?? respuestaFallback.respuesta, Boolean(catalogoVisual)),
      decisionSeguridad: parsed.decisionSeguridad ?? (parsed.requiereHumano ? "escalar_a_humano" : "aprobado")
    }, mensaje);

    return aplicarCatalogoVisual(decisionModelo);
  } catch (err) {
    // OpenAI falló — usar respuesta basada en reglas + catálogo
    if (process.env.NODE_ENV === "development") {
      console.warn("[agente] OpenAI no disponible:", err instanceof Error ? err.message.substring(0, 60) : "error");
    }
    return aplicarCatalogoVisual(prepararDecisionLocal(respuestaFallback));
  }
}
