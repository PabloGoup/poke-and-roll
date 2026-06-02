"use client";

import { useState } from "react";
import { CalendarCheck, CheckCircle2, CircleDot, Clock, Edit3, Instagram, MessageCircle, Facebook, Plus, Trash2 } from "lucide-react";

type Canal = "instagram" | "whatsapp" | "facebook";
type Estado = "programado" | "borrador" | "aprobado" | "publicado";
type Tipo = "Historia" | "Carrusel" | "Post" | "Reel" | "Mensaje" | "Anuncio";

type Pieza = {
  id: string;
  canal: Canal;
  tipo: Tipo;
  titulo: string;
  idea: string;
  horario: string;
  piezas: number;
  estado: Estado;
};

const CONTENIDO_INICIAL: Pieza[] = [
  { id: "1", canal: "instagram", tipo: "Historia", titulo: "Almuerzo express", idea: "Promo de horario con CTA a WhatsApp.", horario: "12:30", piezas: 3, estado: "programado" },
  { id: "2", canal: "instagram", tipo: "Carrusel", titulo: "Combos para compartir", idea: "Tres rutas de compra: económico, mixto y premium.", horario: "18:20", piezas: 5, estado: "borrador" },
  { id: "3", canal: "instagram", tipo: "Post", titulo: "Roll destacado", idea: "Producto hero con foco en salmón y crispy.", horario: "20:45", piezas: 1, estado: "aprobado" },
  { id: "4", canal: "instagram", tipo: "Reel", titulo: "Proceso de elaboración", idea: "Behind the scenes del armado de rolls en cocina.", horario: "14:00", piezas: 1, estado: "borrador" },
  { id: "5", canal: "whatsapp", tipo: "Mensaje", titulo: "Promo mediodía", idea: "Mensaje masivo con promo de almuerzo express para contactos.", horario: "11:45", piezas: 1, estado: "programado" },
  { id: "6", canal: "whatsapp", tipo: "Mensaje", titulo: "Confirmación pedidos", idea: "Recordatorio automático para pedidos sin confirmar después de 20 min.", horario: "Todo el día", piezas: 1, estado: "aprobado" },
  { id: "7", canal: "facebook", tipo: "Post", titulo: "Menú del día", idea: "Publicación diaria con el menú y horarios de atención.", horario: "10:00", piezas: 1, estado: "programado" },
  { id: "8", canal: "facebook", tipo: "Anuncio", titulo: "Delivery Providencia", idea: "Anuncio segmentado a usuarios en Providencia y Las Condes.", horario: "15:00", piezas: 2, estado: "borrador" },
];

const ESTADO_CONFIG: Record<Estado, { label: string; color: string }> = {
  programado: { label: "Programado", color: "#059669" },
  borrador:   { label: "Borrador",   color: "#737373" },
  aprobado:   { label: "Aprobado",   color: "#2563eb" },
  publicado:  { label: "Publicado",  color: "#7c3aed" },
};

const CANAL_CONFIG: Record<Canal, { label: string; icon: React.ElementType; color: string }> = {
  instagram: { label: "Instagram", icon: Instagram,      color: "#e1306c" },
  whatsapp:  { label: "WhatsApp",  icon: MessageCircle,  color: "#25d366" },
  facebook:  { label: "Facebook",  icon: Facebook,       color: "#1877f2" },
};

export function ContentCalendar() {
  const [piezas, setPiezas] = useState<Pieza[]>(CONTENIDO_INICIAL);
  const [filtroCanal, setFiltroCanal] = useState<Canal | "todas">("todas");
  const [filtroEstado, setFiltroEstado] = useState<Estado | "todos">("todos");
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevaOpen, setNuevaOpen] = useState(false);
  const [nueva, setNueva] = useState<Partial<Pieza>>({ canal: "instagram", tipo: "Post", estado: "borrador", piezas: 1 });

  const filtradas = piezas.filter((p) => {
    if (filtroCanal !== "todas" && p.canal !== filtroCanal) return false;
    if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
    return true;
  });

  function cambiarEstado(id: string, estado: Estado) {
    setPiezas((prev) => prev.map((p) => p.id === id ? { ...p, estado } : p));
  }

  function eliminar(id: string) {
    setPiezas((prev) => prev.filter((p) => p.id !== id));
  }

  function guardarNueva() {
    if (!nueva.titulo?.trim()) return;
    const pieza: Pieza = {
      id: Date.now().toString(),
      canal: nueva.canal ?? "instagram",
      tipo: nueva.tipo ?? "Post",
      titulo: nueva.titulo ?? "",
      idea: nueva.idea ?? "",
      horario: nueva.horario ?? "12:00",
      piezas: nueva.piezas ?? 1,
      estado: nueva.estado ?? "borrador",
    };
    setPiezas((prev) => [pieza, ...prev]);
    setNuevaOpen(false);
    setNueva({ canal: "instagram", tipo: "Post", estado: "borrador", piezas: 1 });
  }

  return (
    <section className="panel" id="contenido">
      <div className="panel-title">
        <div>
          <span>Planificación</span>
          <h2>Contenido programado</h2>
        </div>
        <button className="primary-button" onClick={() => setNuevaOpen(true)} type="button">
          <Plus size={15} /> Nueva pieza
        </button>
      </div>

      {/* Filters */}
      <div className="cal-filters">
        <div className="filter-chips">
          <button className={filtroCanal === "todas" ? "active" : ""} onClick={() => setFiltroCanal("todas")} type="button">Todos</button>
          {(["instagram", "whatsapp", "facebook"] as Canal[]).map((c) => {
            const cfg = CANAL_CONFIG[c];
            return (
              <button key={c} className={filtroCanal === c ? "active" : ""} onClick={() => setFiltroCanal(c)} type="button">
                <cfg.icon size={13} style={{ color: cfg.color }} /> {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="filter-chips">
          <button className={filtroEstado === "todos" ? "active" : ""} onClick={() => setFiltroEstado("todos")} type="button">Todos</button>
          {(["programado", "aprobado", "borrador", "publicado"] as Estado[]).map((e) => (
            <button key={e} className={filtroEstado === e ? "active" : ""} onClick={() => setFiltroEstado(e)} type="button">
              {ESTADO_CONFIG[e].label}
            </button>
          ))}
        </div>
      </div>

      {/* New piece form */}
      {nuevaOpen && (
        <div className="cal-new-form">
          <div className="cal-new-row">
            <select value={nueva.canal} onChange={(e) => setNueva((p) => ({ ...p, canal: e.target.value as Canal }))}>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
            </select>
            <select value={nueva.tipo} onChange={(e) => setNueva((p) => ({ ...p, tipo: e.target.value as Tipo }))}>
              {["Historia", "Carrusel", "Post", "Reel", "Mensaje", "Anuncio"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input type="time" value={nueva.horario ?? "12:00"} onChange={(e) => setNueva((p) => ({ ...p, horario: e.target.value }))} />
          </div>
          <input placeholder="Título de la pieza" value={nueva.titulo ?? ""} onChange={(e) => setNueva((p) => ({ ...p, titulo: e.target.value }))} />
          <textarea placeholder="Descripción / idea" rows={2} value={nueva.idea ?? ""} onChange={(e) => setNueva((p) => ({ ...p, idea: e.target.value }))} />
          <div className="cal-new-actions">
            <button className="ghost-button" onClick={() => setNuevaOpen(false)} type="button">Cancelar</button>
            <button className="primary-button" onClick={guardarNueva} type="button">Guardar</button>
          </div>
        </div>
      )}

      {/* Content list */}
      {filtradas.length === 0 ? (
        <div className="empty-state">No hay piezas para este filtro.</div>
      ) : (
        <div className="content-list">
          {filtradas.map((item) => {
            const canalCfg = CANAL_CONFIG[item.canal];
            const estadoCfg = ESTADO_CONFIG[item.estado];
            const CanalIcon = canalCfg.icon;
            return (
              <article className="content-row" key={item.id}>
                <div className="content-row-left">
                  <div className="content-canal-badge" style={{ background: `${canalCfg.color}18`, color: canalCfg.color }}>
                    <CanalIcon size={12} />
                    <span>{item.tipo}</span>
                  </div>
                  <h3 className="content-titulo">{item.titulo}</h3>
                  <p className="content-idea">{item.idea}</p>
                </div>
                <div className="content-meta">
                  <span className="content-meta-item">
                    <Clock size={13} />{item.horario}
                  </span>
                  <span className="content-meta-item">
                    <CircleDot size={13} />{item.piezas} {item.piezas === 1 ? "pieza" : "piezas"}
                  </span>
                  <select
                    className="content-estado-select"
                    value={item.estado}
                    onChange={(e) => cambiarEstado(item.id, e.target.value as Estado)}
                    style={{ color: estadoCfg.color, borderColor: `${estadoCfg.color}40` }}
                  >
                    {(Object.keys(ESTADO_CONFIG) as Estado[]).map((e) => (
                      <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
                    ))}
                  </select>
                  <button className="cal-action-btn" onClick={() => eliminar(item.id)} title="Eliminar" type="button">
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="cal-summary">
        <span>{piezas.filter(p => p.estado === "programado").length} programadas</span>
        <span>{piezas.filter(p => p.estado === "aprobado").length} aprobadas</span>
        <span>{piezas.filter(p => p.estado === "borrador").length} borradores</span>
      </div>
    </section>
  );
}
