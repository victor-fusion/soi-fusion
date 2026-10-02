"use client";

import { useState } from "react";
import { IconMapPin, IconSpeakerphone, IconGift, IconCheck } from "@tabler/icons-react";
import { COHORT, CYCLE, EVENTS, PERKS, PHASES } from "../_data";
import { Avatar, Page, PageHeader } from "../_components/ui";

const ANNOUNCEMENTS = [
  { from: "Equipo Fusión", when: "hoy", text: "El jueves cerramos la sala grande a las 17:00 para preparar el Demo Day. Las salas pequeñas siguen disponibles." },
  { from: "Víctor Humanes", when: "ayer", text: "Nuevo playbook en Recursos: «Pricing para SaaS verticales». Muy recomendable si estáis en Solucionar." },
];

export default function ComunidadPage() {
  const [going, setGoing] = useState<Record<string, boolean>>({ "19": true });
  const inOffice = COHORT.reduce((a, c) => a + c.inOffice, 0);

  return (
    <Page wide>
      <PageHeader
        eyebrow={`Fusión Startups · Ciclo ${CYCLE.number}`}
        title="Comunidad"
        subtitle="Las startups con las que compartes ciclo, oficina y aprendizajes."
        actions={<span className="pill" style={{ background: "var(--green-soft)", color: "var(--green-ink)", padding: "7px 14px", fontSize: 13 }}><IconMapPin size={14} /> {inOffice} personas en la oficina hoy</span>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <div className="eyebrow rise d1" style={{ marginBottom: 12 }}>Startups del ciclo {CYCLE.number} · {COHORT.length}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {COHORT.map((c, i) => {
                const phase = PHASES.find((p) => p.n === c.phase)!;
                return (
                  <div key={c.name} className={`card card-hover rise d${Math.min(i + 1, 6)}`} style={{ padding: 18, borderColor: c.isMe ? "#bbf7d0" : undefined, background: undefined }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: c.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{c.name[0]}</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15.5, fontWeight: 700 }}>{c.name}</span>
                          {c.isMe && <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green-ink)", fontSize: 10.5 }}>Vosotros</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{c.tagline}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>
                      <span className="pill" style={{ background: `${phase.color}14`, color: phase.color }}>{phase.name}</span>
                      <span>{c.sector}</span>
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, color: c.inOffice ? "var(--green-ink)" : "var(--faint)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.inOffice ? "var(--green)" : "var(--line-2)" }} />
                        {c.inOffice ? `${c.inOffice} en la oficina` : "Hoy no"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card rise d4" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <IconSpeakerphone size={16} color="var(--green-ink)" />
              <div className="eyebrow">Tablón de Fusión</div>
            </div>
            {ANNOUNCEMENTS.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <Avatar initials={a.from === "Equipo Fusión" ? "F" : "VH"} color="#374151" size={32} />
                <div>
                  <div style={{ fontSize: 13.5 }}><strong>{a.from}</strong> <span style={{ color: "var(--faint)", fontSize: 12 }}>· {a.when}</span></div>
                  <div style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.55 }}>{a.text}</div>
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <section className="card rise d2" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Próximos eventos</div>
            {EVENTS.map((e, i) => (
              <div key={e.title} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ width: 46, textAlign: "center", padding: "6px 0", borderRadius: 10, background: "var(--paper-2)" }}>
                  <div className="display" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{e.date}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{e.month}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 650, lineHeight: 1.3 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.time} · {e.where}</div>
                </div>
                <button type="button" onClick={() => setGoing((g) => ({ ...g, [e.date]: !g[e.date] }))} className={`btn${going[e.date] ? " btn-green" : ""}`} style={{ padding: "5px 10px", fontSize: 12 }}>
                  {going[e.date] ? <><IconCheck size={13} /> Voy</> : "Me apunto"}
                </button>
              </div>
            ))}
          </section>

          <section className="rise d3" style={{ padding: 20, borderRadius: "var(--radius)", background: "#fff", border: "1px solid var(--line)", color: "var(--ink)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <IconGift size={17} color="#16a34a" />
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Ventajas de ser de Fusión</div>
            </div>
            {PERKS.map((p) => (
              <div key={p.title} style={{ padding: "9px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 13.5, fontWeight: 650, color: "var(--ink)" }}>{p.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>{p.detail}</div>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </Page>
  );
}
