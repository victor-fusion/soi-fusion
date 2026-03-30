"use client";

import { useTransition } from "react";
import { changeEntregableStatus } from "../actions";

interface StatusSelectProps {
  entregableId: string;
  startupId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "done", label: "Completado" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#f9fafb", color: "#9ca3af" },
  in_progress: { bg: "#eff6ff", color: "#2563eb" },
  done: { bg: "#f0fdf4", color: "#16a34a" },
};

export function StatusSelect({ entregableId, startupId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const style = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.pending;

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        startTransition(async () => {
          await changeEntregableStatus(entregableId, e.target.value, startupId);
        });
      }}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 6,
        border: "1px solid #e5e7eb",
        backgroundColor: isPending ? "#f3f4f6" : style.bg,
        color: isPending ? "#9ca3af" : style.color,
        cursor: isPending ? "wait" : "pointer",
        outline: "none",
      }}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
