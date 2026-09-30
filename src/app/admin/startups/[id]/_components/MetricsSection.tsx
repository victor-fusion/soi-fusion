"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, SimpleGrid, Paper } from "@mantine/core";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import type { StartupMetrics } from "@/types";
import { saveMetrics, deleteMetrics } from "../actions";

const FIELDS = [
  { name: "revenue",          label: "Facturación (€)" },
  { name: "mrr",              label: "MRR (€)" },
  { name: "paying_customers", label: "Clientes de pago" },
  { name: "active_users",     label: "Usuarios activos" },
  { name: "pipeline_value",   label: "Pipeline (€)" },
  { name: "burn_rate",        label: "Burn rate (€/mes)" },
  { name: "runway_months",    label: "Runway (meses)" },
] as const;

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

const fmt = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : Number(v).toLocaleString("es-ES");

const monthLabel = (period: string) =>
  new Date(period + "T00:00:00").toLocaleDateString("es-ES", { month: "short", year: "numeric" });

interface MetricsSectionProps {
  startupId: string;
  metrics: StartupMetrics[];
}

export function MetricsSection({ startupId, metrics }: MetricsSectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StartupMetrics | null>(null);
  const [isPending, startTransition] = useTransition();

  const openForm = (m: StartupMetrics | null) => {
    setEditing(m);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveMetrics(fd);
      setOpen(false);
    });
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <Box>
      <Group justify="space-between" mb={16}>
        <Box>
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Métricas mensuales</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>Un registro por mes. Si el mes ya existe, se actualiza.</Text>
        </Box>
        <button
          type="button"
          onClick={() => openForm(null)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            border: "1px solid #e5e7eb", backgroundColor: "#fff",
            color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <IconPlus size={14} />
          Registrar mes
        </button>
      </Group>

      {metrics.length === 0 ? (
        <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
            Aún no hay métricas registradas.
          </Text>
        </Paper>
      ) : (
        <Paper radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "#6b7280", fontWeight: 600, fontSize: 11 }}>Mes</th>
                {FIELDS.map((f) => (
                  <th key={f.name} style={{ textAlign: "right", padding: "10px 14px", color: "#6b7280", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>
                    {f.label}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => openForm(m)}
                  style={{ borderTop: "1px solid #f3f4f6", cursor: "pointer" }}
                  title={m.notes ?? "Editar"}
                >
                  <td style={{ padding: "10px 14px", color: "#111827", fontWeight: 500, whiteSpace: "nowrap" }}>{monthLabel(m.period)}</td>
                  {FIELDS.map((f) => (
                    <td key={f.name} style={{ padding: "10px 14px", textAlign: "right", color: "#374151" }}>
                      {fmt(m[f.name])}
                    </td>
                  ))}
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <button
                      type="button"
                      title="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar las métricas de ${monthLabel(m.period)}?`)) {
                          startTransition(() => deleteMetrics(m.id, startupId));
                        }
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex" }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}

      {open && (
        <Box
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <Box style={{ backgroundColor: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
              {editing ? `Métricas de ${monthLabel(editing.period)}` : "Registrar métricas del mes"}
            </Text>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="startup_id" value={startupId} />
              <Box mb={16}>
                <label style={labelStyle}>Mes *</label>
                <input
                  type="month"
                  name="period"
                  required
                  defaultValue={editing ? editing.period.slice(0, 7) : currentMonth}
                  style={inputStyle}
                />
              </Box>
              <SimpleGrid cols={2} spacing={12} mb={16}>
                {FIELDS.map((f) => (
                  <Box key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type="number"
                      step="any"
                      name={f.name}
                      defaultValue={editing?.[f.name] ?? ""}
                      style={inputStyle}
                    />
                  </Box>
                ))}
              </SimpleGrid>
              <Box mb={20}>
                <label style={labelStyle}>Notas</label>
                <textarea name="notes" rows={2} defaultValue={editing?.notes ?? ""} style={{ ...inputStyle, resize: "vertical" }} />
              </Box>
              <Group justify="flex-end" gap={8}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
    </Box>
  );
}
