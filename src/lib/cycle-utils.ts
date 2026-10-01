import type { Cycle } from "@/types";

// Utilidades puras (sin dependencias de servidor): usables en componentes de cliente.

// Un color por ciclo; se repite cada 8 ciclos (4 años).
const CYCLE_COLORS = ["#0891B2", "#7C3AED", "#DB2777", "#EA580C", "#2563EB", "#16A34A", "#CA8A04", "#DC2626"];

export function cycleColor(number: number): string {
  return CYCLE_COLORS[(Math.max(number, 1) - 1) % CYCLE_COLORS.length];
}

/** Ciclo activo; si no hay ninguno marcado, el de número más alto. */
export function activeCycle(cycles: Cycle[]): Cycle | null {
  return cycles.find((c) => c.is_active) ?? cycles.at(-1) ?? null;
}

/** Etiqueta para selects: "Ciclo 6 · oct 2026". */
export function cycleLabel(c: Cycle): string {
  const name = c.name || `Ciclo ${c.number}`;
  if (!c.start_date) return name;
  const date = new Date(c.start_date + "T00:00:00").toLocaleDateString("es-ES", { month: "short", year: "numeric" });
  return `${name} · ${date}`;
}
