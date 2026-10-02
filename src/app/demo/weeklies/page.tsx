"use client";

import { useState } from "react";
import { IconCalendarEvent, IconCheck, IconPlus } from "@tabler/icons-react";
import { WEEKLIES } from "../_data";
import { Avatar, Page, PageHeader } from "../_components/ui";

export default function WeekliesPage() {
  const [selectedId, setSelectedId] = useState(WEEKLIES[0].id);
  const [taskState, setTaskState] = useState<Record<string, boolean>>(
    Object.fromEntries(WEEKLIES.flatMap((w) => w.tasks.map((t, i) => [`${w.id}-${i}`, t.done])))
  );
  const [extraAgenda, setExtraAgenda] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState("");

  const w = WEEKLIES.find((x) => x.id === selectedId)!;
  const openTasks = WEEKLIES.flatMap((wk) => wk.tasks.map((t, i) => ({ ...t, key: `${wk.id}-${i}`, week: wk.week })))
    .filter((t) => !taskState[t.key]);

  return (
    <Page wide>
      <PageHeader
        eyebrow="Con Fusión"
        title="Weeklies"
        subtitle="Cada semana, 30 minutos con tu responsable de Fusión. Aquí queda lo que se habla y lo que se acuerda."
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0, 1fr) 300px", gap: 22, alignItems: "start" }}>
        {/* Lista */}
        <nav className="card rise d1" style={{ padding: 8 }}>
          {WEEKLIES.map((wk) => {
            const active = wk.id === selectedId;
            return (
              <button key={wk.id} type="button" onClick={() => setSelectedId(wk.id)} style={{
                width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit",
                padding: "12px 14px", borderRadius: 10, background: active ? "var(--paper-2)" : "transparent",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>SEM</div>
                  <div className="display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{wk.week}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{wk.date}</div>
                  <div style={{ fontSize: 12, color: wk.upcoming ? "var(--green-ink)" : "var(--muted)", fontWeight: wk.upcoming ? 600 : 400 }}>
                    {wk.upcoming ? "Hoy · 10:00" : `${wk.tasks.length} tareas acordadas`}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Detalle */}
        <article key={w.id} className="card rise" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <Avatar initials="VH" color="#374151" size={38} />
            <div>
              <div className="display" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.15 }}>Semana {w.week}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{w.date} · con {w.with}</div>
            </div>
            {w.upcoming && <span className="pill" style={{ marginLeft: "auto", background: "var(--green-soft)", color: "var(--green-ink)" }}><IconCalendarEvent size={13} /> Hoy 10:00</span>}
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Agenda</div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.9 }}>
            {[...w.agenda, ...(w.upcoming ? extraAgenda : [])].map((a, i) => <li key={i}>{a}</li>)}
          </ol>
          {w.upcoming && (
            <form onSubmit={(e) => { e.preventDefault(); if (newPoint.trim()) { setExtraAgenda((x) => [...x, newPoint.trim()]); setNewPoint(""); } }} style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input className="field" value={newPoint} onChange={(e) => setNewPoint(e.target.value)} placeholder="Añade un punto que quieras tratar…" />
              <button type="submit" className="btn"><IconPlus size={15} /> Añadir</button>
            </form>
          )}

          {w.notes && (
            <>
              <div className="eyebrow" style={{ margin: "26px 0 10px" }}>Notas de Víctor</div>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-2)", margin: 0, padding: "14px 16px", background: "#fafafa", borderLeft: "3px solid var(--green)", borderRadius: "0 10px 10px 0" }}>{w.notes}</p>
            </>
          )}

          {w.tasks.length > 0 && (
            <>
              <div className="eyebrow" style={{ margin: "26px 0 6px" }}>Lo que acordamos</div>
              {w.tasks.map((t, i) => {
                const key = `${w.id}-${i}`;
                const done = taskState[key];
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <button type="button" onClick={() => setTaskState((s) => ({ ...s, [key]: !s[key] }))} style={{ width: 20, height: 20, borderRadius: 6, cursor: "pointer", border: done ? "none" : "1.5px solid var(--line-2)", background: done ? "var(--green)" : "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {done && <IconCheck size={13} color="#fff" stroke={3} />}
                    </button>
                    <span style={{ flex: 1, fontSize: 14.5, color: done ? "var(--faint)" : "var(--ink)", textDecoration: done ? "line-through" : "none" }}>{t.text}</span>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{t.owner} · {t.due}</span>
                  </div>
                );
              })}
            </>
          )}

          {w.upcoming && (
            <div style={{ marginTop: 26, padding: 14, borderRadius: 10, background: "var(--paper-2)", fontSize: 13.5, color: "var(--muted)" }}>
              Después de la reunión, Víctor añadirá aquí las notas y las tareas. Te llegarán también por email.
            </div>
          )}
        </article>

        {/* Mis tareas */}
        <aside className="card rise d2" style={{ padding: 20, position: "sticky", top: 84 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Tareas abiertas del equipo · {openTasks.length}</div>
          {openTasks.length === 0 && <div style={{ fontSize: 14, color: "var(--muted)" }}>Todo al día.</div>}
          {openTasks.map((t) => (
            <div key={t.key} style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{t.text}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{t.owner} · vence {t.due} · semana {t.week}</div>
            </div>
          ))}
        </aside>
      </div>
    </Page>
  );
}
