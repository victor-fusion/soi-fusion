"use client";

import { IconAlertTriangle, IconSparkles } from "@tabler/icons-react";
import { Drawer } from "../../demo/_components/ui";
import { PHASES } from "../../demo/_data";
import { HEALTH, WEEKLY_PREP, type Health } from "../_data";

/** Semáforo de salud: punto + texto (nunca solo color). */
export function HealthBadge({ health }: { health: Health }) {
  const h = HEALTH[health];
  return (
    <span className="pill" style={{ background: h.bg, color: h.color }}>
      <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: h.color }} />
      {h.label}
    </span>
  );
}

export function SignalPill({ text }: { text: string }) {
  return (
    <span className="pill" style={{ background: "#fff", color: "var(--ink-2)", border: "1px solid var(--line-2)", fontWeight: 500 }}>
      <IconAlertTriangle size={12} color="var(--amber)" /> {text}
    </span>
  );
}

export function PhasePill({ n }: { n: number }) {
  const p = PHASES.find((x) => x.n === n)!;
  return <span className="pill" style={{ background: `${p.color}14`, color: p.color }}>{n} · {p.name}</span>;
}

export function StartupLogo({ name, color, size = 34 }: { name: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `${color}18`, color, border: `1px solid ${color}33`, display: "grid", placeItems: "center", fontWeight: 800, fontSize: size * 0.42, flexShrink: 0 }}>
      {name[0]}
    </div>
  );
}

const GENERIC_PREP = {
  changed: ["1 entregable enviado a revisión", "Métricas del mes registradas"],
  worries: ["Sin señales de alerta"],
  carried: ["Sin tareas pendientes de la última weekly"],
  questions: ["¿Cuál es el principal bloqueo de esta semana?", "¿Qué necesitáis de Fusión?", "¿Vais a cumplir el objetivo de la fase?"],
};

/** Preparación automática de una weekly. */
export function WeeklyPrepDrawer({ startupId, startup, time, onClose }: { startupId: string; startup: string; time?: string; onClose: () => void }) {
  const prep = WEEKLY_PREP[startupId] ?? GENERIC_PREP;
  const blocks = [
    { title: "Qué ha cambiado desde la última weekly", items: prep.changed },
    { title: "Qué preocupa", items: prep.worries, warn: true },
    { title: "Tareas que arrastran", items: prep.carried },
  ];
  return (
    <Drawer
      onClose={onClose}
      title={<>
        <div className="eyebrow">Preparar weekly{time ? ` · hoy ${time}` : ""}</div>
        <div className="display" style={{ fontSize: 22, marginTop: 4 }}>{startup}</div>
      </>}
      footer={<>
        <button type="button" className="btn" onClick={onClose}>Cerrar</button>
        <button type="button" className="btn btn-primary" onClick={onClose}>Usar como agenda</button>
      </>}
    >
      {blocks.map((b) => (
        <section key={b.title} style={{ marginBottom: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{b.title}</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: b.warn ? "var(--amber)" : "var(--ink-2)" }}>
            {b.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      ))}
      <section className="card" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Preguntas sugeridas</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
          {prep.questions.map((q) => <li key={q}>{q}</li>)}
        </ol>
      </section>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--faint)", marginTop: 16 }}>
        <IconSparkles size={13} /> Generado a partir de entregables, CRM, métricas y la última weekly.
      </div>
    </Drawer>
  );
}
