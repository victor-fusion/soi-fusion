"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconArrowLeft, IconCheck, IconExternalLink, IconNotes, IconScale } from "@tabler/icons-react";
import { PHASES, TEAM, WEEKLIES } from "../../../demo/_data";
import { Avatar, GateCriteria, Kpi, Page, type GateState } from "../../../demo/_components/ui";
import { Columns } from "../../../demo/_components/charts";
import { EVENT_KINDS, PHASE_GATE, PORTFOLIO, TIMELINE, type EventKind } from "../../_data";
import { HealthBadge, PhasePill, SignalPill, StartupLogo, WeeklyPrepDrawer } from "../../_components/admin-ui";

const MONTHS = ["jun", "jul", "ago", "sep", "oct", "nov"];
const TABS = ["Resumen", "Decisión de fase", "Historial", "Equipo"] as const;
type Tab = (typeof TABS)[number];

// Para startups distintas de Turnio, datos genéricos de ejemplo.
const GENERIC_TIMELINE: typeof TIMELINE = [
  { when: "hace 3 días", kind: "entregable", text: "Envió un entregable a revisión", who: "Equipo" },
  { when: "hace 1 semana", kind: "weekly", text: "Weekly registrada · 3 tareas acordadas", who: "Fusión" },
  { when: "1 nov", kind: "metricas", text: "Métricas de octubre registradas", who: "Equipo" },
  { when: "1 oct", kind: "fase", text: "Inicio del ciclo 6 · fase Descubrir", who: "SOI" },
];
const GENERIC_TEAM = [
  { name: "Cofundador/a 1", role: "CEO", initials: "C1", color: "#374151", dedication: "Full-time", lastLogin: 1 },
  { name: "Cofundador/a 2", role: "CTO", initials: "C2", color: "#2563EB", dedication: "Full-time", lastLogin: 3 },
];

export default function StartupFichaPage() {
  const { id } = useParams<{ id: string }>();
  const s = PORTFOLIO.find((x) => x.id === id) ?? PORTFOLIO[0];
  const isTurnio = s.id === "turnio";
  const [tab, setTab] = useState<Tab>("Resumen");
  const [prep, setPrep] = useState(false);
  const [decision, setDecision] = useState<"aprobado" | "mantener" | null>(null);
  const [kindFilter, setKindFilter] = useState<EventKind | "all">("all");

  const phase = PHASES.find((p) => p.n === s.phase)!;
  const next = PHASES.find((p) => p.n === s.phase + 1);
  const gate: { text: string; evidence: string; state: GateState }[] = isTurnio ? PHASE_GATE.criteria : [
    { text: "Entregables de la fase completados", evidence: `${s.progress} %`, state: s.progress >= 80 ? "ok" : s.progress >= 50 ? "parcial" : "pendiente" },
    { text: "Métricas del mes registradas", evidence: s.signals.some((x) => x.includes("Métricas")) ? "No" : "Sí", state: s.signals.some((x) => x.includes("Métricas")) ? "pendiente" : "ok" },
    { text: "Weekly en los últimos 10 días", evidence: `hace ${s.lastWeekly} d`, state: s.lastWeekly <= 10 ? "ok" : "pendiente" },
  ];
  const met = gate.filter((g) => g.state === "ok").length;
  const timeline = isTurnio ? TIMELINE : GENERIC_TIMELINE;
  const events = timeline.filter((e) => kindFilter === "all" || e.kind === kindFilter);
  const openTasks = isTurnio ? WEEKLIES.flatMap((w) => w.tasks).filter((t) => !t.done) : [{ text: "Cerrar entregables pendientes de la fase", owner: "Equipo", due: "esta semana", done: false }];
  const team = isTurnio ? TEAM.map((m, i) => ({ ...m, lastLogin: [0, 2, 9][i] })) : GENERIC_TEAM;
  const phaseVsMedian = s.daysInPhase - s.phaseMedian;

  return (
    <Page wide>
      <Link href="/demo-admin/cartera" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 16 }}>
        <IconArrowLeft size={14} /> Salud de la cartera
      </Link>

      {/* Cabecera */}
      <div className="rise" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <StartupLogo name={s.name} color={s.color} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="display" style={{ fontSize: 30, margin: 0, lineHeight: 1.15 }}>{s.name}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
            <span>{s.sector} · {s.type}</span>
            <PhasePill n={s.phase} />
            <HealthBadge health={s.health} />
            <span>· Responsable: {s.owner || "sin asignar"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isTurnio && <Link href="/demo" className="btn"><IconExternalLink size={15} /> Abrir su SOI</Link>}
          <button type="button" className="btn btn-primary" onClick={() => setPrep(true)}><IconNotes size={15} /> Preparar weekly</button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="rise d1" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line-2)", marginBottom: 24 }}>
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", padding: "10px 14px", fontSize: 14,
            fontWeight: tab === t ? 650 : 500, color: tab === t ? "var(--ink)" : "var(--muted)",
            borderBottom: `2px solid ${tab === t ? "var(--ink)" : "transparent"}`, marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === "Resumen" && (
        <div key="r" className="rise" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {s.signals.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{s.signals.map((x) => <SignalPill key={x} text={x} />)}</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <Kpi label="Progreso de entregables" value={`${s.progress}%`} sub={`fase ${s.phase} · ${phase.name}`} />
            <Kpi label="MRR" value={`${s.mrr} €`} sub="noviembre" />
            <Kpi label="Pipeline abierto" value={s.pipeline} sub="contactos en el CRM" />
            <Kpi label="Días en la fase" value={s.daysInPhase} sub={phaseVsMedian > 0 ? `${phaseVsMedian} más que la mediana (${s.phaseMedian})` : `mediana de otros ciclos: ${s.phaseMedian}`} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 22, alignItems: "start" }}>
            <section className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 650 }}>MRR</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>Últimos 6 meses</div>
              <Columns data={s.mrrTrend.map((v, i) => ({ label: MONTHS[i], value: v }))} unit=" €" />
            </section>
            <section className="card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Tareas abiertas de las weeklies · {openTasks.length}</div>
              {openTasks.map((t) => (
                <div key={t.text} style={{ padding: "9px 0", borderTop: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.text}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.owner} · vence {t.due}</div>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}

      {tab === "Decisión de fase" && (
        <div key="d" className="rise" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 22, alignItems: "start" }}>
          <section className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Fase {s.phase} · {phase.name}{next ? ` → ${next.name}` : ""}</div>
            <h2 className="display" style={{ fontSize: 26, margin: "6px 0 4px" }}>{next ? `¿Puede ${s.name} pasar a ${next.name}?` : `${s.name} está en la última fase`}</h2>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>Cumple {met} de {gate.length} criterios de salida.</div>
            <GateCriteria criteria={gate} />
            {decision ? (
              <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: decision === "aprobado" ? "var(--green-soft)" : "var(--paper-2)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <IconCheck size={16} color={decision === "aprobado" ? "var(--green)" : "var(--muted)"} />
                {decision === "aprobado" ? `Cambio a ${next?.name} aprobado. El equipo lo verá en su SOI y queda en el historial.` : `Se mantiene en ${phase.name}. El equipo verá qué criterios faltan.`}
              </div>
            ) : next && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
                <button type="button" className="btn" onClick={() => setDecision("mantener")}>Mantener en {phase.name}</button>
                <button type="button" className="btn btn-green" onClick={() => setDecision("aprobado")}>Aprobar cambio de fase</button>
              </div>
            )}
          </section>
          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Tiempo en la fase</div>
              <div style={{ fontSize: 14, lineHeight: 1.55 }}>
                Lleva <strong>{s.daysInPhase} días</strong> en {phase.name}. La mediana de ciclos anteriores es <strong>{s.phaseMedian}</strong>.
              </div>
              <div style={{ position: "relative", height: 8, borderRadius: 8, background: "var(--paper-2)", marginTop: 14 }}>
                <div style={{ width: `${Math.min(100, (s.daysInPhase / (s.phaseMedian * 1.5)) * 100)}%`, height: "100%", borderRadius: 8, background: phaseVsMedian > 0 ? "var(--amber)" : "var(--green)" }} />
                <div title="Mediana" style={{ position: "absolute", left: `${(1 / 1.5) * 100}%`, top: -4, width: 2, height: 16, background: "var(--ink-2)" }} />
              </div>
              <div style={{ position: "relative", height: 16, marginTop: 4 }}>
                <span style={{ position: "absolute", left: `${(1 / 1.5) * 100}%`, transform: "translateX(-50%)", fontSize: 11.5, color: "var(--muted)" }}>mediana</span>
              </div>
            </section>
            <section className="card" style={{ padding: 20, background: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <IconScale size={16} color="var(--muted)" />
                <div className="eyebrow">Recomendación</div>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)" }}>
                {isTurnio
                  ? "Esperar a que se apruebe «Pricing v1» (en revisión desde hace 2 días) y a las 2 validaciones de mockup que faltan. Va por delante de la mediana: no hay prisa."
                  : met === gate.length ? "Cumple todos los criterios: se puede aprobar el cambio." : "Faltan criterios por cumplir. Revisarlos en la próxima weekly."}
              </div>
            </section>
            <div style={{ fontSize: 12, color: "var(--faint)" }}>Los criterios se definen por fase en Configuración → Fases.</div>
          </aside>
        </div>
      )}

      {tab === "Historial" && (
        <div key="h" className="rise">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
            <Kpi label="Tiempo medio de revisión" value="1,8 días" sub="desde que envían hasta que Fusión responde" />
            <Kpi label="Entregables devueltos" value="2 de 9" sub="pidieron cambios al menos una vez" />
            <Kpi label="Cambios de fase" value={s.phase - 1} sub="en este ciclo" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {(["all", ...Object.keys(EVENT_KINDS)] as (EventKind | "all")[]).map((k) => {
              const on = kindFilter === k;
              return (
                <button key={k} type="button" onClick={() => setKindFilter(k)} className="btn" style={{ padding: "5px 11px", fontSize: 12.5, background: on ? "var(--ink)" : undefined, color: on ? "#fff" : undefined, borderColor: on ? "var(--ink)" : undefined }}>
                  {k === "all" ? "Todo" : EVENT_KINDS[k].label}
                </button>
              );
            })}
          </div>
          <section className="card" style={{ padding: "10px 24px" }}>
            {events.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 16, position: "relative", padding: "12px 0" }}>
                <div style={{ width: 92, flexShrink: 0, fontSize: 12.5, color: "var(--muted)", paddingTop: 1 }}>{e.when}</div>
                <div style={{ position: "relative", width: 12, flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 4, left: 1, width: 10, height: 10, borderRadius: "50%", background: EVENT_KINDS[e.kind].color, boxShadow: "0 0 0 3px #fff" }} />
                  {i < events.length - 1 && <span style={{ position: "absolute", top: 16, bottom: -16, left: 5.5, width: 1, background: "var(--line-2)" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: e.kind === "fase" ? 700 : 500 }}>{e.text}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{EVENT_KINDS[e.kind].label} · {e.who}</div>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "Equipo" && (
        <div key="e" className="rise" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {team.map((m) => (
            <div key={m.name} className="card" style={{ padding: 18, display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar initials={m.initials} color={m.color} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 650 }}>{m.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{m.role} · {m.dedication}</div>
                <div style={{ fontSize: 12.5, marginTop: 4, color: m.lastLogin > 7 ? "var(--rose)" : "var(--muted)", fontWeight: m.lastLogin > 7 ? 650 : 400 }}>
                  Último acceso: {m.lastLogin === 0 ? "hoy" : `hace ${m.lastLogin} días`}{m.lastLogin > 7 ? " · sin entrar más de 7 días" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {prep && <WeeklyPrepDrawer startupId={s.id} startup={s.name} onClose={() => setPrep(false)} />}
    </Page>
  );
}
