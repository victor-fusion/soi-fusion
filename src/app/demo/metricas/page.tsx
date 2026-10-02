"use client";

import { useState } from "react";
import { IconPlus, IconX, IconTable, IconChartBar } from "@tabler/icons-react";
import { METRICS, STARTUP } from "../_data";
import { Page, PageHeader } from "../_components/ui";
import { Columns, GREEN, Line } from "../_components/charts";

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
