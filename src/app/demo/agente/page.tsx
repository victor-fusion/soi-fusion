"use client";

import { useState } from "react";
import { IconRobot, IconCheck, IconX, IconPencil, IconBrandLinkedin, IconMail, IconTarget, IconShieldCheck } from "@tabler/icons-react";
import { SDR_PROPOSALS, SDR_STATS } from "../_data";
import { Page, PageHeader } from "../_components/ui";

const ICP = [
  ["Sector", "Clínicas y hospitales veterinarios"],
  ["Tamaño", "2–15 veterinarios"],
  ["Decisor", "Director/a, gerente o socio"],
  ["Zona", "Sevilla y provincia"],
  ["Señales", "Nueva sede, ofertas de recepción, reseñas sobre citas"],
];

type Decision = "aprobado" | "descartado";

export default function AgentePage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>(Object.fromEntries(SDR_PROPOSALS.map((p) => [p.id, p.message])));

  const pending = SDR_PROPOSALS.filter((p) => !decisions[p.id]);
  const approved = SDR_PROPOSALS.filter((p) => decisions[p.id] === "aprobado");

  return (
    <Page wide>
      <PageHeader
        eyebrow="Trabajo · Agente de IA"
        title="Agente SDR"
        subtitle="Busca clínicas que encajan con tu ICP, investiga por qué y te propone el primer mensaje. Nada se envía sin tu aprobación y el visto bueno de Fusión."
        actions={
          <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green-ink)", padding: "7px 14px", fontSize: 13 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} /> Activo · prospectando
          </span>
        }
      />

      <div className="rise d1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
        {[
          ["Mensajes enviados", SDR_STATS.sent, "este ciclo"],
          ["Respuestas", SDR_STATS.replied, `${SDR_STATS.replyRate}% de respuesta`],
          ["Reuniones", SDR_STATS.meetings, "agendadas desde el agente"],
          ["Por revisar", pending.length, "propuestas nuevas"],
        ].map(([l, v, s]) => (
          <div key={String(l)} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500 }}>{l}</div>
            <div className="display" style={{ fontSize: 32, fontWeight: 500, marginTop: 4 }}>{v}</div>
            <div style={{ fontSize: 12, color: "var(--faint)" }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="eyebrow rise d2">Propuestas para revisar · {pending.length}</div>
          {pending.length === 0 && (
            <div className="card rise" style={{ padding: 36, textAlign: "center" }}>
              <IconCheck size={28} color="var(--green)" />
              <div className="display" style={{ fontSize: 22, marginTop: 8 }}>Todo revisado</div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>El agente te avisará cuando tenga nuevas propuestas.</div>
            </div>
          )}
          {pending.map((p, i) => (
            <article key={p.id} className={`card rise d${i + 2}`} style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16.5, fontWeight: 700 }}>{p.company}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{p.contact} · {p.role}</div>
                </div>
                <span className="pill" style={{ background: "var(--paper-2)", color: "var(--ink-2)", alignSelf: "flex-start" }}>
                  {p.channel === "LinkedIn" ? <IconBrandLinkedin size={13} /> : <IconMail size={13} />} {p.channel}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "#f0f7ff", fontSize: 13, color: "#1e3a8a", lineHeight: 1.5 }}>
                <IconTarget size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Por qué encaja:</strong> {p.reason}</span>
              </div>
              {editing === p.id ? (
                <textarea className="field" rows={5} value={texts[p.id]} onChange={(e) => setTexts((t) => ({ ...t, [p.id]: e.target.value }))} style={{ marginTop: 14, lineHeight: 1.55 }} />
              ) : (
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-2)", margin: "14px 0 0", padding: "12px 14px", borderLeft: "3px solid var(--line-2)", background: "#fffdf9", borderRadius: "0 10px 10px 0" }}>
                  {texts[p.id]}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setDecisions((d) => ({ ...d, [p.id]: "descartado" }))}><IconX size={15} /> Descartar</button>
                <button type="button" className="btn" onClick={() => setEditing(editing === p.id ? null : p.id)}><IconPencil size={15} /> {editing === p.id ? "Listo" : "Editar"}</button>
                <button type="button" className="btn btn-green" onClick={() => { setDecisions((d) => ({ ...d, [p.id]: "aprobado" })); setEditing(null); }}><IconCheck size={15} /> Aprobar</button>
              </div>
            </article>
          ))}

          {approved.length > 0 && (
            <div className="card rise" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Aprobados · esperando visto bueno de Fusión</div>
              {approved.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14 }}>
                  <IconShieldCheck size={16} color="var(--amber)" />
                  <span style={{ flex: 1 }}>{p.company}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Se enviará cuando Víctor lo valide</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 84 }}>
          <section className="card rise d2" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="eyebrow">ICP del agente</div>
              <button type="button" className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>Editar</button>
            </div>
            {ICP.map(([k, v]) => (
              <div key={k} style={{ padding: "7px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 1 }}>{v}</div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>Tomado de tu entregable «ICP v1 definido».</div>
          </section>

          <section className="rise d3" style={{ padding: 20, borderRadius: "var(--radius)", background: "var(--forest)", color: "#ecfdf3" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <IconRobot size={18} color="#4ade80" />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Cómo trabaja</div>
            </div>
            {["Busca clínicas que encajan con tu ICP", "Investiga señales y redacta un mensaje personalizado", "Tú apruebas, editas o descartas", "Fusión da el visto bueno", "Se envía y la respuesta entra en tu CRM"].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 13, color: "rgba(236,253,243,0.8)" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(74,222,128,0.18)", color: "#4ade80", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                {s}
              </div>
            ))}
          </section>
        </aside>
      </div>
    </Page>
  );
}
