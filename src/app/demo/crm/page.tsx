"use client";

import { useState } from "react";
import { IconPlus, IconX, IconMapPin, IconRobot, IconCalendarPlus, IconMail } from "@tabler/icons-react";
import { LEADS, STAGES, type Lead, type Stage } from "../_data";
import { Avatar, Page, PageHeader } from "../_components/ui";

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);

  const move = (id: string, stage: Stage) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)));
    setSelected((s) => (s && s.id === id ? { ...s, stage } : s));
  };

  const open = leads.filter((l) => l.stage !== "cerrado_ganado");
  const won = leads.filter((l) => l.stage === "cerrado_ganado");
  const kpis = [
    { label: "Pipeline abierto", value: `${open.reduce((a, l) => a + l.value, 0)} €`, sub: "al mes si cierran todos" },
    { label: "Pilotos / clientes", value: String(won.length), sub: `${won.reduce((a, l) => a + l.value, 0)} € MRR potencial` },
    { label: "En demo o más", value: String(leads.filter((l) => l.stage !== "contacto_inicial").length), sub: `de ${leads.length} contactos` },
    { label: "Vienen del agente", value: String(leads.filter((l) => l.source === "Agente SDR").length), sub: "contactos generados por IA" },
  ];

  return (
    <Page wide>
      <PageHeader
        eyebrow="Trabajo"
        title="CRM"
        subtitle="Tu pipeline de clínicas. Arrastra una tarjeta para cambiarla de etapa."
        actions={<button type="button" className="btn btn-primary"><IconPlus size={15} /> Nuevo contacto</button>}
      />

      <div className="rise d1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500 }}>{k.label}</div>
            <div className="display" style={{ fontSize: 26, marginTop: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--faint)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="rise d2" style={{ display: "grid", gridTemplateColumns: `repeat(${STAGES.length}, minmax(200px, 1fr))`, gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {STAGES.map((s) => {
          const cards = leads.filter((l) => l.stage === s.id);
          return (
            <div
              key={s.id}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={() => { if (dragging) move(dragging, s.id); setDragging(null); setOver(null); }}
              style={{
                borderRadius: 14, padding: 10, minHeight: 420,
                background: over === s.id ? `${s.color}14` : "var(--paper-2)",
                border: `1px dashed ${over === s.id ? s.color : "transparent"}`, transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 10px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{cards.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cards.map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={() => setDragging(l.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setSelected(l)}
                    className="card card-hover"
                    style={{ padding: 12, cursor: "grab", opacity: dragging === l.id ? 0.4 : 1 }}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 650, lineHeight: 1.3 }}>{l.company}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{l.contact} · {l.role}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{l.value} €/mes</span>
                      {l.source === "Agente SDR" && <span title="Generado por el agente SDR" style={{ display: "inline-flex", color: "var(--green-ink)" }}><IconRobot size={14} /></span>}
                    </div>
                    {l.next && <div style={{ fontSize: 11.5, color: "var(--amber)", marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--line)" }}>→ {l.next}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ficha del contacto */}
      {selected && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }} style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.25)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
          <div className="rise" style={{ width: 440, height: "100%", background: "var(--paper)", borderLeft: "1px solid var(--line)", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Avatar initials={selected.company.split(" ").slice(-1)[0][0]} color="#2563EB" size={44} />
              <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setSelected(null)}><IconX size={18} /></button>
            </div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "14px 0 4px", lineHeight: 1.15 }}>{selected.company}</h2>
            <div style={{ fontSize: 14, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}><IconMapPin size={14} />{selected.city}</div>

            <div style={{ marginTop: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Etapa</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STAGES.map((s) => (
                  <button key={s.id} type="button" onClick={() => move(selected.id, s.id)} style={{
                    padding: "6px 11px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${selected.stage === s.id ? s.color : "var(--line-2)"}`,
                    background: selected.stage === s.id ? `${s.color}18` : "#fff", color: selected.stage === s.id ? s.color : "var(--ink-2)",
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                ["Contacto", `${selected.contact}`], ["Cargo", selected.role],
                ["Valor", `${selected.value} €/mes`], ["Origen", selected.source],
                ["Último contacto", selected.last], ["Siguiente paso", selected.next ?? "—"],
              ].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div></div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Notas</div>
              <textarea className="field" rows={4} defaultValue={selected.notes} placeholder="Añade notas de la conversación…" />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button type="button" className="btn"><IconMail size={15} /> Escribir</button>
              <button type="button" className="btn"><IconCalendarPlus size={15} /> Agendar</button>
              <button type="button" className="btn btn-green" style={{ marginLeft: "auto" }}>Guardar</button>
            </div>

            <div style={{ marginTop: 26 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Actividad</div>
              {[
                { t: selected.last, d: "Llamada de seguimiento · 12 min" },
                { t: "hace 1 semana", d: selected.source === "Agente SDR" ? "Primer mensaje enviado por el agente SDR" : "Primer contacto" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", fontSize: 13.5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--line-2)", marginTop: 7 }} />
                  <div><div>{a.d}</div><div style={{ fontSize: 12, color: "var(--faint)" }}>{a.t}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
