"use client";

import { useState } from "react";
import { IconBook, IconChecklist, IconSparkles, IconTemplate, IconFileText, IconX, IconSearch, IconClock } from "@tabler/icons-react";
import { AREAS, PHASES, RESOURCES, STARTUP } from "../_data";
import { AreaTag, Page, PageHeader } from "../_components/ui";

const TYPE_STYLE: Record<string, { icon: typeof IconBook; color: string }> = {
  Playbook:         { icon: IconBook,      color: "#2563EB" },
  Plantilla:        { icon: IconTemplate,  color: "#7C3AED" },
  "Herramienta IA": { icon: IconSparkles,  color: "#16A34A" },
  Checklist:        { icon: IconChecklist, color: "#D97706" },
  Recurso:          { icon: IconFileText,  color: "#78716C" },
};

type Resource = (typeof RESOURCES)[number];

export default function ArsenalPage() {
  const [area, setArea] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Resource | null>(null);

  const forPhase = RESOURCES.filter((r) => r.phase === STARTUP.phase);
  const filtered = RESOURCES.filter((r) =>
    (!area || r.area === area) && (!type || r.type === type) && (!q || r.title.toLowerCase().includes(q.toLowerCase()))
  );
  const phase = PHASES.find((p) => p.n === STARTUP.phase)!;

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    border: `1px solid ${active ? "var(--ink)" : "var(--line-2)"}`,
    background: active ? "var(--ink)" : "#fff", color: active ? "#fff" : "var(--ink-2)",
  });

  return (
    <Page wide>
      <PageHeader
        eyebrow="El Arsenal"
        title="Todo lo que necesitas para avanzar"
        subtitle="Playbooks, plantillas y herramientas de IA del equipo de Fusión, ordenados por lo que te toca ahora."
      />

      {/* Para tu fase */}
      <section className="rise d1" style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Para tu fase ahora · {phase.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {forPhase.slice(0, 4).map((r) => {
            const t = TYPE_STYLE[r.type];
            const Icon = t.icon;
            return (
              <button key={r.id} type="button" onClick={() => setOpen(r)} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", textAlign: "left", padding: 18, cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: `${t.color}14`, display: "grid", placeItems: "center" }}><Icon size={18} color={t.color} /></span>
                  {r.isNew && <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green-ink)" }}>Nuevo</span>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 650, lineHeight: 1.3, color: "var(--ink)" }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>{r.type} · {r.minutes} min</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filtros */}
      <div className="rise d2" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <button type="button" style={chip(!area)} onClick={() => setArea("")}>Todas las áreas</button>
        {Object.entries(AREAS).map(([id, a]) => (
          <button key={id} type="button" style={chip(area === id)} onClick={() => setArea(area === id ? "" : id)}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: a.color, marginRight: 6 }} />{a.name}
          </button>
        ))}
        <div style={{ marginLeft: "auto", position: "relative", width: 240 }}>
          <IconSearch size={14} style={{ position: "absolute", left: 11, top: 12, color: "var(--faint)" }} />
          <input className="field" placeholder="Buscar en el Arsenal" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 32, paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
        </div>
      </div>
      <div className="rise d2" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Object.keys(TYPE_STYLE).map((t) => (
          <button key={t} type="button" onClick={() => setType(type === t ? "" : t)} style={{ ...chip(type === t), fontWeight: 500, fontSize: 12.5 }}>{t}</button>
        ))}
      </div>

      {/* Biblioteca */}
      <div className="card rise d3" style={{ padding: "4px 0" }}>
        {filtered.map((r, i) => {
          const t = TYPE_STYLE[r.type];
          const Icon = t.icon;
          return (
            <button key={r.id} type="button" onClick={() => setOpen(r)} className="row-hover" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", border: "none", borderTop: i ? "1px solid var(--line)" : "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <Icon size={18} color={t.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{r.title}</div>
              </div>
              <AreaTag area={r.area} />
              <span style={{ width: 110, fontSize: 12.5, color: "var(--muted)" }}>{r.type}</span>
              <span style={{ width: 70, fontSize: 12.5, color: "var(--faint)", display: "inline-flex", alignItems: "center", gap: 4 }}><IconClock size={12} />{r.minutes} min</span>
            </button>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No hay recursos con esos filtros.</div>}
      </div>

      {/* Vista previa */}
      {open && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }} style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.3)", zIndex: 50, display: "grid", placeItems: "center", padding: 24 }}>
          <div className="card rise" style={{ width: "100%", maxWidth: 640, padding: 32, position: "relative" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(null)} style={{ position: "absolute", top: 16, right: 16, padding: 6 }}><IconX size={18} /></button>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span className="pill" style={{ background: `${TYPE_STYLE[open.type].color}14`, color: TYPE_STYLE[open.type].color }}>{open.type}</span>
              <AreaTag area={open.area} />
            </div>
            <h2 className="display" style={{ fontSize: 24, margin: "0 0 14px", lineHeight: 1.25 }}>{open.title}</h2>
            <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.65 }}>
              Aquí se mostraría el contenido completo del recurso: el playbook paso a paso, la plantilla rellenable
              o la herramienta de IA lista para usar con los datos de tu startup.
            </p>
            <ol style={{ fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Qué es y cuándo usarlo</li>
              <li>Paso a paso con ejemplos de startups de Fusión</li>
              <li>Errores típicos</li>
              <li>Plantilla descargable o rellenable</li>
            </ol>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn">Guardar para luego</button>
              <button type="button" className="btn btn-green">{open.type === "Herramienta IA" ? "Abrir herramienta" : "Empezar"}</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
