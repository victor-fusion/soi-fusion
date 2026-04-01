"use client";

import { useState, useTransition } from "react";
import { changeEntregableStatus } from "../actions";

interface StatusSelectProps {
  entregableId: string;
  startupId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "pendiente",            label: "Pendiente" },
  { value: "en_progreso",          label: "En progreso" },
  { value: "en_revision",          label: "En revisión" },
  { value: "cambios_solicitados",  label: "Cambios sol." },
  { value: "completado",           label: "Completado" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pendiente:           { bg: "#f9fafb", color: "#9ca3af" },
  en_progreso:         { bg: "#eff6ff", color: "#2563eb" },
  en_revision:         { bg: "#fef9c3", color: "#ca8a04" },
  cambios_solicitados: { bg: "#fff1f2", color: "#e11d48" },
  completado:          { bg: "#f0fdf4", color: "#16a34a" },
};

export function StatusSelect({ entregableId, startupId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const style = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.pendiente;

  const handleChange = (value: string) => {
    if (value === currentStatus) return;
    if (value === "cambios_solicitados") {
      setPendingStatus(value);
      setNotes("");
      setShowNotesModal(true);
      return;
    }
    startTransition(async () => {
      await changeEntregableStatus(entregableId, value, startupId);
    });
  };

  const confirmNotes = () => {
    if (!pendingStatus) return;
    const status = pendingStatus;
    const reviewerNotes = notes.trim() || null;
    setShowNotesModal(false);
    setPendingStatus(null);
    startTransition(async () => {
      await changeEntregableStatus(entregableId, status, startupId, reviewerNotes ?? undefined);
    });
  };

  return (
    <>
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
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
          minWidth: 110,
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {showNotesModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowNotesModal(false); }}
        >
          <div
            style={{
              backgroundColor: "#fff", borderRadius: 14,
              padding: 28, width: "100%", maxWidth: 440,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6, marginTop: 0 }}>
              Solicitar cambios
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, marginTop: 0 }}>
              Opcional: indica qué hay que corregir
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: El deck no incluye las métricas de retención. Añade una diapositiva con DAU/MAU."
              rows={4}
              autoFocus
              style={{
                width: "100%", padding: "10px 12px",
                fontSize: 13, color: "#374151",
                border: "1px solid #e5e7eb", borderRadius: 8,
                outline: "none", resize: "vertical",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowNotesModal(false)}
                style={{
                  fontSize: 13, padding: "7px 16px", borderRadius: 7,
                  border: "1px solid #e5e7eb", background: "#fff",
                  color: "#6b7280", cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmNotes}
                style={{
                  fontSize: 13, fontWeight: 600,
                  padding: "7px 16px", borderRadius: 7,
                  border: "none", background: "#e11d48",
                  color: "#fff", cursor: "pointer",
                }}
              >
                Solicitar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
