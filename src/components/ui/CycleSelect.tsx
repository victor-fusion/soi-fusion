"use client";

import type { Cycle } from "@/types";
import { activeCycle, cycleLabel } from "@/lib/cycle-utils";

interface CycleSelectProps {
  cycles: Cycle[];
  name?: string;
  /** Si no se indica, se preselecciona el ciclo activo. */
  defaultValue?: number;
  style?: React.CSSProperties;
}

/** Selector de ciclo alimentado por la tabla `cycles`. */
export function CycleSelect({ cycles, name = "batch", defaultValue, style }: CycleSelectProps) {
  const selected = defaultValue ?? activeCycle(cycles)?.number;
  // Ciclos más recientes primero
  const options = [...cycles].sort((a, b) => b.number - a.number);

  return (
    <select name={name} defaultValue={selected} required style={style}>
      {options.map((c) => (
        <option key={c.number} value={c.number}>
          {cycleLabel(c)}{c.is_active ? " (activo)" : ""}
        </option>
      ))}
    </select>
  );
}
