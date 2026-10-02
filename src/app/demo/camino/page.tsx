"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCheck, IconChevronRight, IconLock } from "@tabler/icons-react";
import { AREAS, CYCLE, DELIVERABLES, PHASES, STARTUP } from "../_data";
import { AreaTag, Page, PageHeader, Ring, StatusPill, dueLabel } from "../_components/ui";

const PHASE_GOALS: Record<number, string> = {
  1: "Validar que el problema existe y que el cliente está bien definido.",
  2: "Construir y validar que la solución resuelve el problema.",
  3: "Conseguir los primeros usuarios activos y demostrar retención.",
  4: "Generar los primeros ingresos: 3–5 clientes pagando.",
  5: "Escalar los canales que funcionan y crecer de forma predecible.",
  6: "Consolidar equipo, operaciones y financiación.",
};

export default function CaminoPage() {
  const [selected, setSelected] = useState(STARTUP.phase);
  const phase = PHASES.find((p) => p.n === selected)!;
  const items = DELIVERABLES.filter((d) => d.phase === selected);
  const done = items.filter((d) => d.status === "completado").length;
  const byArea = Object.keys(AREAS)
    .map((a) => ({ area: a, items: items.filter((d) => d.area === a) }))
    .filter((g) => g.items.length);

  return (
    <Page>
      <PageHeader
        eyebrow={`Ciclo ${CYCLE.number} · ${CYCLE.start} → ${CYCLE.end}`}
        title="Mi camino"
        subtitle="Seis fases, un objetivo por fase. Cada entregable es una prueba de que habéis avanzado."
      />

      {/* Línea de fases */}
      <div className="card rise d1" style={{ padding: "26px 28px", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0, position: "relative" }}>
          <div style={{ position: "absolute", top: 17, left: "8%", right: "8%", height: 2, background: "var(--line)" }} />
          <div style={{ position: "absolute", top: 17, left: "8%", width: `${((STARTUP.phase - 1) / 5) * 84}%`, height: 2, background: "var(--green)" }} />
          {PHASES.map((p) => {
            const isSel = p.n === selected;
            const isDone = p.status === "done";
            const isCurrent = p.status === "current";
            return (
              <button
                key={p.n}
                type="button"
                onClick={() => setSelected(p.n)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", fontFamily: "inherit", padding: 0 }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center",
                  fontSize: 14, fontWeight: 700,
                  background: isDone ? "var(--green)" : isCurrent ? p.color : "#fff",
                  color: isDone || isCurrent ? "#fff" : "var(--faint)",
                  border: isDone || isCurrent ? "none" : "1.5px solid var(--line-2)",
                  boxShadow: isSel ? `0 0 0 5px ${p.color}26` : "none",
                  transition: "box-shadow 0.2s",
                }}>
                  {isDone ? <IconCheck size={17} stroke={3} /> : p.status === "next" ? <IconLock size={14} /> : p.n}
                </span>
                <span style={{ fontSize: 14.5, fontWeight: isSel ? 700 : 500, color: isSel ? "var(--ink)" : "var(--muted)" }}>{p.name}</span>
                <span style={{ fontSize: 11.5, color: "var(--faint)", marginTop: -6 }}>Semanas {p.weeks}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fase seleccionada */}
      <div key={selected} style={{ display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: 24 }}>
        <aside className="card rise" style={{ padding: 24, alignSelf: "start", position: "sticky", top: 84 }}>
          <div className="eyebrow" style={{ color: phase.color }}>Fase {phase.n}</div>
          <div className="display" style={{ fontSize: 24, marginTop: 4 }}>{phase.name}</div>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55, marginTop: 10 }}>{PHASE_GOALS[phase.n]}</p>
          {items.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, paddingTop: 18, borderTop: "1px dashed var(--line-2)" }}>
              <Ring value={Math.round((done / items.length) * 100)} size={60} color={phase.color} />
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                <strong style={{ color: "var(--ink)", fontSize: 15 }}>{done} de {items.length}</strong><br />entregables completados
              </div>
            </div>
          ) : null}
          {phase.status === "current" && (
            <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: "#fef3c7", fontSize: 13, color: "#92400e", lineHeight: 1.45 }}>
              Para pasar a <strong>Activar</strong> necesitáis el mockup validado por 5 clínicas y el pricing v1.
            </div>
          )}
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {phase.status === "next" && (
            <div className="card rise" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              <IconLock size={26} style={{ marginBottom: 10 }} />
              <div className="display" style={{ fontSize: 22, color: "var(--ink)" }}>Aún no habéis llegado aquí</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Los entregables de {phase.name} se desbloquean al completar la fase anterior. Puedes consultar sus recursos en el Arsenal.</div>
            </div>
          )}
          {byArea.map((g, gi) => (
            <section key={g.area} className={`card rise d${Math.min(gi + 1, 6)}`} style={{ padding: "6px 0" }}>
              <div style={{ padding: "12px 20px 6px" }}><AreaTag area={g.area} /></div>
              {g.items.map((d) => {
                const due = dueLabel(d.dueDays);
                return (
                  <Link key={d.id} href={`/demo/entregables/${d.id}`} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", textDecoration: "none", borderTop: "1px solid var(--line)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{d.title}</div>
                      {d.feedback && d.status === "cambios_solicitados" && (
                        <div style={{ fontSize: 12.5, color: "var(--rose)", marginTop: 3 }}>Víctor: «{d.feedback.slice(0, 70)}…»</div>
                      )}
                    </div>
                    {d.status !== "completado" && <span style={{ fontSize: 12, fontWeight: 600, color: due.color, whiteSpace: "nowrap" }}>{due.text}</span>}
                    <StatusPill status={d.status} />
                    <IconChevronRight size={16} color="var(--faint)" />
                  </Link>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </Page>
  );
}
