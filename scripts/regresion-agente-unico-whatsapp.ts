import { procesarWhatsAppAgenteUnico } from '../lib/whatsapp/agente-unico-atencion';
import type { ItemCarritoWA, MensajeDespacho, SesionPedidoCtx } from '../lib/modulos/types';
import { detectarItemPedidoDeterministico, detectarModificacion } from '../lib/modulos/intenciones-pedido';

function sesionBase(items: ItemCarritoWA[] = []): SesionPedidoCtx {
  return {
    id: 'test-session',
    conversacionId: 'test-conversation',
    moduloActual: items.length ? 'PEDIDOS' : 'BIENVENIDA',
    estadoSesion: 'activa',
    items,
    intentosConfirmacion: 0,
    ultimaActividadEn: new Date(),
    estadoConversacional: items.length ? { fase: 'pedido' } : {},
  };
}

function itemPromo30(): ItemCarritoWA {
  return {
    id: 'item-1',
    productId: '00000000-0000-0000-0000-000000000001',
    productName: '30 Piezas Fritas',
    categoryName: 'Promociones',
    quantity: 1,
    unitPrice: 10990,
    notes: '',
    modifiers: [],
  };
}

function msg(texto: string, historial?: MensajeDespacho['historial']): MensajeDespacho {
  return {
    canal: 'whatsapp',
    texto,
    conversacionId: 'test-conversation',
    localId: 'test-local',
    cliente: 'Pablo',
    telefonoCliente: '56900000000',
    historial,
  };
}

async function run() {
  const parserCasos = [
    {
      nombre: 'parser promo con falta grotesca',
      ok: () => detectarItemPedidoDeterministico(msg('qro la prmo d 30 frtaz xfa'))?.nombre === '30 piezas fritas',
    },
    {
      nombre: 'parser promo mixta abreviada',
      ok: () => detectarItemPedidoDeterministico(msg('me dai la promo30 mxtas'))?.nombre === '30 piezas mixtas',
    },
    {
      nombre: 'parser poke salmon typo',
      ok: () => detectarItemPedidoDeterministico(msg('kiero dos pke salmn sin cebollin'))?.nombre === 'poke de salmón',
    },
    {
      nombre: 'parser cambio kani cam x pollo',
      ok: () => (detectarModificacion('kani y cmrn x poyo')?.recargo ?? 0) === 2000,
    },
    {
      nombre: 'parser todos pollo chileno',
      ok: () => detectarModificacion('toos pollo')?.recargo === 2000,
    },
  ];

  for (const caso of parserCasos) {
    if (!caso.ok()) {
      console.error(`[FAIL] ${caso.nombre}`);
      process.exitCode = 1;
      return;
    }
    console.log(`[OK] ${caso.nombre}`);
  }

  const casos = [
    {
      nombre: 'menu envia media',
      mensaje: msg('Me puede enviar el menú'),
      sesion: null,
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => Boolean(r.mediaAEnviar?.length),
    },
    {
      nombre: 'cierre con carrito muestra resumen',
      mensaje: msg('eso nomas'),
      sesion: sesionBase([itemPromo30()]),
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => r.moduloSiguiente === 'CONFIRMACION',
    },
    {
      nombre: 'confirmacion pide entrega',
      mensaje: msg('Sí, por favor'),
      sesion: {
        ...sesionBase([itemPromo30()]),
        moduloActual: 'CONFIRMACION' as const,
        estadoConversacional: { fase: 'confirmacion_carrito' as const },
      },
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => r.moduloSiguiente === 'TIPO_ENTREGA',
    },
    {
      nombre: 'retiro pide pago y nombre',
      mensaje: msg('Retiro'),
      sesion: {
        ...sesionBase([itemPromo30()]),
        estadoConversacional: { fase: 'entrega' as const },
      },
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => r.moduloSiguiente === 'FORMAS_PAGO',
    },
    {
      nombre: 'modificacion doble aplica a item activo',
      mensaje: msg('El kanikama y el camarón por pollo'),
      sesion: sesionBase([itemPromo30()]),
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) =>
        JSON.stringify(r.actualizarSesion?.items ?? '').includes('2.000'),
    },
    {
      nombre: 'reclamo escala humano',
      mensaje: msg('Pésima atención'),
      sesion: sesionBase([itemPromo30()]),
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => r.requiereHumano === true,
    },
    {
      nombre: 'alergia escala humano',
      mensaje: msg('Tengo alergia al camarón'),
      sesion: null,
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => r.requiereHumano === true,
    },
    {
      nombre: 'pedido grande escala humano',
      mensaje: msg('Necesito sushi para 10 personas'),
      sesion: null,
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => r.requiereHumano === true,
    },
    {
      nombre: 'retiro sin carrito responde consulta',
      mensaje: msg('Puedo retirar en local?'),
      sesion: null,
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => /retirar|retiro/i.test(r.respuesta),
    },
    {
      nombre: 'envoltura salmon rechaza',
      mensaje: msg('Lo quiero envuelto en salmón'),
      sesion: null,
      assert: (r: Awaited<ReturnType<typeof procesarWhatsAppAgenteUnico>>) => /no trabajamos envuelto en salm/i.test(r.respuesta),
    },
  ];

  for (const caso of casos) {
    const respuesta = await procesarWhatsAppAgenteUnico(caso.mensaje, caso.sesion);
    if (!caso.assert(respuesta)) {
      console.error(`[FAIL] ${caso.nombre}`, respuesta);
      process.exitCode = 1;
      return;
    }
    console.log(`[OK] ${caso.nombre}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
