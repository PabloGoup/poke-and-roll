"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BadgePercent,
  CalendarDays,
  Camera,
  ChefHat,
  FileText,
  ImagePlus,
  MapPin,
  MessageSquareText,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Utensils
} from "lucide-react";

type AccionComercial = {
  id: string;
  titulo: string;
  descripcion: string;
  activa: boolean;
  prioridad: "alta" | "media" | "baja";
  canal: "todos" | "whatsapp" | "instagram" | "facebook";
  icono: React.ElementType;
};

type ItemEditable = {
  id: string;
  tipo: "menu" | "promocion";
  nombre: string;
  detalle: string;
  precio: string;
  activo: boolean;
};

type ImagenCatalogo = {
  id: string;
  nombre: string;
  url: string;
  storagePath?: string | null;
  tipo: "catalogo" | "promocion" | "roll_dia" | "menu_dia";
  prioridadEnvio: boolean;
  activo: boolean;
};

type TarifaEditable = {
  id: string;
  nombre: string;
  distanciaMinKm: number;
  distanciaMaxKm: number;
  costoPesos: number;
  tiempoMinMin: number;
  tiempoMaxMin: number;
  activa: boolean;
};

type ConfigRestaurante = {
  direccion: string;
  latitud: number | null;
  longitud: number | null;
};

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function formatKm(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

function nombreTarifaDesdeRango(minKm: number, maxKm: number) {
  if (minKm <= 0) return `Hasta ${formatKm(maxKm)} km`;
  return `${formatKm(minKm)} a ${formatKm(maxKm)} km`;
}

const accionesIniciales: AccionComercial[] = [
  {
    id: "catalogo-visual",
    titulo: "Enviar catalogo visual primero",
    descripcion: "Cuando el cliente pregunte por menu, promociones o precios, responder primero con imagen/catalogo y luego texto breve.",
    activa: true,
    prioridad: "alta",
    canal: "todos",
    icono: ImagePlus
  },
  {
    id: "promocion-dia",
    titulo: "Promocion del dia",
    descripcion: "Destacar una promo vigente antes de listar alternativas del catalogo.",
    activa: true,
    prioridad: "alta",
    canal: "todos",
    icono: BadgePercent
  },
  {
    id: "roll-dia",
    titulo: "Roll del dia",
    descripcion: "Recomendar un roll hero para cerrar venta cuando el cliente pide sugerencias.",
    activa: true,
    prioridad: "media",
    canal: "whatsapp",
    icono: Star
  },
  {
    id: "combo-personas",
    titulo: "Combos por cantidad de personas",
    descripcion: "Si el cliente menciona 2, 3, 4 o mas personas, priorizar productos compartibles y promos reales.",
    activa: true,
    prioridad: "alta",
    canal: "todos",
    icono: Utensils
  },
  {
    id: "upsell-extras",
    titulo: "Sugerir extras",
    descripcion: "Ofrecer bebidas, gyosas, hand rolls o agregados cuando el pedido este casi listo.",
    activa: true,
    prioridad: "media",
    canal: "todos",
    icono: Plus
  },
  {
    id: "menu-dia",
    titulo: "Menu del dia",
    descripcion: "Usar una seleccion diaria para respuestas rapidas y contenido de redes.",
    activa: false,
    prioridad: "media",
    canal: "instagram",
    icono: CalendarDays
  },
  {
    id: "sin-palta-alergenos",
    titulo: "Alergias y sin palta",
    descripcion: "Cuando exista alergia o restriccion, recomendar solo productos compatibles y pedir confirmacion.",
    activa: true,
    prioridad: "alta",
    canal: "todos",
    icono: ChefHat
  },
  {
    id: "respuesta-breve",
    titulo: "Respuesta breve vendedora",
    descripcion: "Mantener maximo 3 oraciones, con precio real y pregunta de cierre.",
    activa: true,
    prioridad: "media",
    canal: "todos",
    icono: MessageSquareText
  }
];

const itemsIniciales: ItemEditable[] = [
  { id: "1", tipo: "promocion", nombre: "Promo almuerzo", detalle: "10% de descuento entre 15:00 y 16:00", precio: "10%", activo: true },
  { id: "2", tipo: "menu", nombre: "Sushi Burger Pollo", detalle: "Pollo apanado, palta, queso crema y cebollin", precio: "$6.490", activo: true },
  { id: "3", tipo: "menu", nombre: "2 Pokes a Eleccion", detalle: "Promo de 2 pokes a eleccion", precio: "$12.990", activo: true }
];

function esPdf(url: string, nombre?: string) {
  return url.toLowerCase().includes(".pdf") || url.includes("/api/catalogo/pdf") || nombre?.toLowerCase().endsWith(".pdf");
}

export function CommercialConfig() {
  const [acciones, setAcciones] = useState(accionesIniciales);
  const [items, setItems] = useState(itemsIniciales);
  const [imagenes, setImagenes] = useState<ImagenCatalogo[]>([]);
  const [nuevoItem, setNuevoItem] = useState<Partial<ItemEditable>>({ tipo: "promocion", activo: true });
  const [tarifas, setTarifas] = useState<TarifaEditable[]>([]);
  const [restaurante, setRestaurante] = useState<ConfigRestaurante>({ direccion: "", latitud: null, longitud: null });
  const [nuevaTarifa, setNuevaTarifa] = useState<Partial<TarifaEditable>>({ activa: true, distanciaMinKm: 0 });
  const [savingTarifas, setSavingTarifas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tipoCargaVisual, setTipoCargaVisual] = useState<ImagenCatalogo["tipo"]>("catalogo");
  const [status, setStatus] = useState<string | null>(null);

  const accionesActivas = useMemo(() => acciones.filter((a) => a.activa).length, [acciones]);
  const itemsActivos = useMemo(() => items.filter((item) => item.activo).length, [items]);
  const tarifasActivasLista = useMemo(() => tarifas.filter((tarifa) => tarifa.activa), [tarifas]);
  const tarifasActivas = tarifasActivasLista.length;
  const tarifasOrdenadas = useMemo(
    () => [...tarifas].sort((a, b) => a.distanciaMinKm - b.distanciaMinKm || a.distanciaMaxKm - b.distanciaMaxKm),
    [tarifas]
  );
  const coberturaMaximaKm = tarifasActivasLista.length > 0
    ? Math.max(...tarifasActivasLista.map((tarifa) => tarifa.distanciaMaxKm))
    : null;
  const costoBaseDespacho = tarifasActivasLista.length > 0
    ? Math.min(...tarifasActivasLista.map((tarifa) => tarifa.costoPesos))
    : null;
  const direccionConfigurada = restaurante.direccion.trim().length > 0;
  const direccionGeocodificada = restaurante.latitud != null && restaurante.longitud != null;
  const previewNuevaTarifa = useMemo(() => {
    const minKm = nuevaTarifa.distanciaMinKm ?? 0;
    const maxKm = nuevaTarifa.distanciaMaxKm;
    const costo = nuevaTarifa.costoPesos;
    if (!Number.isFinite(minKm) || maxKm == null || !Number.isFinite(maxKm) || costo == null || !Number.isFinite(costo) || maxKm <= minKm) return null;
    return {
      rango: `${formatKm(minKm)}-${formatKm(maxKm)} km`,
      costo: formatCLP(costo),
      tiempo: `${nuevaTarifa.tiempoMinMin ?? 30}-${nuevaTarifa.tiempoMaxMin ?? 45} min`
    };
  }, [nuevaTarifa]);
  const imagenPrioritaria = imagenes.find((img) => img.prioridadEnvio);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  async function cargarConfiguracion() {
    setLoading(true);
    try {
      const [resConfig, resTarifas] = await Promise.all([
        fetch("/api/configuracion-comercial", { cache: "no-store" }),
        fetch("/api/configuracion-comercial/tarifas", { cache: "no-store" })
      ]);
      const [data, dataTarifas] = await Promise.all([resConfig.json(), resTarifas.json()]);
      if (!data.ok) return;

      setAcciones(data.config.reglas.map((regla: AccionComercial) => ({
        ...regla,
        icono: accionesIniciales.find((a) => a.id === regla.id)?.icono ?? Sparkles
      })));
      setItems(data.config.items.map((item: { id: string; tipo: ItemEditable["tipo"]; nombre: string; detalle: string; precioTexto?: string | null; activo: boolean }) => ({
        id: item.id,
        tipo: item.tipo,
        nombre: item.nombre,
        detalle: item.detalle,
        precio: item.precioTexto ?? "",
        activo: item.activo
      })));
      setImagenes(data.config.imagenes.map((img: ImagenCatalogo) => ({
        ...img,
        activo: img.activo ?? true
      })));
      if (dataTarifas.ok) {
        setTarifas(dataTarifas.tarifas ?? []);
        if (dataTarifas.restaurante) {
          setRestaurante({
            direccion: dataTarifas.restaurante.direccion ?? "",
            latitud: dataTarifas.restaurante.latitud ?? null,
            longitud: dataTarifas.restaurante.longitud ?? null
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function agregarTarifa() {
    const distanciaMinKm = nuevaTarifa.distanciaMinKm ?? 0;
    const distanciaMaxKm = nuevaTarifa.distanciaMaxKm;
    const costoPesos = nuevaTarifa.costoPesos;
    const tiempoMinMin = nuevaTarifa.tiempoMinMin ?? 30;
    const tiempoMaxMin = nuevaTarifa.tiempoMaxMin ?? 45;

    if (!Number.isFinite(distanciaMinKm) || distanciaMaxKm == null || !Number.isFinite(distanciaMaxKm) || distanciaMaxKm <= distanciaMinKm) {
      setStatus("Define un rango valido: el maximo debe ser mayor que el minimo.");
      return;
    }
    if (costoPesos == null || !Number.isFinite(costoPesos) || costoPesos < 0) {
      setStatus("Define el costo de despacho para esta zona.");
      return;
    }
    if (!Number.isFinite(tiempoMinMin) || !Number.isFinite(tiempoMaxMin) || tiempoMaxMin < tiempoMinMin) {
      setStatus("El tiempo maximo debe ser mayor o igual al tiempo minimo.");
      return;
    }

    const nombre = nuevaTarifa.nombre?.trim() || nombreTarifaDesdeRango(distanciaMinKm, distanciaMaxKm);
    setTarifas((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        nombre,
        distanciaMinKm,
        distanciaMaxKm,
        costoPesos,
        tiempoMinMin,
        tiempoMaxMin,
        activa: nuevaTarifa.activa ?? true
      }
    ]);
    setNuevaTarifa({ activa: true, distanciaMinKm: distanciaMaxKm, tiempoMinMin, tiempoMaxMin });
    setStatus(`Tarifa "${nombre}" agregada. Guarda las tarifas para aplicarla al agente.`);
  }

  function toggleTarifa(id: string) {
    setTarifas((prev) => prev.map((t) => t.id === id ? { ...t, activa: !t.activa } : t));
  }

  function eliminarTarifa(id: string) {
    setTarifas((prev) => prev.filter((t) => t.id !== id));
  }

  async function guardarTarifas() {
    setSavingTarifas(true);
    try {
      const res = await fetch("/api/configuracion-comercial/tarifas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tarifas, restaurante })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Error guardando tarifas");
      if (data.restaurante?.latitud) {
        setRestaurante((prev) => ({ ...prev, latitud: data.restaurante.latitud, longitud: data.restaurante.longitud }));
        setStatus("Tarifas guardadas y dirección geocodificada.");
      } else {
        setStatus("Tarifas guardadas.");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error guardando tarifas");
    } finally {
      setSavingTarifas(false);
    }
  }

  function toggleAccion(id: string) {
    setAcciones((prev) => prev.map((a) => a.id === id ? { ...a, activa: !a.activa } : a));
  }

  function guardarItem() {
    const nombre = nuevoItem.nombre?.trim();
    if (!nombre) return;
    setItems((prev) => [
      {
        id: Date.now().toString(),
        tipo: nuevoItem.tipo ?? "promocion",
        nombre,
        detalle: nuevoItem.detalle ?? "",
        precio: nuevoItem.precio ?? "",
        activo: nuevoItem.activo ?? true
      },
      ...prev
    ]);
    setNuevoItem({ tipo: "promocion", activo: true });
  }

  async function comprimirImagen(file: File, maxPx = 1400, quality = 0.88): Promise<File> {
    if (file.type === "application/pdf") return file;
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) { height = Math.round((height * maxPx) / width); width = maxPx; }
          else { width = Math.round((width * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file), "image/jpeg", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  async function cargarImagenes(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    event.target.value = "";
    setUploading(true);
    setStatus("Subiendo imagenes...");

    try {
      const nuevas: ImagenCatalogo[] = [];
      for (const [index, file] of files.entries()) {
        const esPrioritaria = imagenes.length === 0 && index === 0;

        const fileComprimido = await comprimirImagen(file);

        const body = new FormData();
        body.append("file", fileComprimido, file.name);
        body.append("tipo", tipoCargaVisual);
        body.append("prioridadEnvio", String(esPrioritaria));

        const res = await fetch("/api/configuracion-comercial/imagenes", { method: "POST", body });
        const data = await res.json();
        if (data.ok) {
          nuevas.push(data.imagen);
        } else {
          throw new Error(data.detail || data.error || "No se pudo subir el archivo");
        }
      }

      setImagenes((prev) => [...nuevas, ...prev.map((img) => nuevas.some((n) => n.prioridadEnvio) ? { ...img, prioridadEnvio: false } : img)]);
      setStatus(nuevas.length > 0 ? "Imagenes subidas y guardadas. Recuerda guardar configuracion si cambias prioridades o tipos." : "No se pudo subir ninguna imagen");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error subiendo archivos");
    } finally {
      setUploading(false);
    }
  }

  function marcarPrioritaria(id: string) {
    setImagenes((prev) => prev.map((img) => ({ ...img, prioridadEnvio: img.id === id })));
  }

  async function guardarConfiguracion() {
    setSaving(true);
    setStatus("Guardando configuracion...");
    try {
      const [res, resTarifas] = await Promise.all([
        fetch("/api/configuracion-comercial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reglas: acciones.map((accion) => ({
            id: accion.id,
            titulo: accion.titulo,
            descripcion: accion.descripcion,
            activa: accion.activa,
            prioridad: accion.prioridad,
            canal: accion.canal
          })),
          items: items.map((item) => ({
            id: item.id,
            tipo: item.tipo,
            nombre: item.nombre,
            detalle: item.detalle,
            precioTexto: item.precio,
            activo: item.activo
          })),
          imagenes
        })
        }),
        fetch("/api/configuracion-comercial/tarifas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tarifas, restaurante })
        })
      ]);
      const data = await res.json();
      const dataTarifas = await resTarifas.json();
      if (!data.ok) throw new Error(data.error ?? "No se pudo guardar");
      if (!dataTarifas.ok) throw new Error(dataTarifas.error ?? "No se pudieron guardar las tarifas");
      setStatus("Configuracion guardada");
      await cargarConfiguracion();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error guardando configuracion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel commercial-config" id="config-comercial">
      <div className="panel-title">
        <div>
          <span>Configuracion comercial</span>
          <h2>Menu, promociones y catalogo visual</h2>
        </div>
        <div className="commercial-status">
          <Sparkles size={14} />
          {loading ? "Cargando..." : `${accionesActivas}/${acciones.length} acciones activas`}
        </div>
      </div>

      <div className="commercial-summary">
        <article>
          <Sparkles size={16} />
          <div>
            <strong>{accionesActivas}/{acciones.length}</strong>
            <span>reglas activas</span>
          </div>
        </article>
        <article>
          <BadgePercent size={16} />
          <div>
            <strong>{itemsActivos}</strong>
            <span>destacados activos</span>
          </div>
        </article>
        <article>
          <ImagePlus size={16} />
          <div>
            <strong>{imagenes.length}</strong>
            <span>{imagenPrioritaria ? "catalogo priorizado" : "archivos visuales"}</span>
          </div>
        </article>
        <article>
          <Truck size={16} />
          <div>
            <strong>{tarifasActivas}</strong>
            <span>tarifas activas</span>
          </div>
        </article>
      </div>

      <div className="commercial-grid">
        <div className="commercial-block">
          <div className="commercial-block-head">
            <div>
              <span>Acciones del agente</span>
              <h3>Prioridades de respuesta</h3>
            </div>
          </div>
          <div className="action-grid">
            {acciones.map((accion) => {
              const Icono = accion.icono;
              return (
                <button
                  className={`action-card${accion.activa ? " active" : ""}`}
                  key={accion.id}
                  onClick={() => toggleAccion(accion.id)}
                  type="button"
                >
                  <div className="action-icon"><Icono size={16} /></div>
                  <div>
                    <strong>{accion.titulo}</strong>
                    <p>{accion.descripcion}</p>
                    <span>{accion.prioridad} · {accion.canal}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="commercial-block">
          <div className="commercial-block-head">
            <div>
              <span>Catalogo visual</span>
              <h3>Archivos que el agente envia por WhatsApp</h3>
              <p>Clasifica cada archivo para que el bot adjunte lo correcto cuando pidan carta, promociones, rolls, hand rolls, pokes o gohan.</p>
            </div>
            <div className="visual-upload-controls">
              <select
                aria-label="Tipo de archivos a subir"
                value={tipoCargaVisual}
                onChange={(e) => setTipoCargaVisual(e.target.value as ImagenCatalogo["tipo"])}
              >
                <option value="catalogo">Carta completa</option>
                <option value="promocion">Promociones</option>
                <option value="menu_dia">Pokes / gohan</option>
                <option value="roll_dia">Rolls / destacados</option>
              </select>
              <label className="upload-button">
                <Camera size={14} />
                {uploading ? "Subiendo..." : "Subir archivos"}
                <input accept="image/*,application/pdf,.pdf" multiple onChange={cargarImagenes} type="file" />
              </label>
            </div>
          </div>

          {imagenes.length === 0 ? (
            <div className="visual-empty">
              <ImagePlus size={26} />
              <strong>Aun no hay catalogo visual cargado</strong>
              <p>Sube PDF o imagenes para carta completa, promociones, rolls y pokes/gohan. El agente elegira el archivo por la intención del cliente.</p>
              <label className="visual-upload-cta">
                <Camera size={15} />
                {uploading ? "Subiendo imagenes..." : "Subir catalogo visual"}
                <input accept="image/*,application/pdf,.pdf" multiple onChange={cargarImagenes} type="file" />
              </label>
            </div>
          ) : (
            <div className="visual-grid">
              {imagenes.map((img) => (
                <article className={`visual-card${img.prioridadEnvio ? " primary" : ""}`} key={img.id}>
                  {esPdf(img.url, img.nombre) ? (
                    <a className="visual-file-preview" href={img.url} rel="noreferrer" target="_blank">
                      <FileText size={34} />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <Image alt={img.nombre} height={180} src={img.url} unoptimized width={240} />
                  )}
                  <div>
                    <strong>{img.prioridadEnvio ? "Primera opcion" : img.nombre}</strong>
                    <select
                      aria-label={`Tipo de archivo ${img.nombre}`}
                      value={img.tipo}
                      onChange={(e) => setImagenes((prev) => prev.map((item) => item.id === img.id ? { ...item, tipo: e.target.value as ImagenCatalogo["tipo"] } : item))}
                    >
                      <option value="catalogo">Carta completa</option>
                      <option value="promocion">Promociones</option>
                      <option value="roll_dia">Rolls / destacados</option>
                      <option value="menu_dia">Pokes / gohan</option>
                    </select>
                    <div className="visual-actions">
                      <button onClick={() => marcarPrioritaria(img.id)} type="button">Enviar primero</button>
                      <button onClick={() => setImagenes((prev) => prev.filter((item) => item.id !== img.id))} type="button"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {imagenPrioritaria && (
            <div className="catalog-priority">
              <ImagePlus size={14} />
              El agente debe ofrecer primero: <strong>{imagenPrioritaria.tipo.replace("_", " ")}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="commercial-block">
        <div className="commercial-block-head">
          <div>
            <span>Edicion rapida</span>
            <h3>Menu y promociones destacadas</h3>
            <p>Agrega solo productos o promociones que el agente pueda recomendar con seguridad.</p>
          </div>
          <button className="ghost-button" disabled={saving} onClick={guardarConfiguracion} type="button">
            <Save size={14} /> {saving ? "Guardando..." : "Guardar configuracion"}
          </button>
        </div>

        <div className="quick-edit-form quick-edit-form-menu">
          <label className="config-field">
            <span>Tipo</span>
            <select value={nuevoItem.tipo} onChange={(e) => setNuevoItem((prev) => ({ ...prev, tipo: e.target.value as ItemEditable["tipo"] }))}>
              <option value="promocion">Promocion</option>
              <option value="menu">Menu</option>
            </select>
          </label>
          <label className="config-field">
            <span>Nombre</span>
            <input placeholder="Ej: 30 piezas mixtas" value={nuevoItem.nombre ?? ""} onChange={(e) => setNuevoItem((prev) => ({ ...prev, nombre: e.target.value }))} />
          </label>
          <label className="config-field">
            <span>Precio</span>
            <input placeholder="$12.500 o 10%" value={nuevoItem.precio ?? ""} onChange={(e) => setNuevoItem((prev) => ({ ...prev, precio: e.target.value }))} />
          </label>
          <label className="config-field config-field-wide">
            <span>Detalle para la IA</span>
            <input placeholder="Ingredientes, condiciones o criterio para recomendarlo" value={nuevoItem.detalle ?? ""} onChange={(e) => setNuevoItem((prev) => ({ ...prev, detalle: e.target.value }))} />
          </label>
          <button className="primary-button" onClick={guardarItem} type="button">
            <Plus size={14} /> Agregar
          </button>
        </div>

        <div className="quick-edit-list">
          {items.map((item) => (
            <article className="quick-edit-item" key={item.id}>
              <div>
                <span>{item.tipo}</span>
                <strong>{item.nombre}</strong>
                <p>{item.detalle}</p>
              </div>
              <strong className="quick-price">{item.precio}</strong>
              <label className="mini-toggle">
                <input
                  checked={item.activo}
                  onChange={() => setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, activo: !i.activo } : i))}
                  type="checkbox"
                />
                Activo
              </label>
            </article>
          ))}
        </div>
      </div>

      <div className="commercial-block">
        <div className="commercial-block-head">
          <div>
            <span>Despacho a domicilio</span>
            <h3>Tarifas por distancia</h3>
            <p>Define zonas simples para que el agente informe costos sin inventar valores.</p>
          </div>
          <button className="ghost-button" disabled={savingTarifas} onClick={guardarTarifas} type="button">
            <Save size={14} /> {savingTarifas ? "Guardando..." : "Guardar tarifas"}
          </button>
        </div>

        <div className="delivery-kpi-row">
          <article className={`delivery-kpi ${direccionConfigurada ? "ready" : ""}`}>
            <MapPin size={16} />
            <div>
              <span>Direccion base</span>
              <strong>{direccionConfigurada ? "Configurada" : "Pendiente"}</strong>
            </div>
          </article>
          <article className={`delivery-kpi ${tarifasActivas > 0 ? "ready" : ""}`}>
            <Truck size={16} />
            <div>
              <span>Cobertura activa</span>
              <strong>{coberturaMaximaKm == null ? "Sin rangos" : `Hasta ${formatKm(coberturaMaximaKm)} km`}</strong>
            </div>
          </article>
          <article className="delivery-kpi">
            <BadgePercent size={16} />
            <div>
              <span>Costo desde</span>
              <strong>{costoBaseDespacho == null ? "No definido" : formatCLP(costoBaseDespacho)}</strong>
            </div>
          </article>
        </div>

        <div className="delivery-address-row">
          <div className="delivery-step-marker">1</div>
          <div className="delivery-address-copy">
            <strong>Direccion base del local</strong>
            <p>El agente calcula la distancia desde esta direccion. Guarda para geocodificarla.</p>
          </div>
          <label className="config-field delivery-address-field">
            <span>Direccion completa</span>
            <input
              placeholder="Ej: Recoleta 5758, Huechuraba"
              value={restaurante.direccion}
              onChange={(e) => setRestaurante((prev) => ({ ...prev, direccion: e.target.value }))}
            />
          </label>
          <span className={`geo-pill ${direccionGeocodificada ? "is-ready" : ""}`}>
            {direccionGeocodificada
              ? `Geocodificada · ${restaurante.latitud?.toFixed(4)}, ${restaurante.longitud?.toFixed(4)}`
              : "Pendiente de guardar"}
          </span>
        </div>

        <div className="delivery-section-title">
          <div className="delivery-step-marker">2</div>
          <div>
            <strong>Rangos de despacho</strong>
            <p>Crea rangos sin solaparlos. Si una direccion queda fuera de estos km, el agente debe escalar a humano.</p>
          </div>
        </div>

        <div className="quick-edit-form tariff-form tariff-builder">
          <label className="config-field tariff-name">
            <span>Nombre visible</span>
            <input
              placeholder="Ej: Local / Zona cercana"
              value={nuevaTarifa.nombre ?? ""}
              onChange={(e) => setNuevaTarifa((prev) => ({ ...prev, nombre: e.target.value }))}
            />
          </label>
          <label className="config-field">
            <span>Desde km</span>
            <input
              type="number" placeholder="0" min={0} step={0.5}
              value={nuevaTarifa.distanciaMinKm ?? ""}
              onChange={(e) => setNuevaTarifa((prev) => ({ ...prev, distanciaMinKm: e.target.value === "" ? undefined : parseFloat(e.target.value) }))}
            />
          </label>
          <label className="config-field">
            <span>Hasta km</span>
            <input
              type="number" placeholder="3" min={0} step={0.5}
              value={nuevaTarifa.distanciaMaxKm ?? ""}
              onChange={(e) => setNuevaTarifa((prev) => ({ ...prev, distanciaMaxKm: e.target.value === "" ? undefined : parseFloat(e.target.value) }))}
            />
          </label>
          <label className="config-field">
            <span>Costo $</span>
            <input
              type="number" placeholder="2500" min={0} step={100}
              value={nuevaTarifa.costoPesos ?? ""}
              onChange={(e) => setNuevaTarifa((prev) => ({ ...prev, costoPesos: e.target.value === "" ? undefined : parseInt(e.target.value) }))}
            />
          </label>
          <label className="config-field">
            <span>Min espera</span>
            <input
              type="number" placeholder="30" min={0}
              value={nuevaTarifa.tiempoMinMin ?? ""}
              onChange={(e) => setNuevaTarifa((prev) => ({ ...prev, tiempoMinMin: e.target.value === "" ? undefined : parseInt(e.target.value) }))}
            />
          </label>
          <label className="config-field">
            <span>Max espera</span>
            <input
              type="number" placeholder="45" min={0}
              value={nuevaTarifa.tiempoMaxMin ?? ""}
              onChange={(e) => setNuevaTarifa((prev) => ({ ...prev, tiempoMaxMin: e.target.value === "" ? undefined : parseInt(e.target.value) }))}
            />
          </label>
          <button className="primary-button" onClick={agregarTarifa} type="button">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <div className="tariff-preview">
          <span>Vista previa para el agente</span>
          <strong>
            {previewNuevaTarifa
              ? `${previewNuevaTarifa.rango} · ${previewNuevaTarifa.costo} · ${previewNuevaTarifa.tiempo}`
              : "Completa hasta km y costo para previsualizar la respuesta."}
          </strong>
        </div>

        {tarifas.length === 0 ? (
          <div className="delivery-empty">
            <Truck size={22} />
            <strong>Sin tarifas configuradas</strong>
            <p>Aún no hay tarifas configuradas. Agrega rangos de km con su costo de despacho.</p>
          </div>
        ) : (
          <div className="delivery-rate-list">
            {tarifasOrdenadas.map((t) => (
              <article className={`delivery-rate-card${t.activa ? "" : " is-inactive"}`} key={t.id}>
                <div className="delivery-rate-main">
                  <div className="delivery-rate-icon"><Truck size={15} /></div>
                  <div>
                    <span>Rango {formatKm(t.distanciaMinKm)}-{formatKm(t.distanciaMaxKm)} km</span>
                    <strong>{t.nombre}</strong>
                    <p>El agente usara esta tarifa cuando la direccion del cliente caiga dentro del rango.</p>
                  </div>
                </div>
                <div className="delivery-rate-metrics">
                  <div className="delivery-rate-chip">
                    <span>Costo</span>
                    <strong>{formatCLP(t.costoPesos)}</strong>
                  </div>
                  <div className="delivery-rate-chip">
                    <span>Tiempo</span>
                    <strong>{t.tiempoMinMin}-{t.tiempoMaxMin} min</strong>
                  </div>
                </div>
                <div className="delivery-rate-actions">
                  <label className="mini-toggle delivery-rate-status">
                    <input checked={t.activa} onChange={() => toggleTarifa(t.id)} type="checkbox" />
                    {t.activa ? "Activa" : "Pausada"}
                  </label>
                  <button className="icon-button" aria-label={`Eliminar tarifa ${t.nombre}`} onClick={() => eliminarTarifa(t.id)} type="button">
                    <Trash2 size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {status && <div className="status-banner">{status}</div>}
    </section>
  );
}
