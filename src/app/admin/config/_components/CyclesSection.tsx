"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, Stack, Paper, ThemeIcon, Badge, SimpleGrid } from "@mantine/core";
import { IconCalendar, IconPlus, IconPencil, IconTrash, IconLoader2, IconCheck } from "@tabler/icons-react";
import type { Cycle } from "@/types";
import { saveCycle, setActiveCycle, deleteCycle } from "../actions";
import { CycleBadge } from "@/components/ui/CycleBadge";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px",
  fontSize: 13, color: "#374151",
  backgroundColor: "#fafafa",
  border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, display: "block",
};

const iconButton: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4,
};

const fmt = (d?: string | null) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** Siguiente ciclo sugerido: número +1 y fechas a continuación del último (6 meses). */
function nextCycle(cycles: Cycle[]): Cycle {
  const last = cycles.at(-1);
  const number = (last?.number ?? 0) + 1;
  if (!last?.end_date) return { number, is_active: false };
  const start = new Date(last.end_date + "T00:00:00");
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 6);
  end.setDate(end.getDate() - 1);
  const iso = (d: Date) => d.toLocaleDateString("en-CA");
  return { number, start_date: iso(start), end_date: iso(end), is_active: false };
}

interface CyclesSectionProps {
  cycles: Cycle[];
  startupsPerCycle: Record<number, number>;
}

export function CyclesSection({ cycles, startupsPerCycle }: CyclesSectionProps) {
  const [editing, setEditing] = useState<{ cycle: Cycle; isNew: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ error?: string }>, after?: () => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else after?.();
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const number = parseInt(fd.get("number") as string, 10);
    if (editing?.isNew && cycles.some((c) => c.number === number)) {
      setError(`El ciclo ${number} ya existe: edítalo desde la lista.`);
      return;
    }
    run(() => saveCycle(fd), () => setEditing(null));
  };

  const active = cycles.find((c) => c.is_active);
  const sorted = [...cycles].sort((a, b) => b.number - a.number);

  return (
    <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
      <Group justify="space-between" mb={20}>
        <Group gap={10}>
          <ThemeIcon size={32} radius="lg" color="green" variant="light">
            <IconCalendar size={16} />
          </ThemeIcon>
          <Box>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Ciclos</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {active ? `Activo: ciclo ${active.number}` : "Ningún ciclo activo"} · el activo se usa por defecto al crear startups y en el Centro de Control
            </Text>
          </Box>
        </Group>
        <button
          type="button"
          onClick={() => setEditing({ cycle: nextCycle(cycles), isNew: true })}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            border: "1px solid #e5e7eb", backgroundColor: "#fff",
            color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <IconPlus size={14} />
          Nuevo ciclo
        </button>
      </Group>

      {error && (
        <Text style={{ fontSize: 13, color: "#e11d48", marginBottom: 12 }}>{error}</Text>
      )}

      <Stack gap={6} style={{ opacity: isPending ? 0.6 : 1 }}>
        {sorted.map((c) => (
          <Group
            key={c.number}
            justify="space-between"
            px={14} py={10}
            style={{
              borderRadius: 10,
              border: c.is_active ? "1.5px solid #16a34a" : "1px solid #f3f4f6",
              backgroundColor: c.is_active ? "#f0fdf4" : "#fff",
            }}
          >
            <Group gap={14}>
              <CycleBadge number={c.number} size="sm" />
              {c.name && <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.name}</Text>}
              <Text style={{ fontSize: 13, color: "#6b7280" }}>
                {fmt(c.start_date)} → {fmt(c.end_date)}
              </Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                {startupsPerCycle[c.number] ?? 0} startups
              </Text>
              {c.is_active && <Badge size="sm" color="green" variant="light">Activo</Badge>}
            </Group>
            <Group gap={4}>
              {!c.is_active && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => setActiveCycle(c.number))}
                  style={{ ...iconButton, fontSize: 12, color: "#16a34a", fontWeight: 600, gap: 4, alignItems: "center" }}
                >
                  <IconCheck size={13} />
                  Activar
                </button>
              )}
              <button type="button" title="Editar" onClick={() => setEditing({ cycle: c, isNew: false })} style={iconButton}>
                <IconPencil size={15} />
              </button>
              <button
                type="button"
                title="Borrar"
                disabled={isPending || (startupsPerCycle[c.number] ?? 0) > 0}
                onClick={() => { if (confirm(`¿Borrar el ciclo ${c.number}?`)) run(() => deleteCycle(c.number)); }}
                style={{ ...iconButton, opacity: (startupsPerCycle[c.number] ?? 0) > 0 ? 0.3 : 1 }}
              >
                <IconTrash size={15} />
              </button>
            </Group>
          </Group>
        ))}
      </Stack>

      {editing && (
        <Box
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <Box style={{ backgroundColor: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
              {editing.isNew ? "Nuevo ciclo" : `Editar ciclo ${editing.cycle.number}`}
            </Text>
            <form onSubmit={handleSubmit}>
              <SimpleGrid cols={2} spacing={12} mb={12}>
                <Box>
                  <label style={labelStyle}>Número *</label>
                  <input
                    type="number" name="number" min={1} required
                    defaultValue={editing.cycle.number}
                    readOnly={!editing.isNew}
                    style={{ ...inputStyle, color: editing.isNew ? "#374151" : "#9ca3af" }}
                  />
                </Box>
                <Box>
                  <label style={labelStyle}>Nombre (opcional)</label>
                  <input name="name" defaultValue={editing.cycle.name ?? ""} placeholder={`Ciclo ${editing.cycle.number}`} style={inputStyle} />
                </Box>
                <Box>
                  <label style={labelStyle}>Inicio</label>
                  <input type="date" name="start_date" defaultValue={editing.cycle.start_date ?? ""} style={inputStyle} />
                </Box>
                <Box>
                  <label style={labelStyle}>Fin</label>
                  <input type="date" name="end_date" defaultValue={editing.cycle.end_date ?? ""} style={inputStyle} />
                </Box>
              </SimpleGrid>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 20 }}>
                La fecha de inicio se usa por defecto como inicio de las startups nuevas de este ciclo.
              </Text>
              <Group justify="flex-end" gap={8}>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}
                >
                  {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  Guardar
                </button>
              </Group>
            </form>
          </Box>
        </Box>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Paper>
  );
}
