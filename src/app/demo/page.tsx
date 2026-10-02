"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconClock, IconMapPin, IconSparkles } from "@tabler/icons-react";
import {
  AGENDA_TODAY, COHORT, CYCLE, DELIVERABLES, ME, NOTIFICATIONS, PHASES, STARTUP, TODAY_TASKS,
} from "./_data";
import { Avatar, Page, Ring, SectionTitle, StatusPill, dueLabel } from "./_components/ui";

const KIND_COLOR: Record<string, string> = { weekly: "#16a34a", mentor: "#7c3aed", cliente: "#2563eb" };

export default function HoyPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const phase = PHASES.find((p) => p.n === STARTUP.phase)!;
  const current = DELIVERABLES.filter((d) => d.phase === STARTUP.phase);
  const completed = current.filter((d) => d.status === "completado").length;
  const pct = Math.round((completed / current.length) * 100);
  const upcoming = current
    .filter((d) => d.status !== "completado")
    .sort((a, b) => a.dueDays - b.dueDays)
    .slice(0, 4);
  const pending = TODAY_TASKS.filter((t) => !done[t.id]).length;

  return (
    <Page>
      {/* Saludo */}
      <div className="rise" style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Semana {CYCLE.week} · Fase {phase.n} · {phase.name}</div>
        <h1 className="display" style={{ fontSize: 52, fontWeight: 400, lineHeight: 1, margin: 0 }}>
          Buenos días, <em style={{ fontStyle: "italic", color: "var(--green-ink)" }}>{ME.first}</em>.
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", marginTop: 14, maxWidth: 620, lineHeight: 1.55 }}>
          Tienes <strong style={{ color: "var(--ink)" }}>{pending} cosas</strong> para hoy y{" "}
          <strong style={{ color: "var(--ink)" }}>{AGENDA_TODAY.length} reuniones</strong>. Víctor te ha pedido cambios en la propuesta
          diferenciada: es lo más urgente.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) minmax(0, 1fr)", gap: 24 }}>
        {/* ─── Columna principal ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="card rise d1" style={{ padding: 24 }}>
            <SectionTitle aside={`${TODAY_TASKS.length - pending}/${TODAY_TASKS.length} hechas`}>Tus prioridades de hoy</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {TODAY_TASKS.map((t, i) => {
                const isDone = !!done[t.id];
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <button
                      type="button"
                      onClick={() => setDone((d) => ({ ...d, [t.id]: !d[t.id] }))}
                      aria-label="Marcar como hecha"
                      style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: "pointer",
                        border: isDone ? "none" : `1.5px solid ${t.urgent ? "var(--rose)" : "var(--line-2)"}`,
                        background: isDone ? "var(--green)" : "#fff", display: "grid", placeItems: "center",
                      }}
                    >
                      {isDone && <IconCheck size={14} color="#fff" stroke={3} />}
                    </button>
                    <Link href={t.href} style={{ flex: 1, textDecoration: "none", fontSize: 15, color: isDone ? "var(--faint)" : "var(--ink)", textDecorationLine: isDone ? "line-through" : "none" }}>
                      {t.title}
                    </Link>
                    {t.urgent && !isDone && <span className="pill" style={{ background: "#fff1f2", color: "var(--rose)" }}>Urgente</span>}
                    <span className="pill" style={{ background: "var(--paper-2)", color: "var(--muted)" }}>{t.tag}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card rise d2" style={{ padding: 24 }}>
            <SectionTitle aside={<Link href="/demo/camino" style={{ color: "var(--green-ink)", fontWeight: 600, textDecoration: "none" }}>Ver mi camino →</Link>}>
              Próximas entregas
            </SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {upcoming.map((d) => {
                const due = dueLabel(d.dueDays);
                return (
                  <Link key={d.id} href={`/demo/entregables/${d.id}`} className="card card-hover" style={{ padding: 16, textDecoration: "none", background: "#fffdf9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                      <StatusPill status={d.status} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: due.color }}>{due.text}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{d.title}</div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="card rise d3" style={{ padding: 24 }}>
            <SectionTitle>Lo nuevo desde ayer</SectionTitle>
            {NOTIFICATIONS.filter((n) => n.unread).map((n, i) => (
              <Link key={n.id} href={n.href} className="row-hover" style={{ display: "flex", gap: 12, padding: "12px 8px", margin: "0 -8px", borderRadius: 8, borderTop: i ? "1px solid var(--line)" : "none", textDecoration: "none" }}>
                <span style={{ width: 7, height: 7, marginTop: 7, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 14, color: "var(--ink-2)" }}><strong style={{ color: "var(--ink)" }}>{n.who}</strong> {n.text}</div>
                <span style={{ fontSize: 12, color: "var(--faint)", whiteSpace: "nowrap" }}>{n.when}</span>
              </Link>
            ))}
          </section>
        </div>

        {/* ─── Columna lateral ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="card rise d2" style={{ padding: 22 }}>
            <SectionTitle aside={<Link href="/demo/agenda" style={{ color: "var(--green-ink)", fontWeight: 600, textDecoration: "none" }}>Agenda →</Link>}>Hoy en tu agenda</SectionTitle>
            <div style={{ position: "relative", paddingLeft: 16 }}>
              <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 1, background: "var(--line-2)" }} />
              {AGENDA_TODAY.map((e) => (
                <div key={e.time} style={{ position: "relative", padding: "8px 0 14px" }}>
                  <span style={{ position: "absolute", left: -16, top: 13, width: 9, height: 9, borderRadius: "50%", background: KIND_COLOR[e.kind], boxShadow: "0 0 0 3px #fff" }} />
                  <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <IconClock size={12} /> {e.time} – {e.end}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>{e.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{e.who}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card rise d3" style={{ padding: 22, background: "linear-gradient(160deg, #fff 55%, #f3faf5)" }}>
            <SectionTitle>Tu fase</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Ring value={pct} size={78} color={phase.color} />
              <div>
                <div className="display" style={{ fontSize: 24, fontWeight: 500 }}>{phase.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{completed} de {current.length} entregables · semanas {phase.weeks}</div>
              </div>
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px dashed var(--line-2)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Tu métrica norte</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span className="display" style={{ fontSize: 34, fontWeight: 500 }}>{STARTUP.northStar.value}</span>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>/ {STARTUP.northStar.target} {STARTUP.northStar.metric.toLowerCase()}</span>
              </div>
            </div>
          </section>

          <section className="card rise d4" style={{ padding: 22 }}>
            <SectionTitle aside={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconMapPin size={12} />Fusión Sevilla</span>}>En la oficina hoy</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COHORT.filter((c) => c.inOffice > 0).map((c) => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px 5px 5px", borderRadius: 999, background: c.isMe ? "var(--green-soft)" : "var(--paper-2)" }}>
                  <Avatar initials={c.name[0]} color={c.color} size={22} />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.inOffice}</span>
                </div>
              ))}
            </div>
          </section>

          <Link href="/demo/entregables/propuesta" className="rise d5" style={{
            display: "flex", gap: 12, padding: 18, borderRadius: "var(--radius)", textDecoration: "none",
            background: "var(--forest)", color: "#ecfdf3",
          }}>
            <IconSparkles size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Tu copiloto tiene una propuesta</div>
              <div style={{ fontSize: 13, color: "rgba(236,253,243,0.7)", marginTop: 3, lineHeight: 1.45 }}>
                Ha redactado tu frase de diferenciación con los datos de tus 34 entrevistas.
              </div>
            </div>
            <IconArrowRight size={16} style={{ marginTop: 3 }} />
          </Link>
        </div>
      </div>
    </Page>
  );
}
