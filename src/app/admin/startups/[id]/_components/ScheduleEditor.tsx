"use client";

import { useState } from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import type { OfficeSchedule, DaySchedule } from "@/types";

const DAYS: { key: keyof OfficeSchedule; label: string; short: string }[] = [
  { key: "monday",    label: "Lunes",     short: "L" },
  { key: "tuesday",   label: "Martes",    short: "M" },
  { key: "wednesday", label: "Miércoles", short: "X" },
  { key: "thursday",  label: "Jueves",    short: "J" },
  { key: "friday",    label: "Viernes",   short: "V" },
  { key: "saturday",  label: "Sábado",    short: "S" },
  { key: "sunday",    label: "Domingo",   short: "D" },
];

interface ScheduleEditorProps {
  value: OfficeSchedule;
  onChange: (schedule: OfficeSchedule) => void;
}

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const [expanded, setExpanded] = useState<Set<keyof OfficeSchedule>>(
    () => new Set(Object.keys(value) as (keyof OfficeSchedule)[])
  );

  const toggleDay = (day: keyof OfficeSchedule) => {
    if (expanded.has(day)) {
      // Desactivar día — eliminar del schedule
      const next = { ...value };
      delete next[day];
      onChange(next);
      setExpanded((prev) => { const s = new Set(prev); s.delete(day); return s; });
    } else {
      // Activar día — añadir franja por defecto
      onChange({ ...value, [day]: [{ start: "09:00", end: "14:00" }] });
      setExpanded((prev) => new Set([...prev, day]));
    }
  };

  const addRange = (day: keyof OfficeSchedule) => {
    const current = value[day] ?? [];
    onChange({ ...value, [day]: [...current, { start: "15:00", end: "18:00" }] });
  };

  const removeRange = (day: keyof OfficeSchedule, index: number) => {
    const current = value[day] ?? [];
    const next = current.filter((_, i) => i !== index);
    if (next.length === 0) {
      // Si no quedan franjas, desactivar el día
      const nextSchedule = { ...value };
      delete nextSchedule[day];
      onChange(nextSchedule);
      setExpanded((prev) => { const s = new Set(prev); s.delete(day); return s; });
    } else {
      onChange({ ...value, [day]: next });
    }
  };

  const updateRange = (day: keyof OfficeSchedule, index: number, field: keyof DaySchedule, val: string) => {
    const current = [...(value[day] ?? [])];
    current[index] = { ...current[index], [field]: val };
    onChange({ ...value, [day]: current });
  };

  return (
    <Box>
      {/* Selector de días */}
      <Group gap={6} mb={12}>
        {DAYS.map((d) => {
          const active = expanded.has(d.key);
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleDay(d.key)}
              style={{
                width: 32, height: 32,
                borderRadius: 8,
                border: active ? "1.5px solid #2563eb" : "1.5px solid #e5e7eb",
                backgroundColor: active ? "#eff6ff" : "#fff",
                color: active ? "#2563eb" : "#9ca3af",
                fontSize: 12, fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.12s",
                flexShrink: 0,
              }}
            >
              {d.short}
            </button>
          );
        })}
      </Group>

      {/* Franjas por día activo */}
      {DAYS.filter((d) => expanded.has(d.key)).length > 0 && (
        <Box
          style={{
            borderRadius: 10,
            border: "1px solid #f3f4f6",
            overflow: "hidden",
          }}
        >
          {DAYS.filter((d) => expanded.has(d.key)).map((d, dayIdx, arr) => {
            const ranges = value[d.key] ?? [];
            const isLast = dayIdx === arr.length - 1;
            return (
              <Box
                key={d.key}
                style={{
                  padding: "12px 14px",
                  borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                  backgroundColor: "#fafafa",
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Text style={{ fontSize: 12, fontWeight: 600, color: "#374151", width: 72, paddingTop: 6 }}>
                    {d.label}
                  </Text>
                  <Box style={{ flex: 1 }}>
                    {ranges.map((range, i) => (
                      <Group key={i} gap={8} mb={i < ranges.length - 1 ? 6 : 0} align="center">
                        <input
                          type="time"
                          value={range.start}
                          onChange={(e) => updateRange(d.key, i, "start", e.target.value)}
                          style={{
                            padding: "5px 8px", borderRadius: 6,
                            border: "1px solid #e5e7eb", fontSize: 13,
                            color: "#374151", backgroundColor: "#fff",
                            outline: "none", fontFamily: "inherit",
                          }}
                        />
                        <Text style={{ fontSize: 12, color: "#9ca3af" }}>→</Text>
                        <input
                          type="time"
                          value={range.end}
                          onChange={(e) => updateRange(d.key, i, "end", e.target.value)}
                          style={{
                            padding: "5px 8px", borderRadius: 6,
                            border: "1px solid #e5e7eb", fontSize: 13,
                            color: "#374151", backgroundColor: "#fff",
                            outline: "none", fontFamily: "inherit",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeRange(d.key, i)}
                          style={{
                            background: "none", border: "none",
                            cursor: "pointer", padding: 2, color: "#d1d5db",
                            display: "flex", alignItems: "center",
                          }}
                        >
                          <IconX size={13} />
                        </button>
                      </Group>
                    ))}

                    {ranges.length < 3 && (
                      <button
                        type="button"
                        onClick={() => addRange(d.key)}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          marginTop: ranges.length > 0 ? 6 : 0,
                          background: "none", border: "none",
                          cursor: "pointer", padding: 0,
                          color: "#9ca3af", fontSize: 12,
                        }}
                      >
                        <IconPlus size={11} />
                        Añadir franja
                      </button>
                    )}
                  </Box>
                </Group>
              </Box>
            );
          })}
        </Box>
      )}

      {DAYS.filter((d) => expanded.has(d.key)).length === 0 && (
        <Text style={{ fontSize: 12, color: "#d1d5db" }}>
          Sin días seleccionados
        </Text>
      )}
    </Box>
  );
}
