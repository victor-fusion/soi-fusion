"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconInfoCircle } from "@tabler/icons-react";
import { CYCLE, PHASES } from "../../demo/_data";
import { Avatar, Page, PageHeader, Sparkline } from "../../demo/_components/ui";
import { FUSION_TEAM_LOAD, HEALTH, PORTFOLIO, SIGNAL_RULES, type Health } from "../_data";
import { HealthBadge, PhasePill, SignalPill, StartupLogo } from "../_components/admin-ui";

const daysLabel = (d: number) => (d === 0 ? "hoy" : d === 1 ? "ayer" : `hace ${d} d`);

export default function CarteraPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<number | "all">("all");
  const [owner, setOwner] = useState<string>("all");
  const [health, setHealth] = useState<Health | "all">("all");

  const rows = useMemo(() => PORTFOLIO
    .filter((s) => phase === "all" || s.phase === phase)
    .filter((s) => owner === "all" || s.owner === owner)
    .filter((s) => health === "all" || s.health === health)
    .sort((a, b) => HEALTH[a.health].order - HEALTH[b.health].order || b.signals.length - a.signals.length),
  [phase, owner, health]);

  const counts = (h: Health) => PORTFOLIO.filter((s) => s.health === h).length;

  return (
    <Page wide>
      <PageHeader
        eyebrow={`Ciclo ${CYCLE.number} · Semana ${CYCLE.week}`}
        title="Salud de la cartera"
        subtitle="Las señales se calculan solas con lo que las startups registran. Lo importante es lo que dejan de hacer."
      />

      {/* Filtros */}
      <div className="rise d1" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <select className="field" style={selectStyle} value={CYCLE.number} disabled><option>Ciclo {CYCLE.number}</option></select>
        <select className="field" style={selectStyle} value={phase} onChange={(e) => setPhase(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">Todas las fases</option>
          {PHASES.map((p) => <option key={p.n} value={p.n}>{p.n} · {p.name}</option>)}
        </select>
        <select className="field" style={selectStyle} value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="all">Todos los responsables</option>
          {FUSION_TEAM_LOAD.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          <option value="">Sin responsable</option>
        </select>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {(["all", "riesgo", "atencion", "bien"] as const).map((h) => {
            const on = health === h;
            return (
              <button key={h} type="button" onClick={() => setHealth(h)} className="btn" style={{
                padding: "6px 12px", fontSize: 12.5,
                background: on ? "var(--ink)" : undefined, color: on ? "#fff" : undefined, borderColor: on ? "var(--ink)" : undefined,
              }}>
                {h === "all" ? `Todas · ${PORTFOLIO.length}` : `${HEALTH[h].label} · ${counts(h)}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla */}
      <div className="card rise d2" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 1040 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12 }}>
              {["Startup", "Fase", "Salud", "Señales", "Progreso", "MRR · 6 meses", "Última weekly", "Último acceso", "Responsable"].map((h) => (
                <th key={h} style={{ padding: "14px 16px", fontWeight: 600, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="row-hover" onClick={() => router.push(`/demo-admin/startups/${s.id}`)} style={{ cursor: "pointer", borderBottom: "1px solid var(--line)" }}>
                <td style={cell}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <StartupLogo name={s.name} color={s.color} size={30} />
                    <div>
                      <div style={{ fontWeight: 650 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.sector} · {s.type}</div>
                    </div>
                  </div>
                </td>
                <td style={cell}><PhasePill n={s.phase} /></td>
                <td style={cell}><HealthBadge health={s.health} /></td>
                <td style={{ ...cell, maxWidth: 280 }}>
                  {s.signals.length === 0 ? <span style={{ color: "var(--faint)" }}>—</span> : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {s.signals.slice(0, 2).map((x) => <SignalPill key={x} text={x} />)}
                      {s.signals.length > 2 && <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>+{s.signals.length - 2}</span>}
                    </div>
                  )}
                </td>
                <td style={cell}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 70, height: 5, borderRadius: 5, background: "var(--paper-2)" }}>
                      <div style={{ width: `${s.progress}%`, height: "100%", borderRadius: 5, background: "var(--green)" }} />
                    </div>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{s.progress}%</span>
                  </div>
                </td>
                <td style={cell}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Sparkline values={s.mrrTrend} color={s.health === "riesgo" && s.mrr > 0 ? "var(--rose)" : "var(--ink-2)"} />
                    <span style={{ fontWeight: 650, whiteSpace: "nowrap" }}>{s.mrr} €</span>
                  </div>
                </td>
                <td style={{ ...cell, color: s.lastWeekly > 10 ? "var(--rose)" : "var(--ink-2)", fontWeight: s.lastWeekly > 10 ? 650 : 400 }}>{daysLabel(s.lastWeekly)}</td>
                <td style={{ ...cell, color: s.lastLogin > 7 ? "var(--rose)" : "var(--ink-2)", fontWeight: s.lastLogin > 7 ? 650 : 400 }}>{daysLabel(s.lastLogin)}</td>
                <td style={cell}>
                  {s.owner ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initials={s.owner.split(" ").map((w) => w[0]).join("")} size={26} />
                      <span style={{ fontSize: 12.5 }}>{s.owner.split(" ")[0]}</span>
                    </div>
                  ) : <span className="pill" style={{ background: "#FEF3C7", color: "var(--amber)" }}>Sin asignar</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Ninguna startup con estos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reglas */}
      <section className="card rise d3" style={{ padding: 22, marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <IconInfoCircle size={16} color="var(--muted)" />
          <div className="eyebrow">Cómo se calcula</div>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 12px" }}>
          Son reglas simples sobre los datos de SOI, no IA. «En riesgo» = 2 o más señales; «Atención» = 1.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "4px 24px" }}>
          {SIGNAL_RULES.map((r) => (
            <div key={r.signal} style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
              <div style={{ fontSize: 13.5, fontWeight: 650 }}>{r.signal}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{r.rule}</div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}

const selectStyle: React.CSSProperties = { width: "auto", padding: "7px 10px", fontSize: 13 };
const cell: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };
