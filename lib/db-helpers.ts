import { Canal, DireccionMensaje, EstadoConversacion } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function upsertCliente(params: {
  canal: Canal;
  canalId: string;
  nombre?: string;
  localId?: string;
}) {
  const localConnect = params.localId ? { localId: params.localId } : {};
  const updateData = { ...localConnect, ...(params.nombre ? { nombre: params.nombre } : {}) };

  const whereField =
    params.canal === "whatsapp" ? { whatsappId: params.canalId } :
    params.canal === "instagram" ? { instagramId: params.canalId } :
    { facebookId: params.canalId };

  const createField =
    params.canal === "whatsapp" ? { whatsappId: params.canalId } :
    params.canal === "instagram" ? { instagramId: params.canalId } :
    { facebookId: params.canalId };

  const existente = await prisma.cliente.findUnique({ where: whereField });
  if (existente) {
    return prisma.cliente.update({ where: { id: existente.id }, data: updateData });
  }
  return prisma.cliente.create({ data: { ...createField, nombre: params.nombre, ...localConnect } });
}

export async function obtenerOCrearConversacion(params: {
  clienteId: string;
  canal: Canal;
  threadId?: string;
  localId?: string;
}) {
  const threadField =
    params.canal === "whatsapp" ? "whatsappThreadId" : "instagramThreadId";

  const existente = await prisma.conversacion.findFirst({
    where: {
      clienteId: params.clienteId,
      canal: params.canal,
      ...(params.localId ? { localId: params.localId } : {}),
      estado: {
        in: [
          EstadoConversacion.activa,
          EstadoConversacion.pausada,
          EstadoConversacion.esperando_humano
        ]
      }
    },
    orderBy: { actualizadoEn: "desc" }
  });

  if (existente) return existente;

  return prisma.conversacion.create({
    data: {
      clienteId: params.clienteId,
      canal: params.canal,
      estado: EstadoConversacion.activa,
      [threadField]: params.threadId,
      ...(params.localId ? { localId: params.localId } : {})
    }
  });
}

export async function guardarMensaje(params: {
  conversacionId: string;
  canal: Canal;
  direccion: DireccionMensaje;
  texto: string;
  idMensajeMeta?: string;
  idMensajeWhatsapp?: string;
  payloadMeta?: object;
}) {
  return prisma.mensaje.create({
    data: {
      conversacionId: params.conversacionId,
      canal: params.canal,
      direccion: params.direccion,
      texto: params.texto,
      idMensajeMeta: params.idMensajeMeta,
      idMensajeWhatsapp: params.idMensajeWhatsapp,
      payloadMeta: params.payloadMeta as never
    }
  });
}

export async function guardarDecision(params: {
  conversacionId: string;
  agente: string;
  intencion: string;
  entrada: string;
  salida: string;
  decisionSeguridad: string;
  requiereHumano: boolean;
}) {
  await prisma.decisionAgente.create({
    data: {
      conversacionId: params.conversacionId,
      agente: params.agente,
      intencion: params.intencion,
      entrada: params.entrada,
      salida: params.salida,
      decisionSeguridad: params.decisionSeguridad
    }
  });
  await prisma.conversacion.update({
    where: { id: params.conversacionId },
    data: {
      ultimaIntencion: params.intencion,
      requiereHumano: params.requiereHumano,
      estado: params.requiereHumano
        ? EstadoConversacion.esperando_humano
        : EstadoConversacion.activa
    }
  });
}

// ─── Resolución de nombres para clientes de Instagram/Facebook ────────────

export async function resolverNombreMetaCliente(params: {
  clienteId: string;
  userId: string;
  token: string;
  canal: "instagram" | "facebook";
}): Promise<void> {
  try {
    const version = process.env.META_GRAPH_VERSION ?? "v20.0";
    const fields = params.canal === "instagram" ? "name,username" : "name";
    const url = new URL(`https://graph.facebook.com/${version}/${params.userId}`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("access_token", params.token);
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return;
    const data = await resp.json().catch(() => null);
    const nombre = data?.username ? `@${data.username}` : data?.name ?? null;
    if (nombre) {
      await prisma.cliente.update({ where: { id: params.clienteId }, data: { nombre } });
    }
  } catch {
    // no bloquear el flujo principal si falla la resolución
  }
}

// ─── Helpers SesionPedido ──────────────────────────────────────────────────

export async function obtenerSesionPedido(conversacionId: string) {
  return prisma.sesionPedido.findUnique({
    where: { conversacionId },
    include: { logs: { orderBy: { creadoEn: 'asc' }, take: 50 } },
  });
}

export async function upsertSesionPedido(
  conversacionId: string,
  data: {
    moduloActual?: string;
    estadoSesion?: string;
    items?: object[];
    modalidad?: string;
    nombreCliente?: string;
    telefonoCliente?: string;
    direccion?: object;
    costoDespacho?: number;
    metodoPago?: string;
    externalOrderId?: string;
    externalOrderNumber?: string;
    intentosConfirmacion?: number;
    estadoConversacional?: object;
  }
) {
  const ahora = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return prisma.sesionPedido.upsert({
    where: { conversacionId },
    update: { ...d, ultimaActividadEn: ahora },
    create: { conversacionId, ...d, ultimaActividadEn: ahora },
  });
}

export async function transicionarModulo(
  conversacionId: string,
  moduloSiguiente: string,
  actualizaciones?: object
) {
  return upsertSesionPedido(conversacionId, {
    moduloActual: moduloSiguiente,
    ...actualizaciones,
  });
}

export async function guardarLogModulo(params: {
  sesionPedidoId?: string;
  modulo: string;
  mensajeEntrada: string;
  respuestaSalida: string;
  transicionHacia?: string | null;
  exito: boolean;
  errorDetalle?: string;
  duracionMs?: number;
}) {
  return prisma.logModulo.create({ data: params as never });
}

export async function cerrarSesionPedido(
  conversacionId: string,
  estado: 'completada' | 'cancelada'
) {
  return prisma.sesionPedido.update({
    where: { conversacionId },
    data: { estadoSesion: estado, moduloActual: 'DESPEDIDA' },
  });
}
