import type { Cycle } from "@/types";

// Utilidades puras (sin dependencias de servidor): usables en componentes de cliente.

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
