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
  MessageSquareText,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const accionesActivas = useMemo(() => acciones.filter((a) => a.activa).length, [acciones]);
  const imagenPrioritaria = imagenes.find((img) => img.prioridadEnvio);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  async function cargarConfiguracion() {
    setLoading(true);
    try {
      const res = await fetch("/api/configuracion-comercial", { cache: "no-store" });
      const data = await res.json();
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
    } finally {
      setLoading(false);
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

  async function cargarImagenes(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    event.target.value = "";
    setUploading(true);
    setStatus("Subiendo imagenes...");

    try {
      const nuevas: ImagenCatalogo[] = [];
      for (const [index, file] of files.entries()) {
        const body = new FormData();
        body.append("file", file);
        body.append("tipo", "catalogo");
        body.append("prioridadEnvio", String(imagenes.length === 0 && index === 0));

        const res = await fetch("/api/configuracion-comercial/imagenes", {
          method: "POST",
          body
        });
        const data = await res.json();
        if (data.ok) nuevas.push(data.imagen);
      }

      setImagenes((prev) => [...nuevas, ...prev.map((img) => nuevas.some((n) => n.prioridadEnvio) ? { ...img, prioridadEnvio: false } : img)]);
      setStatus(nuevas.length > 0 ? "Imagenes subidas y guardadas" : "No se pudo subir ninguna imagen");
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
      const res = await fetch("/api/configuracion-comercial", {
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
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "No se pudo guardar");
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
              <h3>Imagenes para enviar primero</h3>
            </div>
            <label className="upload-button">
              <Camera size={14} />
              {uploading ? "Subiendo..." : "Subir imagenes"}
              <input accept="image/*,application/pdf,.pdf" multiple onChange={cargarImagenes} type="file" />
            </label>
          </div>

          {imagenes.length === 0 ? (
            <div className="visual-empty">
              <ImagePlus size={26} />
              <strong>Aun no hay catalogo visual cargado</strong>
              <p>Sube imagenes o PDF del menu, promociones, roll del dia o catalogo completo. La marcada como prioritaria sera la primera sugerencia del agente.</p>
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
                      value={img.tipo}
                      onChange={(e) => setImagenes((prev) => prev.map((item) => item.id === img.id ? { ...item, tipo: e.target.value as ImagenCatalogo["tipo"] } : item))}
                    >
                      <option value="catalogo">Catalogo completo</option>
                      <option value="promocion">Promocion</option>
                      <option value="roll_dia">Roll del dia</option>
                      <option value="menu_dia">Menu del dia</option>
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
          </div>
          <button className="ghost-button" disabled={saving} onClick={guardarConfiguracion} type="button">
            <Save size={14} /> {saving ? "Guardando..." : "Guardar configuracion"}
          </button>
        </div>

        <div className="quick-edit-form">
          <select value={nuevoItem.tipo} onChange={(e) => setNuevoItem((prev) => ({ ...prev, tipo: e.target.value as ItemEditable["tipo"] }))}>
            <option value="promocion">Promocion</option>
            <option value="menu">Menu</option>
          </select>
          <input placeholder="Nombre" value={nuevoItem.nombre ?? ""} onChange={(e) => setNuevoItem((prev) => ({ ...prev, nombre: e.target.value }))} />
          <input placeholder="Precio o descuento" value={nuevoItem.precio ?? ""} onChange={(e) => setNuevoItem((prev) => ({ ...prev, precio: e.target.value }))} />
          <input placeholder="Detalle para la IA" value={nuevoItem.detalle ?? ""} onChange={(e) => setNuevoItem((prev) => ({ ...prev, detalle: e.target.value }))} />
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

      {status && <div className="status-banner">{status}</div>}
    </section>
  );
}
