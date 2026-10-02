"use client";

import Link from "next/link";
import { IconUserPlus, IconWorld, IconPencil } from "@tabler/icons-react";
import { FUSION_TEAM, STARTUP, TEAM } from "../_data";
import { Avatar, Page, PageHeader } from "../_components/ui";

const WEEK = ["L", "M", "X", "J", "V"];

export default function EquipoPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Startup"
        title="Equipo"
        subtitle="Quién forma Turnio, cuándo está cada uno en la oficina y quién os acompaña desde Fusión."
        actions={<button type="button" className="btn btn-primary"><IconUserPlus size={15} /> Invitar al equipo</button>}
      />

      {/* Ficha de la startup */}
      <section className="card rise d1" style={{ padding: 24, display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--green)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 28 }}>T</div>
        <div style={{ flex: 1 }}>
          <div className="display" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.1 }}>{STARTUP.name}</div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 4 }}>{STARTUP.tagline}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
            <span>{STARTUP.sector}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconWorld size={14} /> turnio.vet</span>
          </div>
        </div>
        <button type="button" className="btn"><IconPencil size={14} /> Editar</button>
      </section>

      <div className="eyebrow rise d2" style={{ marginBottom: 12 }}>El equipo · {TEAM.length}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {TEAM.map((m, i) => (
          <div key={m.name} className={`card rise d${i + 2}`} style={{ padding: 20 }}>
            <Avatar initials={m.initials} color={m.color} size={46} />
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>{m.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{m.role}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <span className="pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>{m.type}</span>
              <span className="pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>{m.dedication}</span>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--line-2)" }}>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 7 }}>En la oficina</div>
              <div style={{ display: "flex", gap: 5 }}>
                {WEEK.map((d) => {
                  const on = m.office.includes(d);
                  return (
                    <span key={d} style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: on ? `${m.color}18` : "var(--paper-2)", color: on ? m.color : "var(--faint)" }}>{d}</span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="eyebrow rise d4" style={{ marginBottom: 12 }}>Os acompaña desde Fusión</div>
      {FUSION_TEAM.map((f) => (
        <section key={f.name} className="rise d5" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, borderRadius: "var(--radius)", background: "var(--forest)", color: "#ecfdf3" }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#ecfdf3", color: "var(--forest)", display: "grid", placeItems: "center", fontWeight: 800 }}>{f.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.name}</div>
            <div style={{ fontSize: 13, color: "rgba(236,253,243,0.65)" }}>{f.role} · weekly los martes 10:00</div>
          </div>
          <Link href="/demo/agenda" className="btn" style={{ background: "#4ade80", borderColor: "#4ade80", color: "#0f2a1d" }}>Reservar un hueco</Link>
        </section>
      ))}
    </Page>
  );
}
