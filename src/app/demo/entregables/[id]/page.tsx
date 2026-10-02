"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconArrowLeft, IconSparkles, IconSend, IconCheck, IconAlertCircle, IconBook, IconTool, IconChecklist, IconLink, IconFileText, IconUpload,
} from "@tabler/icons-react";
import { COPILOT_MESSAGES, DELIVERABLES, PHASES, RESOURCES, STATUS, type DelivStatus } from "../../_data";
import { AreaTag, Avatar, Page, StatusPill, dueLabel } from "../../_components/ui";

// Bloques de la plantilla; para «propuesta» vienen prerrellenados como borrador del founder
const TEMPLATE_BLOCKS = [
  { id: "cliente", label: "Para quién", hint: "El cliente ideal en una frase.", draft: "Clínicas veterinarias independientes de 2 a 10 veterinarios en Andalucía." },
  { id: "problema", label: "Problema que resuelves", hint: "El dolor más repetido en tus entrevistas.", draft: "Pierden muchas citas porque los clientes no avisan, y la recepción pasa horas llamando para confirmar." },
  { id: "alternativas", label: "Alternativas actuales", hint: "Qué usan hoy y por qué no basta.", draft: "Qvet (caro y pensado para hospitales grandes), Google Calendar o agenda en papel." },
  { id: "diferencial", label: "Diferencial", hint: "Por qué tú y no ellos. Cuantifícalo.", draft: "" },
  { id: "prueba", label: "Prueba", hint: "Datos, pilotos o citas que lo demuestran.", draft: "4 clínicas en piloto. Los Remedios ha reducido las ausencias del 14 % al 9 % en 3 semanas." },
];

const CRITERIA = [
  "Se entiende en 10 segundos sin explicación adicional",
  "Nombra al menos 2 alternativas y por qué no bastan",
  "El diferencial está cuantificado (tiempo, dinero o %)",
  "Está respaldado por al menos una prueba real",
];

const COMMENTS = [
  { who: "Víctor Humanes", initials: "VH", color: "#374151", when: "hace 2 h", text: "Buen avance. Falta comparar con Qvet y con la agenda en papel: ¿qué gana la clínica en minutos/semana? Cuantifícalo y lo cerramos en la weekly." },
  { who: "Marta Romero", initials: "MR", color: "#16A34A", when: "hace 1 h", text: "¡Hecho! Lo estoy rehaciendo con los datos de las entrevistas. Lo reenvío hoy." },
];

const RES_ICON: Record<string, typeof IconBook> = { Playbook: IconBook, Plantilla: IconChecklist, "Herramienta IA": IconSparkles, Checklist: IconChecklist, Recurso: IconTool };

export default function EntregablePage() {
  const { id } = useParams<{ id: string }>();
  const d = DELIVERABLES.find((x) => x.id === id) ?? DELIVERABLES.find((x) => x.id === "propuesta")!;
  const isPropuesta = d.id === "propuesta";

  const [status, setStatus] = useState<DelivStatus>(d.status);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(TEMPLATE_BLOCKS.map((b) => [b.id, isPropuesta ? b.draft : ""]))
  );
  const [messages, setMessages] = useState(isPropuesta ? COPILOT_MESSAGES : [
    { from: "ai", text: `Hola, soy tu copiloto para «${d.title}». Conozco tus entrevistas, tu ICP y tus entregables anteriores. ¿Por dónde empezamos?` },
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<string[]>([`${d.id}-v1.pdf`]);
  const [checks, setChecks] = useState<Record<number, boolean>>({ 0: true, 1: true, 3: true });

  const phase = PHASES.find((p) => p.n === d.phase)!;
  const due = dueLabel(d.dueDays);
  const resources = RESOURCES.filter((r) => r.forDeliverable === d.id);
  const locked = status === "completado" || status === "en_revision";

  const applySuggestion = () => {
    setValues((v) => ({ ...v, diferencial: "Recordatorios automáticos por WhatsApp que reducen un 30 % las ausencias y ahorran ~6 h/semana de teléfono, sin cambiar de software de gestión." }));
    setMessages((m) => [...m, { from: "ai", text: "Listo, lo he añadido al bloque «Diferencial». Ahora cumple los 4 criterios: puedes reenviarlo a revisión." }]);
    setChecks({ 0: true, 1: true, 2: true, 3: true });
  };

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: "me", text: input.trim() }, { from: "ai", text: "(Prototipo) Aquí el copiloto respondería usando el contexto de Turnio: entrevistas, ICP, CRM y feedback de Fusión." }]);
    setInput("");
  };

  return (
    <Page wide>
      <Link href="/demo/camino" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 18 }}>
        <IconArrowLeft size={14} /> Mi ciclo
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 28, alignItems: "start" }}>
        {/* ─── Trabajo ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <header className="rise">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <AreaTag area={d.area} />
              <span style={{ fontSize: 12, color: "var(--faint)" }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: phase.color }}>Fase {phase.n} · {phase.name}</span>
              <span style={{ fontSize: 12, color: "var(--faint)" }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: due.color }}>{d.due} · {due.text}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <h1 className="display" style={{ fontSize: 28, margin: 0, lineHeight: 1.2 }}>{d.title}</h1>
              <StatusPill status={status} />
            </div>
            <p style={{ fontSize: 15.5, color: "var(--muted)", lineHeight: 1.6, marginTop: 12, maxWidth: 720 }}>{d.brief}</p>
          </header>

          {status === "cambios_solicitados" && d.feedback && (
            <div className="rise d1" style={{ display: "flex", gap: 12, padding: 16, borderRadius: 12, background: "#fff1f2", border: "1px solid #fecdd3" }}>
              <IconAlertCircle size={18} color="var(--rose)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#9f1239" }}>Víctor ha pedido cambios</div>
                <div style={{ fontSize: 14, color: "#881337", marginTop: 3, lineHeight: 1.5 }}>{d.feedback}</div>
              </div>
            </div>
          )}
          {status === "en_revision" && (
            <div className="rise" style={{ padding: 14, borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 14, color: "#92400e" }}>
              Enviado a revisión. Víctor recibirá un aviso y te responderá aquí mismo.
            </div>
          )}

          {/* Plantilla */}
          <section className="card rise d2" style={{ padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <div className="eyebrow">Tu entregable</div>
              <span style={{ fontSize: 12, color: "var(--faint)" }}>Guardado automático · hace 1 min</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {TEMPLATE_BLOCKS.map((b) => (
                <div key={b.id}>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>
                    {b.label}
                    {b.id === "diferencial" && !values.diferencial && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--rose)" }}>Falta</span>}
                  </label>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 7 }}>{b.hint}</div>
                  <textarea
                    className="field"
                    rows={b.id === "diferencial" ? 3 : 2}
                    value={values[b.id]}
                    disabled={locked}
                    onChange={(e) => setValues((v) => ({ ...v, [b.id]: e.target.value }))}
                    style={{ resize: "vertical", lineHeight: 1.5, borderColor: b.id === "diferencial" && !values.diferencial ? "#fda4af" : undefined }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13.5, fontWeight: 700 }}>Documento de apoyo (opcional)</label>
                <div style={{ position: "relative", marginTop: 7 }}>
                  <IconLink size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--faint)" }} />
                  <input className="field" placeholder="https://drive.google.com/…" disabled={locked} style={{ paddingLeft: 32 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13.5, fontWeight: 700 }}>Archivos</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line-2)", background: "#fff" }}>
                  <IconFileText size={18} color="var(--muted)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{files[0]}</div>
                    <div style={{ fontSize: 12, color: "var(--faint)" }}>240 KB · subido ayer</div>
                  </div>
                </div>
                {files.slice(1).map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line-2)", background: "#fff" }}>
                    <IconFileText size={18} color="var(--muted)" />
                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{f}</div>
                    <span style={{ fontSize: 12, color: "var(--green-ink)" }}>Subido</span>
                  </div>
                ))}
                {!locked && (
                  <button type="button" onClick={() => setFiles((f) => [...f, `anexo-${f.length}.pdf`])}
                    style={{ width: "100%", marginTop: 8, padding: "18px 12px", borderRadius: 10, border: "1.5px dashed var(--line-2)", background: "#fafafa", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <IconUpload size={16} /> Arrastra archivos aquí o <strong style={{ color: "var(--ink-2)" }}>añadir archivo</strong>
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
              {status === "completado" ? (
                <span className="pill" style={{ background: STATUS.completado.bg, color: STATUS.completado.color, padding: "7px 14px", fontSize: 13 }}>
                  <IconCheck size={14} /> Aprobado por Fusión
                </span>
              ) : status === "en_revision" ? (
                <button type="button" className="btn" onClick={() => setStatus("en_progreso")}>Retirar de revisión</button>
              ) : (
                <>
                  <button type="button" className="btn">Guardar borrador</button>
                  <button type="button" className="btn btn-green" onClick={() => setStatus("en_revision")}>
                    <IconSend size={14} /> {status === "cambios_solicitados" ? "Reenviar a revisión" : "Enviar a revisión"}
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Conversación */}
          <section className="card rise d3" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Conversación con Fusión</div>
            {(isPropuesta ? COMMENTS : []).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <Avatar initials={c.initials} color={c.color} size={30} />
                <div>
                  <div style={{ fontSize: 13.5 }}><strong>{c.who}</strong> <span style={{ color: "var(--faint)", fontSize: 12 }}>· {c.when}</span></div>
                  <div style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
            <input className="field" placeholder="Escribe un comentario para el equipo de Fusión…" style={{ marginTop: 10 }} />
          </section>
        </div>

        {/* ─── Copiloto + apoyo ─── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 84 }}>
          <section className="rise d2" style={{ borderRadius: "var(--radius)", background: "#fff", border: "1px solid var(--line)", color: "var(--ink)", display: "flex", flexDirection: "column", maxHeight: 520 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 18px", borderBottom: "1px solid var(--line)" }}>
              <IconSparkles size={18} color="#16a34a" />
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Copiloto</div>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>Conoce tus entrevistas, ICP y CRM</span>
            </div>
            <div className="scroll-y" style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "88%",
                  padding: "10px 12px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                  background: m.from === "me" ? "#111827" : "#f3f4f6",
                  color: m.from === "me" ? "#fff" : "var(--ink-2)",
                }}>
                  {m.text}
                </div>
              ))}
              {isPropuesta && !values.diferencial && (
                <button type="button" className="btn btn-green" onClick={applySuggestion} style={{ alignSelf: "flex-start" }}>
                  Añadir a «Diferencial»
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--line)" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Pregunta a tu copiloto…"
                className="field"
                style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
              />
              <button type="button" onClick={send} className="btn btn-primary" style={{ padding: "8px 10px" }}><IconSend size={15} /></button>
            </div>
          </section>

          <section className="card rise d3" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Criterios para aprobarlo</div>
            {CRITERIA.map((c, i) => (
              <label key={i} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 13.5, color: checks[i] ? "var(--ink-2)" : "var(--ink)", cursor: "pointer" }}>
                <input type="checkbox" checked={!!checks[i]} onChange={() => setChecks((s) => ({ ...s, [i]: !s[i] }))} style={{ accentColor: "#16a34a", marginTop: 2 }} />
                {c}
              </label>
            ))}
          </section>

          {resources.length > 0 && (
            <section className="card rise d4" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>De Recursos para esto</div>
              {resources.map((r) => {
                const Icon = RES_ICON[r.type] ?? IconBook;
                return (
                  <Link key={r.id} href="/demo/arsenal" className="row-hover" style={{ display: "flex", gap: 10, padding: "9px 8px", margin: "0 -8px", borderRadius: 8, textDecoration: "none" }}>
                    <Icon size={17} color="var(--green-ink)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.type} · {r.minutes} min</div>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </aside>
      </div>
    </Page>
  );
}
