import { AREAS, STATUS, type DelivStatus } from "../_data";

export function PageHeader({
  eyebrow, title, subtitle, actions,
}: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="rise" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 28 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 500, marginBottom: 4 }}>{eyebrow}</div>}
        <h1 className="display" style={{ fontSize: 32, lineHeight: 1.2, margin: 0 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6, maxWidth: 640 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

export function Page({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <div style={{ maxWidth: wide ? 1320 : 1120, margin: "0 auto", padding: "36px 40px 64px" }}>{children}</div>;
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
      <div className="eyebrow">{children}</div>
      {aside && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{aside}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: DelivStatus }) {
  const s = STATUS[status];
  return <span className="pill" style={{ color: s.color, background: s.bg }}>{s.label}</span>;
}

export function AreaTag({ area }: { area: string }) {
  const a = AREAS[area];
  if (!a) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: a.color }} />
      {a.name}
    </span>
  );
}

export function Avatar({ initials, color = "#6b7280", size = 32 }: { initials: string; color?: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}18`, color, border: `1px solid ${color}33`,
      display: "grid", placeItems: "center", fontSize: size * 0.36, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

/** Anillo de progreso en SVG. */
export function Ring({ value, size = 64, stroke = 6, color = "var(--green)", label }: {
  value: number; size?: number; stroke?: number; color?: string; label?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
        />
      </svg>
      <div className="display" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: size * 0.24 }}>
        {label ?? `${value}%`}
      </div>
    </div>
  );
}

export function dueLabel(days: number) {
  if (days < 0) return { text: `Venció hace ${-days} d`, color: "var(--rose)" };
  if (days === 0) return { text: "Vence hoy", color: "var(--amber)" };
  if (days <= 3) return { text: `Vence en ${days} d`, color: "var(--amber)" };
  return { text: `En ${days} días`, color: "var(--muted)" };
}
