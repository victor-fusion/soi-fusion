"use client";

import { useState, useTransition, useRef } from "react";
import type { Area } from "@/types";
import { addEntregable } from "../actions";
import { IconX } from "@tabler/icons-react";

const TIPOS = [
  { value: "externo",    label: "Externo" },
  { value: "archivos",   label: "Archivos" },
  { value: "formulario", label: "Formulario" },
  { value: "link",       label: "Enlace" },
  { value: "checklist",  label: "Checklist" },
];

interface AddEntregableFormProps {
  startupId: string;
  currentPhase: number;
  areas: Area[];
}

export function AddEntregableForm({ startupId, currentPhase, areas }: AddEntregableFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tipo, setTipo] = useState("externo");
  const [fileSlots, setFileSlots] = useState<string[]>([""]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (tipo === "archivos") {
      const slots = fileSlots
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ label, required: true }));
      formData.set("file_slots", JSON.stringify(slots));
    }
    startTransition(async () => {
      await addEntregable(formData);
      formRef.current?.reset();
      setTipo("externo");
      setFileSlots([""]);
      setOpen(false);
    });
  };

  const inputStyle: React.CSSProperties = {
    fontSize: 13, padding: "8px 12px",
    borderRadius: 8, border: "1px solid #e5e7eb",
    outline: "none", backgroundColor: "#fff",
    width: "100%", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 500, color: "#16a34a",
          background: "none", border: "1px dashed #86efac",
          borderRadius: 8, padding: "8px 16px",
          cursor: "pointer", width: "100%", justifyContent: "center",
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
        padding: 20, borderRadius: 12,
        border: "1px solid #e5e7eb", backgroundColor: "#fafafa",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <input type="hidden" name="startup_id" value={startupId} />
      <input type="hidden" name="phase" value={currentPhase} />
      <input type="hidden" name="tipo" value={tipo} />

      {/* Título + Área */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
        <input
          name="title"
          required
          placeholder="Título del entregable"
          style={inputStyle}
        />
        <select
          name="area"
          required
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">Área…</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
      </div>

      {/* Tipo */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, alignItems: "center" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Tipo</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 6,
                border: tipo === t.value ? "1.5px solid #2563eb" : "1.5px solid #e5e7eb",
                backgroundColor: tipo === t.value ? "#eff6ff" : "#fff",
                color: tipo === t.value ? "#2563eb" : "#6b7280",
                cursor: "pointer", fontWeight: tipo === t.value ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* File slots (solo para tipo archivos) */}
      {tipo === "archivos" && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, marginTop: 0 }}>
            Slots de archivo (etiquetas)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {fileSlots.map((slot, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  value={slot}
                  onChange={(e) => {
                    const next = [...fileSlots];
                    next[i] = e.target.value;
                    setFileSlots(next);
                  }}
                  placeholder={`Ej: Pitch Deck, Modelo financiero…`}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {fileSlots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFileSlots(fileSlots.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
            ))}
            {fileSlots.length < 6 && (
              <button
                type="button"
                onClick={() => setFileSlots([...fileSlots, ""])}
                style={{
                  fontSize: 12, color: "#2563eb", background: "none",
                  border: "1px dashed #bfdbfe", borderRadius: 6,
                  padding: "5px 10px", cursor: "pointer", alignSelf: "flex-start",
                }}
              >
                + Añadir slot
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botones */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => { setOpen(false); setTipo("externo"); setFileSlots([""]); }}
          style={{
            fontSize: 13, padding: "6px 14px", borderRadius: 7,
            border: "1px solid #e5e7eb", background: "#fff",
            color: "#6b7280", cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          style={{
            fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 7,
            border: "none", background: "#16a34a",
            color: "#fff", cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Guardando…" : "Añadir"}
        </button>
      </div>
    </form>
  );
}
