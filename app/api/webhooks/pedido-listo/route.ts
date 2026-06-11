import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enviarWhatsAppTexto } from '@/lib/meta';
import type { DireccionCliente, ItemCarritoWA, SesionPedidoCtx, WebhookPedidoListoPayload } from '@/lib/modulos/types';
import { Prisma } from '@prisma/client';

type SesionPedidoConLocal = Prisma.SesionPedidoGetPayload<{
  include: {
    conversacion: {
      include: { local: true };
    };
  };
}>;

function mapearSesionACtx(sesion: SesionPedidoConLocal): SesionPedidoCtx {
  return {
    id: sesion.id,
    conversacionId: sesion.conversacionId,
    moduloActual: 'ENTREGA',
    estadoSesion: sesion.estadoSesion as SesionPedidoCtx['estadoSesion'],
    items: Array.isArray(sesion.items) ? (sesion.items as unknown as ItemCarritoWA[]) : [],
    modalidad: sesion.modalidad as SesionPedidoCtx['modalidad'],
    nombreCliente: sesion.nombreCliente ?? undefined,
    telefonoCliente: sesion.telefonoCliente ?? undefined,
    direccion: sesion.direccion ? (sesion.direccion as unknown as DireccionCliente) : undefined,
    costoDespacho: sesion.costoDespacho ?? undefined,
    metodoPago: sesion.metodoPago as SesionPedidoCtx['metodoPago'],
    externalOrderId: sesion.externalOrderId ?? undefined,
    externalOrderNumber: sesion.externalOrderNumber ?? undefined,
    intentosConfirmacion: sesion.intentosConfirmacion ?? 0,
    ultimaActividadEn: sesion.ultimaActividadEn,
  };
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.SUPABASE_PEDIDOS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Partial<WebhookPedidoListoPayload>;
  try {
    body = await req.json() as Partial<WebhookPedidoListoPayload>;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { record, old_record } = body ?? {};

  // Solo procesar transiciones a 'listo'
  if (record?.status !== 'listo' || old_record?.status === 'listo') {
    return Response.json({ ok: true, skipped: 'not-listo-transition' });
  }

  // Solo pedidos de WhatsApp
  if (record?.source !== 'whatsapp') {
    return Response.json({ ok: true, skipped: 'not-whatsapp' });
  }

  const telefono: string | null = record?.customer_phone_snapshot ?? null;
  if (!telefono) {
    return Response.json({ ok: true, skipped: 'no-phone' });
  }

  // Verificar si ya se envió la notificación para esta orden (idempotencia)
  const logPrevio = await prisma.logModulo.findFirst({
    where: {
      modulo: 'ENTREGA',
      exito: true,
      sesionPedido: {
        externalOrderId: record.id,
      },
    },
  });

  if (logPrevio) {
    return Response.json({ ok: true, skipped: 'already-notified' });
  }

  // Buscar sesión para obtener token del local e incluir conversacion
  const sesion = await prisma.sesionPedido.findFirst({
    where: {
      externalOrderId: record.id,
      estadoSesion: { not: 'completada' },
    },
    include: {
      conversacion: {
        include: { local: true },
      },
    },
  });

  const local = sesion?.conversacion?.local;
  const numero: string = record?.number ?? 'tu pedido';
  const tipo: string = record?.type ?? 'retiro_local';

  const mensaje = tipo === 'despacho'
    ? `Tu pedido ${numero} ya está listo. Lo estamos coordinando para despacho y te avisaremos si necesitamos confirmar algún dato.`
    : `Tu pedido ${numero} está listo. Puedes pasar a retirarlo cuando quieras.`;

  // Enviar WhatsApp con manejo graceful de sesión 24h expirada (error 131047)
  try {
    const resultado = await enviarWhatsAppTexto({
      telefono,
      texto: mensaje,
      waToken: local?.waToken ?? undefined,
      waPhoneId: local?.waPhoneId ?? undefined,
    });

    // Si retorna sin ok, loggear pero no fallar el webhook
    if (!resultado?.ok) {
      console.warn(`[PedidoListo] WhatsApp no enviado para orden ${record.number}. Posible sesión 24h expirada.`);
    }
  } catch (err) {
    // Error de red — no propagar, solo loggear
    console.error('[PedidoListo] Error enviando WhatsApp:', err instanceof Error ? err.message : err);
  }

  // Activar M12_ENTREGA via dispatcher para registrar log
  if (sesion) {
    try {
      const { despacharModulo } = await import('@/lib/modulos/dispatcher');

      await despacharModulo(
        {
          canal: 'whatsapp',
          texto: '__sistema_pedido_listo__',
          conversacionId: sesion.conversacionId,
          localId: sesion.conversacion.localId ?? '',
          telefonoCliente: telefono,
        },
        mapearSesionACtx(sesion)
      );
    } catch (err) {
      // No fallar el webhook por error del dispatcher
      console.error('[PedidoListo] Error activando M12:', err);
    }
  }

  return Response.json({ ok: true });
}
