"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconSun, IconRoute, IconBooks, IconLayoutKanban, IconRobot, IconChartLine,
  IconNotes, IconCalendarEvent, IconUsersGroup, IconUsers, IconBell, IconSearch, IconX,
} from "@tabler/icons-react";
import { CYCLE, ME, NOTIFICATIONS, STARTUP, TODAY_LABEL } from "../_data";

type NavItem = { href: string; label: string; icon: typeof IconSun; exact?: boolean; badge?: number };

const NAV: { group: string | null; items: NavItem[] }[] = [
  { group: null, items: [
    { href: "/demo", label: "Hoy", icon: IconSun, exact: true },
    { href: "/demo/camino", label: "Mi camino", icon: IconRoute },
    { href: "/demo/arsenal", label: "Arsenal", icon: IconBooks },
  ] },
  { group: "Trabajo", items: [
    { href: "/demo/crm", label: "Clientes (CRM)", icon: IconLayoutKanban },
    { href: "/demo/agente", label: "Agente SDR", icon: IconRobot, badge: 3 },
    { href: "/demo/metricas", label: "Métricas", icon: IconChartLine },
  ] },
  { group: "Con Fusión", items: [
    { href: "/demo/weeklies", label: "Weeklies", icon: IconNotes },
    { href: "/demo/agenda", label: "Agenda y mentores", icon: IconCalendarEvent },
    { href: "/demo/comunidad", label: "Comunidad", icon: IconUsersGroup },
  ] },
  { group: "Startup", items: [
    { href: "/demo/equipo", label: "Equipo", icon: IconUsers },
  ] },
];

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  const pct = Math.round((CYCLE.week / CYCLE.totalWeeks) * 100);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: 248, flexShrink: 0, height: "100vh", position: "sticky", top: 0,
          background: "linear-gradient(180deg, var(--forest) 0%, #0b2117 100%)",
          display: "flex", flexDirection: "column", color: "#ecfdf3",
        }}
      >
        <div style={{ padding: "22px 20px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#4ade80" }}>FUSIÓN STARTUPS</div>
          <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 2, color: "#fff" }}>SOI</div>
        </div>

        {/* Startup actual */}
        <div style={{ margin: "0 12px 14px", padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#16a34a", display: "grid", placeItems: "center", fontWeight: 800, color: "#fff" }}>T</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{STARTUP.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(236,253,243,0.55)" }}>Ciclo {CYCLE.number} · Fase {STARTUP.phase}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(236,253,243,0.55)", marginBottom: 5 }}>
              <span>Semana {CYCLE.week} de {CYCLE.totalWeeks}</span><span>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: "#4ade80" }} />
            </div>
          </div>
        </div>

        <nav className="scroll-y" style={{ flex: 1, padding: "0 12px" }}>
          {NAV.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              {g.group && (
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(236,253,243,0.35)", padding: "0 12px 6px" }}>
                  {g.group}
                </div>
              )}
              {g.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={`nav-link${isActive(item.href, item.exact) ? " active" : ""}`}>
                    <Icon size={17} stroke={1.7} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: "#4ade80", color: "#0f2a1d", borderRadius: 999, padding: "1px 7px" }}>{item.badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ecfdf3", color: "#0f2a1d", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800 }}>{ME.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ME.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(236,253,243,0.5)" }}>{ME.role}</div>
          </div>
        </div>
      </aside>

      {/* ─── Contenido ─── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Aviso de prototipo */}
        <div style={{ background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 600, textAlign: "center", padding: "5px 12px", borderBottom: "1px solid #fde68a" }}>
          Prototipo navegable · datos ficticios · nada de lo que hagas aquí se guarda
        </div>

        <header style={{
          height: 60, display: "flex", alignItems: "center", gap: 16, padding: "0 32px",
          borderBottom: "1px solid var(--line)", background: "rgba(250,248,244,0.85)", backdropFilter: "blur(8px)",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{TODAY_LABEL}</div>
          <div style={{ flex: 1, maxWidth: 420, marginLeft: "auto", position: "relative" }}>
            <IconSearch size={15} style={{ position: "absolute", left: 12, top: 11, color: "var(--faint)" }} />
            <input className="field" placeholder="Buscar entregables, recursos, clientes…  (⌘K)" style={{ paddingLeft: 34, paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
          </div>
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="btn btn-ghost"
            style={{ position: "relative", padding: 8 }}
            aria-label="Avisos"
          >
            <IconBell size={19} stroke={1.7} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: 3, right: 3, minWidth: 16, height: 16, borderRadius: 999, background: "var(--rose)", color: "#fff", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 4px" }}>{unread}</span>
            )}
          </button>
        </header>

        <main className="demo-main" style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* ─── Panel de avisos ─── */}
      {notifOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setNotifOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.25)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}
        >
          <div className="rise" style={{ width: 400, height: "100%", background: "var(--paper)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px", borderBottom: "1px solid var(--line)" }}>
              <div className="display" style={{ fontSize: 22, fontWeight: 600 }}>Avisos</div>
              <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setNotifOpen(false)}><IconX size={18} /></button>
            </div>
            <div className="scroll-y" style={{ flex: 1 }}>
              {NOTIFICATIONS.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setNotifOpen(false)}
                  className="row-hover"
                  style={{ display: "flex", gap: 12, padding: "14px 22px", borderBottom: "1px solid var(--line)", textDecoration: "none" }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0, background: n.unread ? "var(--green)" : "transparent" }} />
                  <div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.45 }}>
                      <strong style={{ color: "var(--ink)" }}>{n.who}</strong> {n.text}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 3 }}>{n.when}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ padding: 16, fontSize: 12, color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
              También te llegan por email y Slack (configurable).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
