"use client";

import { useState } from "react";
import { IconCheck, IconFileText, IconForms, IconNotes, IconRobot, IconStairsUp, IconX } from "@tabler/icons-react";
import { Drawer, GateCriteria, Page, PageHeader } from "../../demo/_components/ui";
import { resolveReview, useResolved } from "../_components/review-store";
import { LONJA_GATE, REVIEW_QUEUE, REVIEW_TYPES, type ReviewItem, type ReviewType } from "../_data";

const ICONS: Record<ReviewType, typeof IconFileText> = {
  entregable: IconFileText, plantilla: IconForms, weekly: IconNotes, sdr: IconRobot, fase: IconStairsUp,
};

const CRITERIA: Record<string, string[]> = {
  q1: ["Estructura de planes clara", "Precio justificado con valor para el cliente", "Contrastado con al menos 3 clínicas"],
  q2: ["Al menos 2 variantes de mensaje", "Métricas de respuesta por variante", "Siguiente paso definido para los que responden"],
  q3: ["10 o más usuarios activos semanales", "Retención medida a 4 semanas", "Feedback cualitativo recogido"],
};

export default function RevisionPage() {
  const [tab, setTab] = useState<ReviewType | "all">("all");
  const done = useResolved();
  const queue = REVIEW_QUEUE.filter((q) => !done.has(q.id));
  const [open, setOpen] = useState<ReviewItem | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const visible = queue.filter((q) => tab === "all" || q.type === tab)
    .sort((a, b) => Number(b.high) - Number(a.high) || b.days - a.days);
  const count = (t: ReviewType) => queue.filter((q) => q.type === t).length;

  const resolve = (id: string) => {
    setOpen(null); setAsking(false);
    setLeaving(id);
    setTimeout(() => { resolveReview(id); setLeaving(null); }, 280);
  };

  return (
    <Page wide>
      <PageHeader
        title="Cola de revisión"
        subtitle="Todo lo que espera a Fusión, en un solo sitio y por prioridad. Prioridad alta: lleva más de 3 días o bloquea un cambio de fase."
      />

      <div className="rise d1" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {(["all", "entregable", "plantilla", "weekly", "sdr", "fase"] as const).map((t) => {
          const on = tab === t;
          return (
            <button key={t} type="button" onClick={() => setTab(t)} className="btn" style={{
              padding: "6px 12px", fontSize: 12.5,
              background: on ? "var(--ink)" : undefined, color: on ? "#fff" : undefined, borderColor: on ? "var(--ink)" : undefined,
            }}>
              {t === "all" ? `Todo · ${queue.length}` : `${REVIEW_TYPES[t].plural} · ${count(t)}`}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.length === 0 && (
          <div className="card rise" style={{ padding: 40, textAlign: "center" }}>
            <IconCheck size={28} color="var(--green)" />
            <div className="display" style={{ fontSize: 22, marginTop: 8 }}>Nada pendiente</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Te avisaremos cuando una startup envíe algo.</div>
          </div>
        )}
        {visible.map((r, i) => {
          const Icon = ICONS[r.type];
          return (
            <button key={r.id} type="button" onClick={() => { setOpen(r); setAsking(false); }}
              className={`card card-hover rise d${Math.min(i + 1, 6)}`}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", width: "100%",
                opacity: leaving === r.id ? 0 : 1, transform: leaving === r.id ? "translateX(24px)" : undefined, transition: "opacity 0.25s, transform 0.25s",
              }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--paper-2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={18} color="var(--ink-2)" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{REVIEW_TYPES[r.type].label} · {r.startup}</div>
                <div style={{ fontSize: 15, fontWeight: 650, marginTop: 2 }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{r.by} · {r.when}</div>
              </div>
              {r.high && <span className="pill" style={{ background: "#FFF1F2", color: "var(--rose)" }}>Prioridad alta</span>}
            </button>
          );
        })}
      </div>

      {open && (
        <Drawer
          width={520}
          onClose={() => setOpen(null)}
          title={<>
            <div className="eyebrow">{REVIEW_TYPES[open.type].label} · {open.startup}</div>
            <div className="display" style={{ fontSize: 22, marginTop: 4 }}>{open.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{open.by} · {open.when}</div>
          </>}
          footer={<Actions item={open} asking={asking} onAsk={() => setAsking(true)} onResolve={() => resolve(open.id)} />}
        >
          <div className="eyebrow" style={{ marginBottom: 8 }}>{open.type === "sdr" ? "Mensaje" : open.type === "fase" ? "Propuesta" : "Contenido"}</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-2)", margin: 0, padding: "12px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 10 }}>{open.detail}</p>

          {CRITERIA[open.id] && (
            <>
              <div className="eyebrow" style={{ margin: "22px 0 8px" }}>Criterios de aprobación</div>
              {CRITERIA[open.id].map((c) => {
                const key = `${open.id}-${c}`;
                return (
                  <label key={c} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: 14, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!checked[key]} onChange={() => setChecked((s) => ({ ...s, [key]: !s[key] }))} style={{ accentColor: "#16a34a", width: 16, height: 16 }} />
                    {c}
                  </label>
                );
              })}
            </>
          )}

          {open.type === "fase" && (
            <>
              <div className="eyebrow" style={{ margin: "22px 0 4px" }}>Criterios de salida de Activar</div>
              <GateCriteria criteria={LONJA_GATE} />
            </>
          )}

          {open.type === "plantilla" && (
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 16 }}>Plantilla del recurso «Canvas de diferenciación competitiva». Las respuestas se guardan en la ficha de la startup.</div>
          )}

          {open.type === "weekly" && (
            <>
              <div className="eyebrow" style={{ margin: "22px 0 8px" }}>Tus notas para la reunión</div>
              <textarea className="field" rows={4} placeholder="Añade lo que quieras tratar…" />
            </>
          )}

          {open.type === "sdr" && (
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 16 }}>Aprobado por la founder. Al dar el visto bueno se envía por LinkedIn y la respuesta entra en su CRM.</div>
          )}

          {asking && (
            <>
              <div className="eyebrow" style={{ margin: "22px 0 8px" }}>{open.type === "fase" ? "Qué falta" : "Qué hay que cambiar"}</div>
              <textarea className="field" rows={4} autoFocus placeholder="Sé concreto: la founder lo verá en su SOI y por email." />
            </>
          )}
        </Drawer>
      )}
    </Page>
  );
}

function Actions({ item, asking, onAsk, onResolve }: { item: ReviewItem; asking: boolean; onAsk: () => void; onResolve: () => void }) {
  const labels: Record<ReviewType, [string, string]> = {
    entregable: ["Pedir cambios", "Aprobar"],
    plantilla: ["Comentar", "Marcar como revisada"],
    weekly: ["", "Guardar mis notas"],
    sdr: ["Devolver", "Dar el visto bueno"],
    fase: ["Todavía no", "Aprobar cambio a Vender"],
  };
  const [secondary, primary] = labels[item.type];
  if (asking) return <button type="button" className="btn btn-primary" onClick={onResolve}>Enviar</button>;
  return (
    <>
      {secondary && <button type="button" className="btn" onClick={onAsk}><IconX size={15} /> {secondary}</button>}
      <button type="button" className="btn btn-green" onClick={onResolve}><IconCheck size={15} /> {primary}</button>
    </>
  );
}
