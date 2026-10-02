"use client";

import { useState } from "react";
import { IconX, IconVideo, IconMapPin } from "@tabler/icons-react";
import { AREAS, MENTORS } from "../_data";
import { Avatar, Page, PageHeader } from "../_components/ui";

const DAYS = [
  { key: "Lun", label: "Lun 16" }, { key: "Mar", label: "Mar 17" }, { key: "Mié", label: "Mié 18" },
  { key: "Jue", label: "Jue 19" }, { key: "Vie", label: "Vie 20" },
];
const START = 9;
const END = 19;
const ROW = 60; // px por hora

type Ev = { day: string; start: number; end: number; title: string; kind: "weekly" | "mentor" | "cliente" | "fusion" };

const KIND: Record<Ev["kind"], { color: string; label: string }> = {
  weekly:  { color: "#16A34A", label: "Weekly" },
  mentor:  { color: "#7C3AED", label: "Mentor" },
  cliente: { color: "#2563EB", label: "Cliente" },
  fusion:  { color: "#D97706", label: "Fusión" },
};

const INITIAL: Ev[] = [
  { day: "Lun", start: 9.5, end: 10.5, title: "Planificación semanal del equipo", kind: "fusion" },
  { day: "Lun", start: 16, end: 17, title: "Demo · VetCenter Utrera", kind: "cliente" },
  { day: "Mar", start: 10, end: 10.5, title: "Weekly con Víctor", kind: "weekly" },
  { day: "Mar", start: 12, end: 12.75, title: "Office hours · Ana Prieto", kind: "mentor" },
  { day: "Mar", start: 17.5, end: 18, title: "Demo mockup · Clínica Triana", kind: "cliente" },
  { day: "Mié", start: 11, end: 12, title: "Validación mockup · Nervión", kind: "cliente" },
  { day: "Jue", start: 16, end: 17.5, title: "Taller: pricing B2B", kind: "fusion" },
  { day: "Jue", start: 18, end: 20, title: "Demo Day interno", kind: "fusion" },
  { day: "Vie", start: 9.5, end: 10, title: "Llamada · Vet Aljarafe", kind: "cliente" },
];

const fmt = (h: number) => `${Math.floor(h)}:${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, "0") : "00"}`;

export default function AgendaPage() {
  const [events, setEvents] = useState<Ev[]>(INITIAL);
  const [booking, setBooking] = useState<{ mentor: (typeof MENTORS)[number]; slot: string } | null>(null);
  const [booked, setBooked] = useState<string[]>([]);

  const confirm = () => {
    if (!booking) return;
    const [day, time] = booking.slot.split(" ");
    const [h, m] = time.split(":").map(Number);
    const start = h + m / 60;
    setEvents((e) => [...e, { day, start, end: start + 0.75, title: `Office hours · ${booking.mentor.name}`, kind: "mentor" }]);
    setBooked((b) => [...b, `${booking.mentor.name}-${booking.slot}`]);
    setBooking(null);
  };

  return (
    <Page wide>
      <PageHeader
        eyebrow="Con Fusión"
        title="Agenda"
        subtitle="Tu semana en un vistazo y acceso directo a los mentores de Fusión. Reserva una sesión en dos clics."
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 24, alignItems: "start" }}>
        {/* Calendario */}
        <section className="card rise d1" style={{ padding: 18, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 12, paddingLeft: 48 }}>
            {Object.values(KIND).map((k) => (
              <span key={k.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: k.color }} />{k.label}
              </span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `48px repeat(${DAYS.length}, 1fr)` }}>
            <div />
            {DAYS.map((d) => (
              <div key={d.key} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, padding: "6px 0 10px", color: d.key === "Mar" ? "var(--green-ink)" : "var(--ink-2)" }}>
                {d.label}{d.key === "Mar" && <span style={{ display: "block", fontSize: 10.5, fontWeight: 600 }}>HOY</span>}
              </div>
            ))}
            {/* Horas */}
            <div style={{ position: "relative", height: (END - START) * ROW }}>
              {Array.from({ length: END - START }, (_, i) => (
                <div key={i} style={{ position: "absolute", top: i * ROW - 6, right: 8, fontSize: 11, color: "var(--faint)" }}>{START + i}:00</div>
              ))}
            </div>
            {DAYS.map((d) => (
              <div key={d.key} style={{
                position: "relative", height: (END - START) * ROW, borderLeft: "1px solid var(--line)",
                background: d.key === "Mar" ? "rgba(22,163,74,0.035)" : "transparent",
                backgroundImage: `repeating-linear-gradient(to bottom, var(--line) 0, var(--line) 1px, transparent 1px, transparent ${ROW}px)`,
              }}>
                {events.filter((e) => e.day === d.key && e.start < END).map((e, i) => {
                  const k = KIND[e.kind];
                  const top = (e.start - START) * ROW;
                  const height = Math.max((Math.min(e.end, END) - e.start) * ROW - 3, 20);
                  return (
                    <div key={i} className="rise" title={e.title} style={{
                      position: "absolute", left: 4, right: 4, top: top + 1, height,
                      borderRadius: 7, padding: "4px 7px", overflow: "hidden",
                      background: `${k.color}14`, borderLeft: `3px solid ${k.color}`,
                    }}>
                      {height < 40 ? (
                        <div style={{ fontSize: 12, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <span style={{ color: "var(--muted)" }}>{fmt(e.start)}</span> <strong style={{ fontWeight: 650 }}>{e.title}</strong>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmt(e.start)}</div>
                          <div style={{ fontSize: 12, fontWeight: 650, lineHeight: 1.25, color: "var(--ink)" }}>{e.title}</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Mentores */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="eyebrow rise d2">Mentores de Fusión · esta semana</div>
          {MENTORS.map((m, i) => {
            const color = AREAS[m.area].color;
            return (
              <div key={m.name} className={`card rise d${i + 2}`} style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar initials={m.initials} color={color} size={38} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{AREAS[m.area].name} · {m.topic}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                  {m.slots.map((s) => {
                    const isBooked = booked.includes(`${m.name}-${s}`);
                    return (
                      <button key={s} type="button" disabled={isBooked} onClick={() => setBooking({ mentor: m, slot: s })} style={{
                        padding: "5px 10px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
                        cursor: isBooked ? "default" : "pointer",
                        border: `1px solid ${isBooked ? "var(--green)" : "var(--line-2)"}`,
                        background: isBooked ? "var(--green-soft)" : "#fff", color: isBooked ? "var(--green-ink)" : "var(--ink-2)",
                      }}>
                        {isBooked ? `✓ ${s}` : s}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>
      </div>

      {booking && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setBooking(null); }} style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.3)", zIndex: 50, display: "grid", placeItems: "center", padding: 24 }}>
          <div className="card rise" style={{ width: "100%", maxWidth: 460, padding: 28, position: "relative" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setBooking(null)} style={{ position: "absolute", top: 14, right: 14, padding: 6 }}><IconX size={18} /></button>
            <div className="eyebrow">Reservar office hours</div>
            <h2 className="display" style={{ fontSize: 26, fontWeight: 500, margin: "6px 0 4px" }}>{booking.mentor.name}</h2>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>{booking.slot} · 45 min</div>
            <div style={{ display: "flex", gap: 8, margin: "18px 0" }}>
              <button type="button" className="btn" style={{ flex: 1, justifyContent: "center", borderColor: "var(--ink)" }}><IconMapPin size={15} /> En Fusión</button>
              <button type="button" className="btn" style={{ flex: 1, justifyContent: "center" }}><IconVideo size={15} /> Online</button>
            </div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>¿Qué quieres trabajar?</label>
            <textarea className="field" rows={3} defaultValue="Revisar nuestro pricing v1: 89 €/mes por clínica pequeña y 249 € para hospitales." style={{ marginTop: 6 }} />
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>El mentor verá tu fase, tu entregable «Pricing v1» y tus métricas antes de la sesión.</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" className="btn" onClick={() => setBooking(null)}>Cancelar</button>
              <button type="button" className="btn btn-green" onClick={confirm}>Reservar</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
