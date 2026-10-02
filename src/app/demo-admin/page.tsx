"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronRight, IconClock } from "@tabler/icons-react";
import { CYCLE, TODAY_LABEL } from "../demo/_data";
import { Kpi, Page, PageHeader, SectionTitle } from "../demo/_components/ui";
import { HEALTH, MEETINGS_TODAY, PORTFOLIO, RECENT_ACTIVITY, REVIEW_QUEUE, REVIEW_TYPES, ADMIN_ME } from "./_data";
import { useResolved } from "./_components/review-store";
import { HealthBadge, PhasePill, SignalPill, StartupLogo, WeeklyPrepDrawer } from "./_components/admin-ui";

export default function AdminHoyPage() {
  const [prep, setPrep] = useState<(typeof MEETINGS_TODAY)[number] | null>(null);

  const attention = PORTFOLIO.filter((s) => s.health !== "bien").sort((a, b) => HEALTH[a.health].order - HEALTH[b.health].order);
  const done = useResolved();
  const queue = REVIEW_QUEUE.filter((q) => !done.has(q.id));
  const atRisk = PORTFOLIO.filter((s) => s.health === "riesgo").length;

  return (
    <Page wide>
      <PageHeader
        eyebrow={`${TODAY_LABEL} · Ciclo ${CYCLE.number} · Semana ${CYCLE.week}`}
        title={`Buenos días, ${ADMIN_ME.first}`}
        subtitle="Lo que necesita a Fusión hoy, en una sola pantalla."
      />

      <div className="rise d1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <Kpi label="Esperan tu revisión" value={queue.length} sub={`${queue.filter((r) => r.high).length} con prioridad alta`} />
        <Kpi label="Startups en riesgo" value={atRisk} sub={`y ${attention.length - atRisk} que piden atención`} />
        <Kpi label="Weeklies hoy" value={MEETINGS_TODAY.length} sub="prepáralas en un clic" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Necesitan atención */}
          <section className="card rise d2" style={{ padding: "18px 0 6px" }}>
            <div style={{ padding: "0 22px" }}>
              <SectionTitle aside={<Link href="/demo-admin/cartera" style={{ textDecoration: "none" }}>Ver toda la cartera →</Link>}>Necesitan tu atención</SectionTitle>
            </div>
            {attention.map((s) => (
              <Link key={s.id} href={`/demo-admin/startups/${s.id}`} className="row-hover"
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", borderTop: "1px solid var(--line)", textDecoration: "none" }}>
                <StartupLogo name={s.name} color={s.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 650 }}>{s.name}</span>
                    <PhasePill n={s.phase} />
                  </div>
                  <div style={{ marginTop: 6 }}><SignalPill text={s.signals[0]} />{s.signals.length > 1 && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>+{s.signals.length - 1}</span>}</div>
                </div>
                <HealthBadge health={s.health} />
                <IconChevronRight size={16} color="var(--faint)" />
              </Link>
            ))}
          </section>

          {/* Cola de revisión resumida */}
          <section className="card rise d3" style={{ padding: "18px 0 6px" }}>
            <div style={{ padding: "0 22px" }}>
              <SectionTitle aside={<Link href="/demo-admin/revision" style={{ textDecoration: "none" }}>Ver todo ({queue.length}) →</Link>}>Cola de revisión</SectionTitle>
            </div>
            {queue.slice(0, 4).map((r) => (
              <Link key={r.id} href="/demo-admin/revision" className="row-hover"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderTop: "1px solid var(--line)", textDecoration: "none" }}>
                <span className="pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)", minWidth: 92, justifyContent: "center" }}>{REVIEW_TYPES[r.type].label}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.startup} · {r.by} · {r.when}</div>
                </div>
                {r.high && <span className="pill" style={{ background: "#FFF1F2", color: "var(--rose)" }}>Prioridad alta</span>}
              </Link>
            ))}
          </section>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Reuniones */}
          <section className="card rise d2" style={{ padding: 20 }}>
            <SectionTitle>Tus weeklies de hoy</SectionTitle>
            {MEETINGS_TODAY.map((m, i) => (
              <div key={m.startupId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ width: 48, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><IconClock size={13} color="var(--faint)" />{m.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>{m.startup}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{m.with}</div>
                </div>
                <button type="button" className="btn" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setPrep(m)}>Preparar</button>
              </div>
            ))}
          </section>

          {/* Lo nuevo */}
          <section className="card rise d3" style={{ padding: 20 }}>
            <SectionTitle>Lo nuevo desde ayer</SectionTitle>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--line-2)", marginTop: 7, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.45 }}><strong style={{ color: "var(--ink)" }}>{a.who}</strong> {a.text}</div>
                  <div style={{ fontSize: 12, color: "var(--faint)" }}>{a.when}</div>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      {prep && <WeeklyPrepDrawer startupId={prep.startupId} startup={prep.startup} time={prep.time} onClose={() => setPrep(null)} />}
    </Page>
  );
}
