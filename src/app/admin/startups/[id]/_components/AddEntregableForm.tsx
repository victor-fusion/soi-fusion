"use client";

import { useState, useTransition, useRef } from "react";
import { AREAS } from "@/constants/areas";
import { addEntregable } from "../actions";

interface AddEntregableFormProps {
  startupId: string;
  currentPhase: number;
}

export function AddEntregableForm({ startupId, currentPhase }: AddEntregableFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await addEntregable(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: "#16a34a",
          background: "none",
          border: "1px dashed #86efac",
          borderRadius: 8,
          padding: "8px 16px",
          cursor: "pointer",
          width: "100%",
          justifyContent: "center",
        }}
      >
        + Añadir entregable
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <input type="hidden" name="startup_id" value={startupId} />
      <input type="hidden" name="phase" value={currentPhase} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
        <input
          name="title"
          required
          placeholder="Título del entregable"
          style={{
            fontSize: 13,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            outline: "none",
            backgroundColor: "#fff",
          }}
        />
        <select
          name="area"
          required
          style={{
            fontSize: 13,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            outline: "none",
          }}
        >
          <option value="">Área…</option>
          {AREAS.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            fontSize: 13,
            padding: "6px 14px",
            borderRadius: 7,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 16px",
            borderRadius: 7,
            border: "none",
            background: "#16a34a",
            color: "#fff",
            cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Guardando…" : "Añadir"}
        </button>
      </div>
    </form>
  );
}
