import OpenAI from "openai";
import { z } from "zod";
import {
  ContextoNegocio,
  formatearPrecio,
  obtenerContextoNegocio,
  serializarContextoNegocio
} from "@/lib/catalogo";
import { obtenerConfiguracionComercial } from "@/lib/configuracion-comercial";
import { calcularCostoDespacho } from "@/lib/geocodificacion";
import { prisma } from "@/lib/prisma";

export const mensajeEntranteSchema = z.object({
  canal: z.enum(["whatsapp", "instagram", "facebook"]),
  cliente: z.string().min(1),
  texto: z.string().min(1),
  localId: z.string().optional(),   // multi-tenant: id del Local en DB
  conversacionId: z.string().optional(),
  historial: z.array(z.object({
    rol: z.enum(["cliente", "agente"]),
    texto: z.string().min(1)
  })).max(12).optional()
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
const palabrasVenta = ["quiero", "promo", "combo", "comprar", "pedido", "recomienda", "cuanto", "cuánto", "precio", "vale", "menu", "menú", "carta", "pedir", "opciones", "tienen", "hay algo", "sin palta", "palta", "salmon", "salmón", "cambiar", "cambio", "reemplazar", "que tienen", "que hay"];
const palabrasHorario = ["hora", "horario", "cierran", "abren", "abierto", "cerrado", "cuando abren", "cuando cierran"];
const palabrasPago = ["pago", "pagar", "transferencia", "tarjeta", "efectivo", "como pago"];
const palabrasDespacho = ["delivery", "despacho", "envio", "envío", "reparto", "domicilio", "llevan", "mandan"];
const palabrasRetiro = ["retiro", "retirar", "retiro en local", "retirar en local", "pasar a buscar", "buscar al local"];
const palabrasQuitarProducto = ["sacar", "quitar", "sin", "no poner", "retirar", "omitir"];
const palabrasAlergia = ["alergia", "alergica", "alergico", "alérgica", "alérgico", "intolerancia"];
const palabrasCambioProducto = ["cambiar", "cambio", "cambiame", "cámbiame", "reemplazar", "reemplazame", "modificar", "sustituir", "por pollo", "por salmon", "por salmón", "por carne", "todo por"];
const palabrasGestionPedido = ["pedido", "pedir", "comprar", "quiero", "lo quiero", "encargar", "ordenar", "confirmar", "delivery", "retiro", "retiro en local", "pasar a buscar", "direccion", "dirección"];

export function clasificarIntencion(texto: string) {
  const n = texto.toLowerCase();

  if (palabrasReclamo.some((p) => n.includes(p))) {
    return { agente: "Reclamos", intencion: "reclamo", requiereHumano: true };
  }
  if (palabrasVenta.some((p) => n.includes(p))) {
    return { agente: "Ventas", intencion: "venta", requiereHumano: false };
  }
  if (palabrasHorario.some((p) => n.includes(p)) || palabrasPago.some((p) => n.includes(p)) || palabrasDespacho.some((p) => n.includes(p)) || palabrasRetiro.some((p) => n.includes(p))) {
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
  if (/\b(retiro|retirar|retira|retirarlo|retirarla)\s+(en|por)\s+(local|tienda)\b/.test(normalizado)) return false;
  if (/\b(pasar|voy)\s+a\s+retirar\b/.test(normalizado)) return false;
  if (/\bsushi\s+sin\s+arroz\b/.test(normalizado)) return false;
  if (esSolicitudCambioProducto(texto)) return false;
  return palabrasQuitarProducto.some((p) => normalizado.includes(normalizar(p)));
}

function esSolicitudCambioProducto(texto: string) {
  const normalizado = normalizar(texto);
  if (esConsultaRetiroLocal(texto)) return false;
  return palabrasCambioProducto.some((p) => normalizado.includes(normalizar(p)));
}

function esCambioEnvoltura(texto: string) {
  const normalizado = normalizar(texto);
  return /\b(envuelto|envuelta|envolver|envoltura|env)\b/.test(normalizado);
}

function pideEnvolturaSalmon(texto: string) {
  const normalizado = normalizar(texto);
  return esCambioEnvoltura(texto) && /\bsalmon\b/.test(normalizado);
}

function esCambioProteinaPremium(texto: string) {
  const normalizado = normalizar(texto);
  return /\b(salmon|carne|beef)\b/.test(normalizado) && !esCambioEnvoltura(texto);
}

function redactarRespuestaCambioProducto(mensaje: MensajeEntrante) {
  if (pideEnvolturaSalmon(mensaje.texto)) {
    return "Podemos hacer cambios de envoltura con recargo de $1.000, pero no trabajamos envuelto en salmón. Si quieres, puedo dejarlo envuelto en palta, queso, sésamo o ciboulette según disponibilidad.";
  }

  if (esCambioEnvoltura(mensaje.texto)) {
    return "Sí, podemos cambiar la envoltura con recargo de $1.000 por cambio. Lo dejamos detallado como observación en la orden para que cocina lo prepare correctamente. ¿Qué envoltura quieres usar?";
  }

  const recargo = esCambioProteinaPremium(mensaje.texto) ? "$1.500" : "$1.000";
  const detalle = esCambioProteinaPremium(mensaje.texto)
    ? "cuando el cambio del interior principal es por salmón o carne"
    : "cuando el cambio del interior principal es por pollo, camarón, kanikama, palmito, champiñón u otro vegetal/proteína estándar";

  return `Sí, podemos cambiar el interior principal, pero no es gratis: el recargo es de ${recargo} por cambio ${detalle}. Quitar un ingrediente sin reemplazarlo sí es gratis; cambiarlo por otro ingrediente debe quedar detallado en la orden. ¿Qué producto quieres modificar y por qué ingrediente lo cambiamos?`;
}

function mencionaAlergia(texto: string) {
  const normalizado = normalizar(texto);
  return palabrasAlergia.some((p) => normalizado.includes(normalizar(p)));
}

function esConsultaRetiroLocal(texto: string) {
  const normalizado = normalizar(texto);
  return palabrasRetiro.some((p) => normalizado.includes(normalizar(p)));
}

function esSolicitudCatalogoVisual(texto: string) {
  const normalizado = normalizar(texto);
  const pideCatalogoCompleto =
    /\b(menu|carta|catalogo)\b/.test(normalizado)
    || normalizado.includes("mandame la carta")
    || normalizado.includes("enviame la carta")
    || normalizado.includes("ver la carta")
    || normalizado.includes("ver el menu")
    || normalizado.includes("menu completo")
    || normalizado.includes("catalogo completo");
  const pidePromociones =
    /\b(que|cuales|cuáles|ver|mandame|mándame|enviame|envíame|tienen|hay)\b.*\b(promo|promos|promocion|promociones)\b/.test(normalizado)
    || /\b(promo|promos|promocion|promociones)\b.*\b(tienen|hay|disponibles|vigentes|ver|mandame|mándame|enviame|envíame)\b/.test(normalizado);
  const pidePrecios = /\b(precios|lista de precios)\b/.test(normalizado);
  const pideVistaGeneral = normalizado.includes("que tienen")
    || normalizado.includes("que venden")
    || normalizado.includes("que opciones tienen");
  const preguntaEspecifica = /\b(recomiend|recomendar|roll|rolls|poke|pokes|sushi|burger|hand roll|aperitivo|spicy|picante|palta|salmon|camaron|pollo|vegetarian)\b/.test(normalizado)
    || normalizado.includes("que tienen con")
    || normalizado.includes("cuanto vale")
    || normalizado.includes("cuanto cuesta");

  if (preguntaEspecifica && !pideCatalogoCompleto && !pidePromociones && !pidePrecios) return false;

  return pideCatalogoCompleto || pidePromociones || pidePrecios || pideVistaGeneral;
}

function esCanalSocialDerivacion(canal: MensajeEntrante["canal"]) {
  return canal === "instagram" || canal === "facebook";
}

function enlaceWhatsappPedidos() {
  return process.env.WHATSAPP_PEDIDOS_URL?.trim()
    || process.env.NEXT_PUBLIC_WHATSAPP_PEDIDOS_URL?.trim()
    || "https://wa.me/56940999386";
}

function enlaceSitioPedidos() {
  return process.env.SITIO_PEDIDOS_URL?.trim()
    || process.env.NEXT_PUBLIC_SITIO_PEDIDOS_URL?.trim()
    || "";
}

function textoCanalesPedido() {
  const whatsapp = enlaceWhatsappPedidos();
  const sitio = enlaceSitioPedidos();
  return sitio
    ? `WhatsApp: ${whatsapp} o sitio web: ${sitio}`
    : `WhatsApp: ${whatsapp}`;
}

function esSolicitudGestionPedido(texto: string) {
  const normalizado = normalizar(texto);
  return palabrasGestionPedido.some((p) => normalizado.includes(normalizar(p)));
}

function limpiarCierrePedidoEnCanalSocial(respuesta: string) {
  return respuesta
    .replace(/¿Lo quieres para delivery o retiro\?/gi, `Para pedir, escríbenos por ${textoCanalesPedido()}.`)
    .replace(/¿Quieres dejar un pedido[^?]*\?/gi, `Para pedidos, escríbenos por ${textoCanalesPedido()}.`)
    .replace(/¿A qué dirección sería\?/gi, `Para coordinar dirección y pago, escríbenos por ${textoCanalesPedido()}.`)
    .replace(/¿A qué dirección necesitas el pedido\?/gi, `Para coordinar dirección y pago, escríbenos por ${textoCanalesPedido()}.`)
    .replace(/te ayudo a armar el pedido/gi, "te puedo orientar con dudas generales")
    .replace(/dejamos el pedido armado/gi, "te derivamos para confirmar por WhatsApp")
    .replace(/te indico el total antes de confirmar/gi, "la confirmación se realiza por WhatsApp o sitio web");
}

function aplicarPoliticaCanalSocial(decision: DecisionAgente, mensaje: MensajeEntrante): DecisionAgente {
  if (!esCanalSocialDerivacion(mensaje.canal)) return decision;

  const pideCatalogo = esSolicitudCatalogoCompleto(mensaje.texto) || esSolicitudCatalogoVisual(mensaje.texto);
  const quiereGestionarPedido = esSolicitudGestionPedido(mensaje.texto);
  const canalesPedido = textoCanalesPedido();

  if (pideCatalogo) {
    return {
      ...decision,
      agente: "Atencion al Cliente",
      intencion: "consulta",
      requiereHumano: false,
      decisionSeguridad: "aprobado",
      respuesta: `Por este canal no enviamos catálogo ni tomamos pedidos. Con gusto puedo resolver dudas generales por aquí; para ver el menú completo o comprar, escríbenos por ${canalesPedido}.`,
      catalogoVisual: null
    };
  }

  if (quiereGestionarPedido && decision.intencion === "venta") {
    return {
      ...decision,
      agente: "Atencion al Cliente",
      intencion: "consulta",
      requiereHumano: false,
      decisionSeguridad: "aprobado",
      respuesta: `Por Instagram y Facebook no gestionamos pedidos. Puedo resolver dudas generales por aquí, pero para comprar o coordinar retiro/delivery escríbenos por ${canalesPedido}.`,
      catalogoVisual: null
    };
  }

  return {
    ...decision,
    respuesta: limpiarCierrePedidoEnCanalSocial(decision.respuesta),
    catalogoVisual: null
  };
}

function esSolicitudCatalogoCompleto(texto: string) {
  const normalizado = normalizar(texto);
  return /\b(menu|carta|catalogo)\b/.test(normalizado)
    || normalizado.includes("mandame la carta")
    || normalizado.includes("enviame la carta")
    || normalizado.includes("ver la carta")
    || normalizado.includes("ver el menu")
    || normalizado.includes("menu completo")
    || normalizado.includes("catalogo completo");
}

function esSolicitudListadoPromociones(texto: string) {
  const normalizado = normalizar(texto);
  return /\b(que|cuales|cuáles|ver|mandame|mándame|enviame|envíame|tienen|hay)\b.*\b(promo|promos|promocion|promociones)\b/.test(normalizado)
    || /\b(promo|promos|promocion|promociones)\b.*\b(tienen|hay|disponibles|vigentes|ver|mandame|mándame|enviame|envíame)\b/.test(normalizado);
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

  if (esConsultaRetiroLocal(mensaje.texto)) {
    return "Sí, puedes retirar en local. Si quieres, te ayudo a elegir productos y dejamos el pedido armado para retiro.";
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
    if (mencionaAlergia(mensaje.texto)) {
      return {
        ...c,
        requiereHumano: true,
        respuesta:
          "Tenemos opciones que pueden adaptarse, pero como mencionas alergia prefiero que el equipo confirme la preparación segura antes de cerrar el pedido. ¿Qué producto te interesa y qué ingrediente debemos evitar?",
        decisionSeguridad: "escalar_a_humano"
      };
    }

    if (esSolicitudCambioProducto(mensaje.texto)) {
      return {
        ...c,
        requiereHumano: false,
        respuesta: redactarRespuestaCambioProducto(mensaje),
        decisionSeguridad: "aprobado"
      };
    }

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
- Puedes mencionar precios, promociones, horarios y costos de despacho SOLO si aparecen TEXTUALMENTE en el contexto de catalogo entregado
- NUNCA inventes tiempos de espera, tiempos de despacho, precios, descuentos ni stock. Si el dato no esta en el contexto, di que no tienes ese dato y ofrece derivar al equipo
- Si preguntan por tiempo de espera o tiempo de despacho y no esta en el contexto, responde: "Para darte un tiempo preciso, te recomiendo contactar directamente con el equipo" y pon requiereHumano: true
- Si preguntan si pueden retirar en local, responde que si pueden retirar en local y no escales a humano
- No digas que puedes enviar catalogo visual salvo que el contexto indique explicitamente que hay un catalogo visual prioritario disponible
- Si no hay catalogo visual disponible, no expliques que falta el catalogo; responde con alternativas del catalogo de productos
- Si el cliente quiere sacar, quitar, retirar u omitir un ingrediente o producto del armado SIN reemplazarlo por otro, no escales a humano y no cobres adicional. Indica que se puede hacer sin costo y que debe quedar detallado como observacion de la orden
- Si el cliente pide "sin palta" u otro ingrediente sin mencionar alergia grave, tratalo como quitar ingrediente gratis. Si declara alergia, pide confirmacion y deja observacion clara para cocina
- Si el cliente quiere cambiar, reemplazar o sustituir el interior principal por otro ingrediente, NO digas que es gratis: el cambio cuesta $1.000 por cambio. Si el cambio es por salmón o carne, cuesta $1.500 por cambio
- Si el cliente quiere cambiar envoltura, el cambio cuesta $1.000. No trabajamos envuelto en salmón
- Si el cliente declara alergia o intolerancia, requiereHumano debe ser true y decisionSeguridad "escalar_a_humano"
- Para venta, recomienda 1 a 3 opciones concretas del catalogo y haz una pregunta de cierre
- Para reclamos, pide nombre y numero de pedido
- En Instagram y Facebook NO tomes pedidos, NO pidas direccion, NO cierres venta, NO prometas adjuntar PDF/catalogo y NO coordines delivery/retiro. Esos canales son solo para derivar a WhatsApp/sitio web, resolver dudas generales, campañas, noticias, informacion y marketing.
- Para preguntas de costo de despacho sin dirección: muestra los rangos de zonas que aparezcan en el contexto (ej: "hasta 3 km $2.000, hasta 7 km $3.500") y luego pregunta la dirección del cliente
- Si el contexto incluye "INFORMACION DE DESPACHO CALCULADA": usa exactamente esos datos para informar el costo ("Para esa dirección el despacho es $X, aprox Y km, tiempo estimado Z-W min"). Pregunta si confirma o si necesita algo más
- Si "INFORMACION DE DESPACHO CALCULADA" dice que la dirección no coincide con ningún rango: informa que no puedes calcular el costo exacto para esa zona y pon requiereHumano: true para que el equipo confirme
- Nunca inventes un costo de despacho. Solo usa datos del contexto o de INFORMACION DE DESPACHO CALCULADA`;

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
      .replace(/con gusto adjunto nuestro cat[aá]logo visual[^.]*\.\s*/gi, "")
      .replace(/tenemos un cat[aá]logo visual disponible[^.]*\.\s*/gi, "")
      .replace(/te lo enviar[eé][^.]*\.\s*/gi, "")
      .replace(/lo enviar[eé][^.]*\.\s*/gi, "")
      .replace(/¿quieres que te env[ií]e el cat[aá]logo[^?]*\?/gi, "¿Quieres que te ayude a elegir una opción?")
      .replace(/¿te lo env[ií]o\?/gi, "¿Quieres que te ayude a elegir una opción?");
  }

  return limpia.replace(/\s{2,}/g, " ").trim();
}

// Solo reglas de seguridad — para mensajes con historial donde el modelo ya tiene contexto
function aplicarSoloReglasSeguridad(decision: DecisionAgente, mensaje: MensajeEntrante): DecisionAgente {
  if (mencionaAlergia(mensaje.texto)) {
    return {
      ...decision,
      agente: "Ventas",
      intencion: "venta",
      requiereHumano: true,
      respuesta: "Tenemos opciones que pueden adaptarse, pero como mencionas alergia prefiero que el equipo confirme la preparación segura antes de cerrar el pedido. ¿Qué producto te interesa y qué ingrediente debemos evitar?",
      decisionSeguridad: "escalar_a_humano"
    };
  }
  return decision;
}

function aplicarReglasNegocioLocales(decision: DecisionAgente, mensaje: MensajeEntrante): DecisionAgente {
  if (pideEnvolturaSalmon(mensaje.texto)) {
    return {
      ...decision,
      agente: "Ventas",
      intencion: "venta",
      requiereHumano: false,
      respuesta: redactarRespuestaCambioProducto(mensaje),
      decisionSeguridad: "aprobado"
    };
  }

  if (esConsultaRetiroLocal(mensaje.texto)) {
    return {
      ...decision,
      agente: "Atencion al Cliente",
      intencion: "consulta",
      requiereHumano: false,
      respuesta: "Sí, puedes retirar en local. Si quieres, te ayudo a elegir productos y dejamos el pedido armado para retiro.",
      decisionSeguridad: "aprobado"
    };
  }

  if (mencionaAlergia(mensaje.texto)) {
    return {
      ...decision,
      agente: "Ventas",
      intencion: "venta",
      requiereHumano: true,
      respuesta:
        "Tenemos opciones que pueden adaptarse, pero como mencionas alergia prefiero que el equipo confirme la preparación segura antes de cerrar el pedido. ¿Qué producto te interesa y qué ingrediente debemos evitar?",
      decisionSeguridad: "escalar_a_humano"
    };
  }

  if (esSolicitudCambioProducto(mensaje.texto)) {
    return {
      ...decision,
      agente: "Ventas",
      intencion: "venta",
      requiereHumano: false,
      respuesta: redactarRespuestaCambioProducto(mensaje),
      decisionSeguridad: "aprobado"
    };
  }

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

function ultimoMensajeAgentePidioDireccion(
  historial: MensajeEntrante["historial"]
): boolean {
  if (!historial || historial.length === 0) return false;
  const ultimoAgente = [...historial].reverse().find((h) => h.rol === "agente");
  if (!ultimoAgente) return false;
  const t = ultimoAgente.texto.toLowerCase();
  return t.includes("dirección") || t.includes("direccion") || t.includes("¿a qué") || t.includes("a qué dirección");
}

function pareceDireccion(texto: string): boolean {
  const n = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const tieneCalle =
    /\b(av|avenida|calle|pasaje|camino|ruta|psje|pje|blvd)\b.*\d+/.test(n) ||
    /\d+\s*,?\s*(depto|dpto|of|piso|casa|local)\b/.test(n);
  const comunas = [
    "providencia", "nunoa", "santiago", "maipu", "las condes", "vitacura",
    "la florida", "macul", "san miguel", "estacion central", "cerrillos",
    "pudahuel", "quilicura", "lo barnechea", "la reina", "penalolen",
    "san joaquin", "pedro aguirre cerda", "lo espejo", "la cisterna",
    "el bosque", "san ramon", "la pintana", "puente alto", "pirque",
    "san bernardo", "buin", "paine", "colina", "lampa", "tiltil",
    "recoleta", "independencia", "conchalí", "conchali", "renca", "huechuraba"
  ];
  const tieneComuna = comunas.some((c) => n.includes(c));
  const pareceCalleNumero = /\d{2,5}/.test(n) && n.split(/\s+/).length >= 3;
  return tieneCalle || tieneComuna || pareceCalleNumero;
}

export async function generarRespuesta(mensaje: MensajeEntrante): Promise<DecisionAgente> {
  const openai = getOpenAI();
  const [contexto, configComercial] = await Promise.all([
    obtenerContextoNegocio(mensaje.texto),
    obtenerConfiguracionComercial().catch(() => null)
  ]);
  const respuestaFallback = redactarRespuestaBase(mensaje, contexto);
  const reglaCatalogoVisualActiva = configComercial?.reglas.some((r) => r.id === "catalogo-visual" && r.activa);
  const canalPermiteCatalogoVisual = mensaje.canal === "whatsapp";
  // Adjuntar catalogo solo cuando el cliente pide carta/menu/precios/promos de forma explicita.
  // Consultas de recomendacion ("recomiendame rolls en palta") deben responder con opciones concretas, sin PDF.
  const consultaCatalogo = esSolicitudCatalogoVisual(mensaje.texto);
  const catalogoVisual = canalPermiteCatalogoVisual && reglaCatalogoVisualActiva && consultaCatalogo
    ? configComercial?.imagenes.find((img) => img.prioridadEnvio) ?? null
    : null;

  let costoDespachoInyectado: string | null = null;
  if (
    process.env.GOOGLE_MAPS_API_KEY &&
    mensaje.canal === "whatsapp" &&
    ultimoMensajeAgentePidioDireccion(mensaje.historial) &&
    pareceDireccion(mensaje.texto)
  ) {
    try {
      const [restaurante, zonasConKm] = await Promise.all([
        prisma.configuracionRestaurante.findUnique({ where: { id: "restaurante" } }),
        prisma.zonaDespacho.findMany({ where: { activa: true, distanciaMinKm: { not: null }, distanciaMaxKm: { not: null } } })
      ]);
      if (restaurante?.latitud && restaurante?.longitud && zonasConKm.length > 0) {
        const resultado = await calcularCostoDespacho(
          mensaje.texto,
          restaurante.latitud,
          restaurante.longitud,
          zonasConKm as Parameters<typeof calcularCostoDespacho>[3],
          process.env.GOOGLE_MAPS_API_KEY
        );
        if (resultado) {
          costoDespachoInyectado = `INFORMACION DE DESPACHO CALCULADA: dirección recibida, distancia al local ${resultado.distanciaKm.toFixed(1)} km, tarifa "${resultado.zona.nombre}" → ${formatearPrecio(resultado.zona.costo)}, tiempo estimado ${resultado.zona.tiempoEstimadoMin}-${resultado.zona.tiempoEstimadoMax} min.`;
        } else {
          costoDespachoInyectado = "INFORMACION DE DESPACHO CALCULADA: dirección recibida pero no coincide con ningún rango de despacho configurado. Escalar a humano para confirmar si hacemos despacho a esa zona.";
        }
      }
    } catch {
      // fail silently — el bot continúa sin precio calculado
    }
  }

  function aplicarCatalogoVisual(decision: DecisionAgente): DecisionAgente {
    if (!catalogoVisual || decision.requiereHumano) return decision;
    const esPdf = catalogoVisual.url.includes("/api/catalogo/pdf") || catalogoVisual.nombre.toLowerCase().endsWith(".pdf");
    const intro = esPdf
      ? "Te adjunto el catálogo completo en PDF."
      : "Te adjunto el catálogo visual.";
    if (esSolicitudCatalogoCompleto(mensaje.texto) || esSolicitudListadoPromociones(mensaje.texto)) {
      return {
        ...decision,
        respuesta: sanitizarTono(`${intro} ¿Quieres que te ayude a elegir rolls, pokes o promociones?`, true),
        catalogoVisual: {
          nombre: catalogoVisual.nombre,
          url: catalogoVisual.url,
          tipo: catalogoVisual.tipo,
          prioridadEnvio: catalogoVisual.prioridadEnvio
        }
      };
    }

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
    const preparada = {
      ...conReglas,
      respuesta: sanitizarTono(conReglas.respuesta, Boolean(catalogoVisual))
    };
    return aplicarPoliticaCanalSocial(preparada, mensaje);
  }

  if (!openai) {
    return aplicarCatalogoVisual(prepararDecisionLocal(respuestaFallback));
  }

  try {
    // Contexto del negocio como primer mensaje de sistema
    const contextMsg = [
      `Canal activo: ${mensaje.canal}. Cliente: ${mensaje.cliente}.`,
      `Catalogo visual prioritario: ${catalogoVisual ? `disponible (${catalogoVisual.tipo}: ${catalogoVisual.nombre})` : "no disponible"}`,
      "",
      "Contexto de catalogo disponible:",
      serializarContextoNegocio(contexto),
      costoDespachoInyectado ? `\n${costoDespachoInyectado}` : ""
    ].filter(Boolean).join("\n");

    // Historial como turnos reales de conversación
    const historialMsgs: { role: "user" | "assistant"; content: string }[] = (mensaje.historial ?? [])
      .slice(-8)
      .map((h) =>
        h.rol === "cliente"
          ? { role: "user" as const, content: h.texto }
          : { role: "assistant" as const, content: h.texto }
      );

    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${contextMsg}` },
        ...historialMsgs,
        { role: "user", content: mensaje.texto }
      ]
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}") as Partial<DecisionAgente & { intencion: string }>;
    const intencion = parsed.intencion ?? "consulta";
    const agentes: Record<string, string> = {
      reclamo: "Reclamos",
      venta: "Ventas",
      consulta: "Atencion al Cliente"
    };

    const decisionBase = {
      agente: agentes[intencion] ?? "Atencion al Cliente",
      intencion,
      requiereHumano: Boolean(parsed.requiereHumano),
      respuesta: sanitizarTono(parsed.respuesta ?? respuestaFallback.respuesta, Boolean(catalogoVisual)),
      decisionSeguridad: parsed.decisionSeguridad ?? (parsed.requiereHumano ? "escalar_a_humano" : "aprobado")
    };

    // Con historial el modelo ya tiene contexto conversacional —
    // solo aplicar reglas de seguridad (alergia), no las de plantilla
    const tieneHistorial = (mensaje.historial?.length ?? 0) > 0;
    const decisionModelo = tieneHistorial
      ? aplicarSoloReglasSeguridad(decisionBase, mensaje)
      : aplicarReglasNegocioLocales(decisionBase, mensaje);

    return aplicarPoliticaCanalSocial(aplicarCatalogoVisual(decisionModelo), mensaje);
  } catch (err) {
    // OpenAI falló — usar respuesta basada en reglas + catálogo
    if (process.env.NODE_ENV === "development") {
      console.warn("[agente] OpenAI no disponible:", err instanceof Error ? err.message.substring(0, 60) : "error");
    }
    return aplicarCatalogoVisual(prepararDecisionLocal(respuestaFallback));
  }
}
