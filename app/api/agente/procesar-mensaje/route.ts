import { NextResponse } from "next/server";
import { generarRespuesta, mensajeEntranteSchema } from "@/lib/agente";
import { resolverPasoConversacional } from "@/lib/whatsapp/agente-unico-atencion";
import type { MediaAEnviar, MensajeDespacho, RespuestaModulo, SesionPedidoCtx } from "@/lib/modulos/types";
import { auth } from "@/auth";

function crearSesionLaboratorio(conversacionId: string): SesionPedidoCtx {
  return {
    id: `lab-session-${conversacionId}`,
    conversacionId,
    moduloActual: "BIENVENIDA",
    estadoSesion: "activa",
    items: [],
    intentosConfirmacion: 0,
    ultimaActividadEn: new Date(),
    estadoConversacional: { fase: "inicio" }
  };
}

function aplicarActualizacionSesion(
  sesion: SesionPedidoCtx,
  respuesta: RespuestaModulo
): SesionPedidoCtx {
  if (!respuesta.actualizarSesion) return sesion;
  return {
    ...sesion,
    ...respuesta.actualizarSesion,
    moduloActual: respuesta.moduloSiguiente ?? respuesta.actualizarSesion.moduloActual ?? sesion.moduloActual,
    estadoConversacional: respuesta.actualizarSesion.estadoConversacional ?? sesion.estadoConversacional,
    ultimaActividadEn: new Date()
  };
}

function primeraMedia(media?: MediaAEnviar[]) {
  const item = media?.[0];
  if (!item) return null;
  return {
    nombre: item.nombre ?? item.caption ?? "Catálogo visual",
    url: item.url,
    tipo: item.tipo,
    prioridadEnvio: true
  };
}

async function generarRespuestaWhatsAppLaboratorio(data: {
  cliente: string;
  texto: string;
  localId?: string;
  crearOrdenReal?: boolean;
  historial?: Array<{ rol: "cliente" | "agente"; texto: string }>;
}) {
  const conversacionId = `lab-${data.cliente.toLowerCase().replace(/\s+/g, "-") || "cliente"}`;
  const localId = data.localId ?? "laboratorio";
  let sesion = crearSesionLaboratorio(conversacionId);
  const historial = data.historial ?? [];

  for (let i = 0; i < historial.length; i += 1) {
    const mensaje = historial[i];
    if (mensaje.rol !== "cliente") continue;

    const msg: MensajeDespacho = {
      texto: mensaje.texto,
      canal: "whatsapp",
      cliente: data.cliente,
      conversacionId,
      localId,
      historial: historial.slice(0, i).map((m) => ({
        rol: m.rol === "agente" ? "agente" : "cliente",
        texto: m.texto
      }))
    };
    const respuesta = await resolverPasoConversacional(msg, sesion, { historial: msg.historial, simulacion: true });
    sesion = aplicarActualizacionSesion(sesion, respuesta);
  }

  const msgActual: MensajeDespacho = {
    texto: data.texto,
    canal: "whatsapp",
    cliente: data.cliente,
    conversacionId,
    localId,
    historial
  };
  const respuesta = await resolverPasoConversacional(msgActual, sesion, {
    historial,
    simulacion: !data.crearOrdenReal
  });

  return {
    agente: respuesta.moduloEjecutado ?? "Agente Unico WhatsApp",
    intencion: respuesta.moduloSiguiente ?? respuesta.moduloEjecutado ?? "consulta",
    requiereHumano: Boolean(respuesta.requiereHumano),
    respuesta: respuesta.respuesta,
    decisionSeguridad: respuesta.requiereHumano ? "escalar_a_humano" : "aprobado",
    catalogoVisual: primeraMedia(respuesta.mediaAEnviar)
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = mensajeEntranteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Payload invalido", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const crearOrdenReal = body?.crearOrdenReal === true;
  if (crearOrdenReal && !["super_admin", "admin_local"].includes(session.user.rol)) {
    return NextResponse.json({ ok: false, error: "Permisos insuficientes" }, { status: 403 });
  }
  const localId = session.user.localId ?? parsed.data.localId;
  if (session.user.rol !== "super_admin" && !localId) {
    return NextResponse.json({ ok: false, error: "Usuario sin local asignado" }, { status: 403 });
  }

  const decision = parsed.data.canal === "whatsapp"
    ? await generarRespuestaWhatsAppLaboratorio({
        ...parsed.data,
        localId,
        crearOrdenReal
      })
    : await generarRespuesta({ ...parsed.data, localId });

  return NextResponse.json({
    ok: true,
    entrada: parsed.data,
    decision
  });
}
