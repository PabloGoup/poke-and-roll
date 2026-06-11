// ============================================================
// scripts/test-e2e.ts — Pruebas E2E del pipeline WhatsApp → Supabase
// Ejecutar: node --loader ./scripts/test-e2e-loader.mjs scripts/test-e2e.ts
// (no requiere tsx; usa el paquete typescript ya instalado)
// Pruebas: A catálogo, B fuzzy, C zonas, D crear orden, F guards, G cancelación.
// La prueba E (webhook pedido-listo) se hace con curl contra el dev server.
// ============================================================
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

// --- Carga manual de .env y .env.local (sin dotenv) ---
const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname), '..');
for (const f of ['.env', '.env.local']) {
  const p = path.join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

const resultados: string[] = [];
function reporta(linea: string) { resultados.push(linea); console.log(linea); }

async function main() {
  // Imports dinámicos DESPUÉS de cargar env (supabase client se crea al importar)
  const { obtenerCatalogoProductos, resolverItemsCarrito, crearOrdenWhatsApp, cancelarOrdenSupabase } =
    await import('../lib/supabase-pedidos');
  const { resolverCoberturaDespacho } = await import('../lib/zonas-despacho');
  const { evaluarGuards } = await import('../lib/modulos/guards');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_PEDIDOS_URL!, process.env.SUPABASE_PEDIDOS_ANON_KEY!);

  // ---------- PRUEBA A — Catálogo ----------
  let catalogo: Awaited<ReturnType<typeof obtenerCatalogoProductos>> = [];
  try {
    catalogo = await obtenerCatalogoProductos();
    if (Array.isArray(catalogo) && catalogo.length > 0) {
      reporta(`PRUEBA A ✅ — ${catalogo.length} productos. Primeros 5: ` +
        catalogo.slice(0, 5).map(p => `${p.productName} ($${p.unitPrice})`).join(' | '));
    } else {
      reporta('PRUEBA A ❌ — catálogo vacío');
    }
  } catch (e) {
    reporta(`PRUEBA A ❌ — ${(e as Error).message}`);
  }

  // ---------- PRUEBA B — Fuzzy match ----------
  let itemReal: any = null;
  if (catalogo.length > 0) {
    const nombre = catalogo[0].productName;
    const sinTildes = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const parcial = nombre.split(/\s+/).slice(0, 2).join(' ');
    const casos = [
      { nombre, esperaMatch: true, desc: 'exacto' },
      { nombre: sinTildes, esperaMatch: true, desc: 'minúsculas sin tildes' },
      { nombre: parcial, esperaMatch: true, desc: `parcial "${parcial}"` },
      { nombre: 'especial del chef xyz', esperaMatch: false, desc: 'inexistente' },
    ];
    let ok = 0; const fallos: string[] = [];
    for (const c of casos) {
      try {
        const r = await resolverItemsCarrito([{ nombre: c.nombre, cantidad: 1 }]);
        const matched = r.resueltos.length === 1;
        if (matched === c.esperaMatch) {
          ok++;
          if (matched && !itemReal) itemReal = r.resueltos[0];
          if (!matched && r.noEncontrados[0] !== c.nombre) fallos.push(`${c.desc}: no fue a noEncontrados`);
        } else fallos.push(`${c.desc} ("${c.nombre}") → resueltos=${r.resueltos.length} (esperado match=${c.esperaMatch})`);
      } catch (e) { fallos.push(`${c.desc}: ${(e as Error).message}`); }
    }
    reporta(`PRUEBA B ${fallos.length === 0 ? '✅' : '❌'} — ${ok}/${casos.length} casos. ${fallos.join('; ')}`);
  } else {
    reporta('PRUEBA B ❌ — sin catálogo (depende de A)');
  }

  // ---------- PRUEBA C — Zonas ----------
  try {
    const { data: zonas, error } = await supabase.from('delivery_zones').select('district, fee, base_minutes');
    if (error) {
      reporta(`PRUEBA C ⚠️ — no se pudo leer delivery_zones: ${error.message}`);
    } else {
      reporta(`PRUEBA C (datos) — delivery_zones: ${(zonas ?? []).map((z: any) => `${z.district} ($${z.fee})`).join(', ') || 'vacía'}`);
    }
    // resolverZonaDespacho usa Prisma + Google Maps (distancia), no delivery_zones de Supabase
    const comuna = (zonas as any[])?.[0]?.district ?? 'Providencia';
    const r1 = await resolverCoberturaDespacho(`Av. Principal 123, ${comuna}`);
    const r2 = await resolverCoberturaDespacho('Calle Falsa 123, Arica');
    const arica0k = r2.estado !== 'cubierto';
    reporta(`PRUEBA C ${arica0k ? '✅' : '❌'} — "${comuna}": estado=${r1.estado}` +
      (r1.estado === 'cubierto' ? ` costo=$${r1.zona.costo} (${r1.zona.zonaNombre})` : '') +
      ` | "Arica": estado=${r2.estado} (esperado no cubierto)`);
  } catch (e) {
    reporta(`PRUEBA C ❌ — ${(e as Error).message}`);
  }

  // ---------- PRUEBA D — Crear orden real ----------
  let orderId = ''; let orderNumber = '';
  if (itemReal) {
    try {
      const sesion: any = {
        id: 'test-e2e', conversacionId: 'test-e2e', moduloActual: 'CONFIRMACION',
        estadoSesion: 'activa', items: [itemReal], modalidad: 'retiro_local',
        metodoPago: 'efectivo', nombreCliente: 'TEST E2E', telefonoCliente: '56900000001',
        intentosConfirmacion: 0, ultimaActividadEn: new Date(),
      };
      const res = await crearOrdenWhatsApp(sesion);
      orderId = res.orderId; orderNumber = res.number;
      // Verificación vía RPC: el SELECT directo en orders/kitchen_tickets está
      // bloqueado por RLS para la anon key (por diseño).
      const { data: estado } = await supabase.rpc('get_storefront_order_status', { p_order_id: orderId });
      const ord = estado as { ok?: boolean; status?: string; type?: string } | null;
      const creadaOk = ord?.ok === true && ord.status === 'pendiente';
      reporta(`PRUEBA D ${creadaOk ? '✅' : '❌'} — orderId=${orderId} number=${res.number} total=$${res.total} ` +
        `| estado vía RPC: status=${ord?.status} type=${ord?.type} (source='whatsapp' lo fija crearOrdenWhatsApp en el payload)`);
    } catch (e) {
      reporta(`PRUEBA D ❌ — ${(e as Error).message}`);
    }
  } else {
    reporta('PRUEBA D ❌ — sin item resuelto (depende de B)');
  }

  // ---------- PRUEBA F — Guards ----------
  try {
    const base: any = {
      id: 's', conversacionId: 'c', moduloActual: 'PEDIDOS', estadoSesion: 'activa',
      items: [], intentosConfirmacion: 0, ultimaActividadEn: new Date(),
    };
    const r1 = evaluarGuards('cancelar', { ...base });
    const r2 = evaluarGuards('hola', { ...base, ultimaActividadEn: new Date(Date.now() - 15 * 60000) });
    const r3 = evaluarGuards('quiero más', { ...base });
    const ok = r1.accion === 'cancelar' && (r1 as any).motivo === 'cliente_cancela'
      && r2.accion === 'cancelar' && (r2 as any).motivo === 'timeout'
      && r3.accion === 'continuar';
    reporta(`PRUEBA F ${ok ? '✅' : '❌'} — cancelar→${JSON.stringify(r1)} timeout→${JSON.stringify(r2)} continuar→${JSON.stringify(r3)}`);
  } catch (e) {
    reporta(`PRUEBA F ❌ — ${(e as Error).message}`);
  }

  // ---------- PRUEBA G — Cancelación ----------
  if (orderId) {
    try {
      const ok = await cancelarOrdenSupabase(orderId, '56900000001', 'orden de prueba E2E');
      // Verificar estado vía RPC (SELECT directo en orders está bloqueado por RLS para anon)
      const { data: estadoRpc } = await supabase.rpc('get_storefront_order_status', { p_order_id: orderId });
      const statusFinal = (estadoRpc as { status?: string } | null)?.status;
      reporta(`PRUEBA G ${ok && statusFinal === 'cancelado' ? '✅' : '❌'} — retorno=${ok}, status final=${statusFinal}`);
    } catch (e) {
      reporta(`PRUEBA G ❌ — ${(e as Error).message}`);
    }
  } else {
    reporta('PRUEBA G ❌ — sin orden (depende de D)');
  }

  console.log('\n--- DATOS PARA PRUEBA E (webhook) ---');
  console.log(`ORDER_ID=${orderId}`);
  console.log(`ORDER_NUMBER=${orderNumber}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e); process.exit(1); });
