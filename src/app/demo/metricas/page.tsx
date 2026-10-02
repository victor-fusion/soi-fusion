"use client";

import { useState } from "react";
import { IconPlus, IconX, IconTable, IconChartBar } from "@tabler/icons-react";
import { METRICS, STARTUP } from "../_data";
import { Page, PageHeader } from "../_components/ui";

const GREEN = "#16A34A";
const W = 460;
const H = 190;
const PAD = { top: 16, right: 16, bottom: 26, left: 40 };

type Point = { label: string; value: number };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / pow / (v / pow > 5 ? 2 : 1)) * pow * (v / pow > 5 ? 2 : 1);
}

function Axes({ max, n, labels }: { max: number; n: number; labels: string[] }) {
  const ih = H - PAD.top - PAD.bottom;
  const ticks = [0, max / 2, max];
  const step = (W - PAD.left - PAD.right) / n;
  return (
    <g>
      {ticks.map((t) => {
        const y = PAD.top + ih - (t / max) * ih;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#ece7de" strokeWidth={1} />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#a8a29e">{Number.isInteger(t) ? t.toLocaleString("es-ES") : t.toFixed(1)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={l} x={PAD.left + step * i + step / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#78716c">{l}</text>
      ))}
    </g>
  );
}

function Tooltip({ x, y, label, value, unit }: { x: number; y: number; label: string; value: number; unit: string }) {
  return (
    <div style={{
      position: "absolute", left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, transform: "translate(-50%, calc(-100% - 10px))",
      background: "var(--ink)", color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12, whiteSpace: "nowrap", pointerEvents: "none",
    }}>
      <strong style={{ fontSize: 13 }}>{value.toLocaleString("es-ES")}{unit}</strong> <span style={{ opacity: 0.7 }}>· {label}</span>
    </div>
  );
}

/** Columnas: magnitud por mes. Hover por columna. */
function Columns({ data, unit }: { data: Point[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ih = H - PAD.top - PAD.bottom;
  const step = (W - PAD.left - PAD.right) / data.length;
  const bw = Math.min(24, step * 0.5);
  const r = 4;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}${unit}`).join(", ")}>
        <Axes max={max} n={data.length} labels={data.map((d) => d.label)} />
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = PAD.left + step * i + step / 2 - bw / 2;
          const y = PAD.top + ih - h;
          const last = i === data.length - 1;
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={PAD.left + step * i} y={PAD.top} width={step} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${y + ih * 0 + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${y + h} Z`}
                  fill={GREEN} opacity={hover === null || hover === i ? (last ? 1 : 0.55) : 0.3}
                />
              )}
              {last && <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1c1917">{d.value.toLocaleString("es-ES")}{unit}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && (() => {
        const d = data[hover];
        const x = PAD.left + step * hover + step / 2;
        const y = PAD.top + ih - (d.value / max) * ih;
        return <Tooltip x={x} y={y} label={d.label} value={d.value} unit={unit} />;
      })()}
    </div>
  );
}

/** Línea con área: evolución. Crosshair que se ajusta al mes más cercano. */
function Line({ data, unit }: { data: Point[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ih = H - PAD.top - PAD.bottom;
  const step = (W - PAD.left - PAD.right) / data.length;
  const pts = data.map((d, i) => ({ x: PAD.left + step * i + step / 2, y: PAD.top + ih - (d.value / max) * ih }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts.at(-1)!.x},${PAD.top + ih} L${pts[0].x},${PAD.top + ih} Z`;
  const end = pts.at(-1)!;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={data.map((d) => `${d.label}: ${d.value}${unit}`).join(", ")}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.max(0, Math.min(data.length - 1, Math.round((x - PAD.left - step / 2) / step))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <Axes max={max} n={data.length} labels={data.map((d) => d.label)} />
        <path d={area} fill={GREEN} opacity={0.1} />
        <path d={line} fill="none" stroke={GREEN} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && <line x1={pts[hover].x} x2={pts[hover].x} y1={PAD.top} y2={PAD.top + ih} stroke="#a8a29e" strokeWidth={1} />}
        {hover !== null && <circle cx={pts[hover].x} cy={pts[hover].y} r={5} fill={GREEN} stroke="#fff" strokeWidth={2} />}
        <circle cx={end.x} cy={end.y} r={4.5} fill={GREEN} stroke="#fff" strokeWidth={2} />
        <text x={end.x - 8} y={end.y - 10} textAnchor="end" fontSize={12} fontWeight={700} fill="#1c1917">{data.at(-1)!.value.toLocaleString("es-ES")}{unit}</text>
      </svg>
      {hover !== null && <Tooltip x={pts[hover].x} y={pts[hover].y} label={data[hover].label} value={data[hover].value} unit={unit} />}
    </div>
  );
}

const CHARTS = [
  { key: "mrr" as const, title: "MRR", unit: " €", kind: "columns", note: "Ingresos recurrentes al mes" },
  { key: "pilots" as const, title: "Clínicas en piloto", unit: "", kind: "columns", note: "Tu métrica norte · objetivo 10" },
  { key: "users" as const, title: "Usuarios activos", unit: "", kind: "line", note: "Recepcionistas y veterinarios que usan Turnio" },
  { key: "interviews" as const, title: "Entrevistas acumuladas", unit: "", kind: "line", note: "Desde el inicio de Descubrir" },
];

export default function MetricasPage() {
  const [table, setTable] = useState(false);
  const [modal, setModal] = useState(false);
  const last = METRICS.at(-1)!;
  const prev = METRICS.at(-2)!;
  const delta = last.mrr - prev.mrr;
  const ns = STARTUP.northStar;

  return (
    <Page wide>
      <PageHeader
        eyebrow="Trabajo"
        title="Métricas"
        subtitle="Lo que registras cada mes. Fusión las ve en el Centro de Control y te ayudan a preparar la ronda."
        actions={
          <>
            <button type="button" className="btn" onClick={() => setTable((t) => !t)}>
              {table ? <IconChartBar size={15} /> : <IconTable size={15} />} {table ? "Ver gráficas" : "Ver tabla"}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setModal(true)}><IconPlus size={15} /> Registrar noviembre</button>
          </>
        }
      />

      {/* Cifra principal + métrica norte */}
      <div className="rise d1" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, marginBottom: 22 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>MRR de noviembre</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>{last.mrr} €</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--green-ink)" }}>+{delta} € vs. octubre</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{last.pilots} clínicas · 2 ya pagan tras el piloto</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Métrica norte · {ns.metric}</div>
          <div style={{ fontSize: 34, fontWeight: 650, marginTop: 6 }}>{ns.value} <span style={{ fontSize: 16, color: "var(--muted)", fontWeight: 500 }}>de {ns.target}</span></div>
          <div style={{ height: 8, borderRadius: 8, background: "#dcfce7", marginTop: 14 }}>
            <div style={{ width: `${(ns.value / ns.target) * 100}%`, height: "100%", borderRadius: 8, background: GREEN }} />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>Objetivo al terminar la fase Vender (semana 18)</div>
        </div>
      </div>

      {table ? (
        <div className="card rise" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--paper-2)" }}>
                {["Mes", ...CHARTS.map((c) => c.title)].map((h, i) => (
                  <th key={h} style={{ textAlign: i ? "right" : "left", padding: "12px 18px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.month} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "11px 18px", fontWeight: 600, textTransform: "capitalize" }}>{m.month}</td>
                  {CHARTS.map((c) => (
                    <td key={c.key} style={{ padding: "11px 18px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m[c.key].toLocaleString("es-ES")}{c.unit}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {CHARTS.map((c, i) => {
            const data = METRICS.map((m) => ({ label: m.month, value: m[c.key] }));
            return (
              <section key={c.key} className={`card rise d${i + 2}`} style={{ padding: "20px 20px 10px" }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>{c.note}</div>
                {c.kind === "columns" ? <Columns data={data} unit={c.unit} /> : <Line data={data} unit={c.unit} />}
              </section>
            );
          })}
        </div>
      )}

      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.3)", zIndex: 50, display: "grid", placeItems: "center", padding: 24 }}>
          <div className="card rise" style={{ width: "100%", maxWidth: 520, padding: 28, position: "relative" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)} style={{ position: "absolute", top: 14, right: 14, padding: 6 }}><IconX size={18} /></button>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>Métricas de noviembre</h2>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px" }}>Te llevará 2 minutos. Te lo recordaremos el día 1 de cada mes.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["MRR (€)", "178"], ["Facturación del mes (€)", "178"], ["Clínicas en piloto", "4"], ["Clientes de pago", "2"], ["Usuarios activos", "17"], ["Burn rate (€/mes)", "2.400"]].map(([l, v]) => (
                <label key={l} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>
                  {l}
                  <input className="field" defaultValue={v} style={{ marginTop: 6 }} />
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
              <button type="button" className="btn" onClick={() => setModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-green" onClick={() => setModal(false)}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
