"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, Stack, Paper } from "@mantine/core";
import { IconPlus, IconTrash, IconLoader2, IconSquare, IconSquareCheck, IconX } from "@tabler/icons-react";
import type { ActionItem, Weekly } from "@/types";
import { createWeekly, toggleActionItem, deleteWeekly } from "../actions";

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

const dateLabel = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const emptyItem = (): ActionItem => ({ id: crypto.randomUUID(), text: "", owner: "", due_date: "", done: false });

interface WeekliesSectionProps {
  startupId: string;
  weeklies: Weekly[];
}

export function WeekliesSection({ startupId, weeklies }: WeekliesSectionProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ActionItem[]>([emptyItem()]);
  const [isPending, startTransition] = useTransition();

  const updateItem = (id: string, patch: Partial<ActionItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("action_items", JSON.stringify(
      items.filter((i) => i.text.trim()).map((i) => ({ ...i, due_date: i.due_date || undefined }))
    ));
    startTransition(async () => {
      await createWeekly(fd);
      setOpen(false);
      setItems([emptyItem()]);
    });
  };

  return (
    <Box>
      <Group justify="space-between" mb={16}>
        <Box>
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Weeklies</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>Agenda, notas y tareas acordadas en cada reunión semanal.</Text>
        </Box>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            border: "1px solid #e5e7eb", backgroundColor: "#fff",
            color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <IconPlus size={14} />
          Nueva weekly
        </button>
      </Group>

      {weeklies.length === 0 ? (
        <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>Aún no hay weeklies registradas.</Text>
        </Paper>
      ) : (
        <Stack gap={12}>
          {weeklies.map((w) => (
            <Paper key={w.id} p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
              <Group justify="space-between" mb={10}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>{dateLabel(w.date)}</Text>
                <button
                  type="button"
                  title="Eliminar weekly"
                  onClick={() => { if (confirm("¿Eliminar esta weekly?")) startTransition(() => deleteWeekly(w.id, startupId)); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex" }}
                >
                  <IconTrash size={14} />
                </button>
              </Group>

              {w.agenda.length > 0 && (
                <Box mb={10}>
                  <Text style={labelStyle}>Agenda</Text>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#374151" }}>
                    {w.agenda.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </Box>
              )}

              {w.notes && (
                <Box mb={10}>
                  <Text style={labelStyle}>Notas</Text>
                  <Text style={{ fontSize: 13, color: "#374151", whiteSpace: "pre-wrap" }}>{w.notes}</Text>
                </Box>
              )}

              {w.action_items.length > 0 && (
                <Box>
                  <Text style={labelStyle}>Tareas</Text>
                  <Stack gap={4}>
                    {w.action_items.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        disabled={isPending}
                        onClick={() => startTransition(() => toggleActionItem(w.id, a.id, startupId))}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, textAlign: "left",
                          background: "none", border: "none", padding: "2px 0", cursor: "pointer",
                          fontSize: 13, color: a.done ? "#9ca3af" : "#374151",
                          textDecoration: a.done ? "line-through" : "none",
                        }}
                      >
                        {a.done ? <IconSquareCheck size={15} color="#16a34a" /> : <IconSquare size={15} color="#d1d5db" />}
                        <span>
                          {a.text}
                          {a.owner && <span style={{ color: "#9ca3af" }}> · {a.owner}</span>}
                          {a.due_date && <span style={{ color: "#9ca3af" }}> · {a.due_date}</span>}
                        </span>
                      </button>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          ))}
        </Stack>
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
          <Box style={{ backgroundColor: "#fff", borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Nueva weekly</Text>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="startup_id" value={startupId} />
              <Box mb={16}>
                <label style={labelStyle}>Fecha *</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} style={inputStyle} />
              </Box>
              <Box mb={16}>
                <label style={labelStyle}>Agenda (un punto por línea)</label>
                <textarea name="agenda" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </Box>
              <Box mb={16}>
                <label style={labelStyle}>Notas</label>
                <textarea name="notes" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </Box>

              <Box mb={20}>
                <label style={labelStyle}>Tareas acordadas</label>
                <Stack gap={8}>
                  {items.map((i) => (
                    <Group key={i.id} gap={6} wrap="nowrap">
                      <input
                        placeholder="Tarea"
                        value={i.text}
                        onChange={(e) => updateItem(i.id, { text: e.target.value })}
                        style={{ ...inputStyle, flex: 3 }}
                      />
                      <input
                        placeholder="Responsable"
                        value={i.owner}
                        onChange={(e) => updateItem(i.id, { owner: e.target.value })}
                        style={{ ...inputStyle, flex: 2 }}
                      />
                      <input
                        type="date"
                        value={i.due_date ?? ""}
                        onChange={(e) => updateItem(i.id, { due_date: e.target.value })}
                        style={{ ...inputStyle, flex: 2 }}
                      />
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.length > 1 ? prev.filter((x) => x.id !== i.id) : [emptyItem()])}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}
                      >
                        <IconX size={14} />
                      </button>
                    </Group>
                  ))}
                </Stack>
                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, emptyItem()])}
                  style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontSize: 12, fontWeight: 600, padding: 0 }}
                >
                  + Añadir tarea
                </button>
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
                  Guardar weekly
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
