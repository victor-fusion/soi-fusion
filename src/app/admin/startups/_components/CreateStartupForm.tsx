"use client";

import { useState, useTransition, useRef } from "react";
import { createStartup } from "../actions";

const TYPE_OPTIONS = [
  { value: "b2b_saas", label: "B2B SaaS" },
  { value: "b2c_app", label: "B2C App" },
  { value: "marketplace", label: "Marketplace" },
  { value: "producto_fisico", label: "Producto físico" },
  { value: "servicios", label: "Servicios" },
];

const inputStyle: React.CSSProperties = {
  fontSize: 13,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  outline: "none",
  backgroundColor: "#fff",
  width: "100%",
  boxSizing: "border-box",
};

export function CreateStartupForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await createStartup(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 13,
          fontWeight: 600,
          padding: "8px 18px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#16a34a",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        + Nueva startup
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 10 }}>
        <input name="name" required placeholder="Nombre de la startup" style={inputStyle} />
        <input name="sector" placeholder="Sector (ej: Educación, Salud…)" style={inputStyle} />
        <select name="type" required style={inputStyle}>
          <option value="">Tipo…</option>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            fontSize: 13, padding: "6px 14px", borderRadius: 7,
            border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          style={{
            fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 7,
            border: "none", background: "#16a34a", color: "#fff",
            cursor: isPending ? "wait" : "pointer", opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Creando…" : "Crear startup"}
        </button>
      </div>
    </form>
  );
}
