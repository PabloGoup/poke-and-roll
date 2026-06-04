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
      estado: { in: ["activa", "pausada"] }
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
