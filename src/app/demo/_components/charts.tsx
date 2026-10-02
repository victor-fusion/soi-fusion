"use client";

import { useState } from "react";

// Gráficas SVG sin librerías (skill dataviz): un eje, marcas finas, etiqueta directa en el último valor, tooltip al pasar.

export const GREEN = "#16A34A";
const W = 460;
const H = 190;
const PAD = { top: 16, right: 16, bottom: 26, left: 40 };

export type Point = { label: string; value: number };

export function niceMax(v: number) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / pow / (v / pow > 5 ? 2 : 1)) * pow * (v / pow > 5 ? 2 : 1);
}

function Axes({ max, n, labels }: { max: number; n: number; labels: string[] }) {
  const ih = H - PAD.top - PAD.bottom;
  const ticks = [0, max / 2, max];
  const step = (W - PAD.left - PAD.right) / n;
  return (
    <g>
      {ticks.map((t) => {
        const y = PAD.top + ih - (t / max) * ih;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#ece7de" strokeWidth={1} />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#a8a29e">{Number.isInteger(t) ? t.toLocaleString("es-ES") : t.toFixed(1)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={l} x={PAD.left + step * i + step / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#78716c">{l}</text>
      ))}
    </g>
  );
}

function Tooltip({ x, y, label, value, unit }: { x: number; y: number; label: string; value: number; unit: string }) {
  return (
    <div style={{
      position: "absolute", left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, transform: "translate(-50%, calc(-100% - 10px))",
      background: "var(--ink)", color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12, whiteSpace: "nowrap", pointerEvents: "none",
    }}>
      <strong style={{ fontSize: 13 }}>{value.toLocaleString("es-ES")}{unit}</strong> <span style={{ opacity: 0.7 }}>· {label}</span>
    </div>
  );
}

/** Columnas: magnitud por mes. Hover por columna. */
export function Columns({ data, unit }: { data: Point[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ih = H - PAD.top - PAD.bottom;
  const step = (W - PAD.left - PAD.right) / data.length;
  const bw = Math.min(24, step * 0.5);
  const r = 4;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}${unit}`).join(", ")}>
        <Axes max={max} n={data.length} labels={data.map((d) => d.label)} />
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = PAD.left + step * i + step / 2 - bw / 2;
          const y = PAD.top + ih - h;
          const last = i === data.length - 1;
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={PAD.left + step * i} y={PAD.top} width={step} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${y + ih * 0 + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${y + h} Z`}
                  fill={GREEN} opacity={hover === null || hover === i ? (last ? 1 : 0.55) : 0.3}
                />
              )}
              {last && <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1c1917">{d.value.toLocaleString("es-ES")}{unit}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && (() => {
        const d = data[hover];
        const x = PAD.left + step * hover + step / 2;
        const y = PAD.top + ih - (d.value / max) * ih;
        return <Tooltip x={x} y={y} label={d.label} value={d.value} unit={unit} />;
      })()}
    </div>
  );
}

/** Línea con área: evolución. Crosshair que se ajusta al mes más cercano. */
export function Line({ data, unit }: { data: Point[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ih = H - PAD.top - PAD.bottom;
  const step = (W - PAD.left - PAD.right) / data.length;
  const pts = data.map((d, i) => ({ x: PAD.left + step * i + step / 2, y: PAD.top + ih - (d.value / max) * ih }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts.at(-1)!.x},${PAD.top + ih} L${pts[0].x},${PAD.top + ih} Z`;
  const end = pts.at(-1)!;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={data.map((d) => `${d.label}: ${d.value}${unit}`).join(", ")}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.max(0, Math.min(data.length - 1, Math.round((x - PAD.left - step / 2) / step))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <Axes max={max} n={data.length} labels={data.map((d) => d.label)} />
        <path d={area} fill={GREEN} opacity={0.1} />
        <path d={line} fill="none" stroke={GREEN} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && <line x1={pts[hover].x} x2={pts[hover].x} y1={PAD.top} y2={PAD.top + ih} stroke="#a8a29e" strokeWidth={1} />}
        {hover !== null && <circle cx={pts[hover].x} cy={pts[hover].y} r={5} fill={GREEN} stroke="#fff" strokeWidth={2} />}
        <circle cx={end.x} cy={end.y} r={4.5} fill={GREEN} stroke="#fff" strokeWidth={2} />
        <text x={end.x - 8} y={end.y - 10} textAnchor="end" fontSize={12} fontWeight={700} fill="#1c1917">{data.at(-1)!.value.toLocaleString("es-ES")}{unit}</text>
      </svg>
      {hover !== null && <Tooltip x={pts[hover].x} y={pts[hover].y} label={data[hover].label} value={data[hover].value} unit={unit} />}
    </div>
  );
}
