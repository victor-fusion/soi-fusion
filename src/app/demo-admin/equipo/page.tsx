"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Avatar, Page, PageHeader } from "../../demo/_components/ui";
import { FUSION_TEAM_LOAD, PORTFOLIO } from "../_data";
import { StartupLogo } from "../_components/admin-ui";

// Carga relativa: cada startup cuenta 2, cada revisión pendiente 1 y cada weekly 1.
const load = (p: (typeof FUSION_TEAM_LOAD)[number]) => p.startups.length * 2 + p.reviews + p.weeklies;

export default function EquipoFusionPage() {
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [picking, setPicking] = useState<string | null>(null);

  const unassigned = PORTFOLIO.filter((s) => !s.owner);
  const team = FUSION_TEAM_LOAD.map((p) => ({
    ...p,
    startups: [...p.startups, ...Object.entries(assigned).filter(([, o]) => o === p.name).map(([id]) => PORTFOLIO.find((s) => s.id === id)!.name)],
  }));
  const maxLoad = Math.max(...team.map(load));

  return (
    <Page wide>
      <PageHeader eyebrow="Programa" title="Equipo Fusión" subtitle="Quién lleva qué y cuánto tiene encima esta semana." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {team.map((p, i) => {
          const l = load(p);
          const pct = Math.round((l / maxLoad) * 100);
          return (
            <section key={p.name} className={`card rise d${Math.min(i + 1, 6)}`} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={p.initials} color={p.color} size={42} />
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 650 }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{p.role}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {p.startups.map((s) => <span key={s} className="pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>{s}</span>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                <div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>Revisiones pendientes</div><div className="display" style={{ fontSize: 20 }}>{p.reviews}</div></div>
                <div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>Weeklies esta semana</div><div className="display" style={{ fontSize: 20 }}>{p.weeklies}</div></div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted)", marginBottom: 5 }}>
                  <span>Carga relativa</span><span>{pct >= 85 ? "Alta" : pct >= 50 ? "Media" : "Baja"}</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: "var(--paper-2)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: pct >= 85 ? "var(--amber)" : "var(--ink-2)", transition: "width 0.3s" }} />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="card rise d4" style={{ padding: "18px 0 6px", marginTop: 24 }}>
        <div style={{ padding: "0 22px 10px" }}>
          <div style={{ fontSize: 15, fontWeight: 650 }}>Startups sin responsable asignado</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Sin responsable, nadie recibe sus avisos ni prepara sus weeklies.</div>
        </div>
        {unassigned.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderTop: "1px solid var(--line)" }}>
            <StartupLogo name={s.name} color={s.color} size={30} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.sector} · fase {s.phase}</div>
            </div>
            {assigned[s.id] ? (
              <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green-ink)" }}><IconCheck size={12} /> Asignada a {assigned[s.id]}</span>
            ) : picking === s.id ? (
              <select className="field" autoFocus style={{ width: "auto", padding: "6px 10px", fontSize: 13 }} defaultValue=""
                onChange={(e) => { setAssigned((a) => ({ ...a, [s.id]: e.target.value })); setPicking(null); }}>
                <option value="" disabled>Elegir responsable…</option>
                {FUSION_TEAM_LOAD.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            ) : (
              <button type="button" className="btn" style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setPicking(s.id)}>Asignar</button>
            )}
          </div>
        ))}
      </section>
    </Page>
  );
}
