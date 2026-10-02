"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChartDots } from "@tabler/icons-react";
import { CYCLE, PHASES } from "../../demo/_data";
import { Page, PageHeader } from "../../demo/_components/ui";
import { CYCLE_MEDIANS, LEARNINGS, PORTFOLIO } from "../_data";
import { StartupLogo } from "../_components/admin-ui";

// Ciclos anteriores en grises (ordenados, del más antiguo al más reciente) y el actual con el acento verde.
const CYCLE_FILL: Record<number, string> = { 3: "#d1d5db", 4: "#9ca3af", 5: "#6b7280", 6: "#16A34A" };

const W = 560, H = 220, PAD = { top: 26, right: 16, bottom: 30, left: 40 };

function MedianBars({ phaseIdx }: { phaseIdx: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = CYCLE_MEDIANS.map((c) => ({ cycle: c.cycle, value: c.days[phaseIdx] }));
  const max = Math.ceil(Math.max(...data.map((d) => d.value ?? 0), 10) / 10) * 10;
  const ih = H - PAD.top - PAD.bottom;
  const step = (W - PAD.left - PAD.right) / data.length;
  const bw = Math.min(56, step * 0.5);
  const r = 4;
  const ticks = [0, max / 2, max];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={data.map((d) => `Ciclo ${d.cycle}: ${d.value ?? "en curso"} días`).join(", ")}>
        {ticks.map((t) => {
          const y = PAD.top + ih - (t / max) * ih;
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#f3f4f6" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#9ca3af">{t}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const cx = PAD.left + step * i + step / 2;
          const x = cx - bw / 2;
          const base = PAD.top + ih;
          if (d.value === null) {
            return (
              <g key={d.cycle}>
                <rect x={x} y={base - 40} width={bw} height={40} rx={r} fill="none" stroke="#16A34A" strokeDasharray="4 4" strokeWidth={1.5} />
                <text x={cx} y={base - 48} textAnchor="middle" fontSize={11.5} fill="#15803d" fontWeight={600}>en curso</text>
                <text x={cx} y={H - 8} textAnchor="middle" fontSize={12} fill="#374151" fontWeight={700}>Ciclo {d.cycle}</text>
              </g>
            );
          }
          const h = (d.value / max) * ih;
          const y = base - h;
          return (
            <g key={d.cycle} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={PAD.left + step * i} y={PAD.top} width={step} height={ih} fill="transparent" />
              <path d={`M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${base} Z`}
                fill={CYCLE_FILL[d.cycle]} opacity={hover === null || hover === i ? 1 : 0.5} />
              <text x={cx} y={y - 7} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#111827">{d.value} d</text>
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={12} fill={d.cycle === CYCLE.number ? "#111827" : "#6b7280"} fontWeight={d.cycle === CYCLE.number ? 700 : 500}>Ciclo {d.cycle}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover].value !== null && (() => {
        const c = CYCLE_MEDIANS[hover];
        const x = PAD.left + step * hover + step / 2;
        return (
          <div style={{ position: "absolute", left: `${(x / W) * 100}%`, top: 0, transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12, whiteSpace: "nowrap", pointerEvents: "none" }}>
            <strong>Ciclo {c.cycle}</strong> · {c.days[phaseIdx]} días · {c.completed[phaseIdx]} % la completó · MRR al salir {c.mrrOut[phaseIdx]} €
          </div>
        );
      })()}
    </div>
  );
}

export default function CiclosPage() {
  const [phaseN, setPhaseN] = useState(2);
  const idx = phaseN - 1;
  const phase = PHASES[idx];
  const inPhase = PORTFOLIO.filter((s) => s.phase === phaseN);

  const status = (days: number, median: number) =>
    days > median ? { label: "Por encima de la mediana", color: "var(--rose)", bg: "#FFF1F2" }
      : days >= median * 0.8 ? { label: "Cerca de la mediana", color: "var(--amber)", bg: "#FEF3C7" }
        : { label: "En plazo", color: "var(--green-ink)", bg: "var(--green-soft)" };

  return (
    <Page wide>
      <PageHeader eyebrow="Programa" title="Ciclos" subtitle={`Cómo va el ciclo ${CYCLE.number} frente a los anteriores, fase a fase.`} />

      <div className="rise d1" style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {PHASES.map((p) => {
          const on = p.n === phaseN;
          return (
            <button key={p.n} type="button" onClick={() => setPhaseN(p.n)} className="btn" style={{ padding: "6px 12px", fontSize: 12.5, background: on ? "var(--ink)" : undefined, color: on ? "#fff" : undefined, borderColor: on ? "var(--ink)" : undefined }}>
              {p.n} · {p.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 22, alignItems: "start" }}>
        <section className="card rise d2" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 650 }}>Días en {phase.name} · mediana por ciclo</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>Menos es mejor. Pasa el ratón por una barra para ver más.</div>
          <MedianBars phaseIdx={idx} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 14 }}>
            <thead>
              <tr style={{ color: "var(--muted)", fontSize: 12, textAlign: "right" }}>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 600 }}>Ciclo</th>
                <th style={{ padding: "6px 0", fontWeight: 600 }}>Completaron la fase</th>
                <th style={{ padding: "6px 0", fontWeight: 600 }}>MRR medio al salir</th>
              </tr>
            </thead>
            <tbody>
              {CYCLE_MEDIANS.map((c) => (
                <tr key={c.cycle} style={{ borderTop: "1px solid var(--line)", textAlign: "right" }}>
                  <td style={{ textAlign: "left", padding: "7px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: CYCLE_FILL[c.cycle] }} /> Ciclo {c.cycle}
                  </td>
                  <td>{c.completed[idx] === null ? "en curso" : `${c.completed[idx]} %`}</td>
                  <td>{c.mrrOut[idx] === null ? "—" : `${c.mrrOut[idx]} €`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card rise d3" style={{ padding: "18px 0 6px" }}>
          <div style={{ padding: "0 22px 10px" }}>
            <div style={{ fontSize: 15, fontWeight: 650 }}>Startups del ciclo {CYCLE.number} en {phase.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Días en la fase frente a la mediana de ciclos anteriores.</div>
          </div>
          {inPhase.length === 0 && <div style={{ padding: "16px 22px", fontSize: 14, color: "var(--muted)", borderTop: "1px solid var(--line)" }}>Ninguna startup del ciclo está en esta fase ahora mismo.</div>}
          {inPhase.map((s) => {
            const st = status(s.daysInPhase, s.phaseMedian);
            return (
              <Link key={s.id} href={`/demo-admin/startups/${s.id}`} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 22px", borderTop: "1px solid var(--line)", textDecoration: "none" }}>
                <StartupLogo name={s.name} color={s.color} size={28} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>{s.daysInPhase} / {s.phaseMedian} d</span>
                <span className="pill" style={{ background: st.bg, color: st.color, minWidth: 150, justifyContent: "center" }}>{st.label}</span>
              </Link>
            );
          })}
        </section>
      </div>

      <section className="card rise d4" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <IconChartDots size={17} color="var(--muted)" />
          <div style={{ fontSize: 16, fontWeight: 700 }}>Qué tienen en común las startups que mejor avanzan</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>SOI lo calcula cruzando entregables, recursos usados, mentores y tiempos de cada ciclo. Son datos, no opiniones.</div>
        {LEARNINGS.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "11px 0", borderTop: "1px solid var(--line)" }}>
            <span className="display" style={{ fontSize: 15, color: "var(--faint)", width: 18 }}>{i + 1}</span>
            <div style={{ flex: 1, fontSize: 14.5, lineHeight: 1.5 }}>{l.text}</div>
            <span style={{ fontSize: 12, color: "var(--faint)", whiteSpace: "nowrap" }}>{l.base}</span>
          </div>
        ))}
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12 }}>Con 3 ciclos de datos esto deja de ser anécdota.</div>
      </section>
    </Page>
  );
}
