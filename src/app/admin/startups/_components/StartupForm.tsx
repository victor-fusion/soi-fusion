"use client";

import { useTransition } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { createStartup } from "../actions";

const TYPE_OPTIONS = [
  { value: "b2b_saas",        label: "B2B SaaS" },
  { value: "b2c_app",         label: "B2C App" },
  { value: "marketplace",     label: "Marketplace" },
  { value: "producto_fisico", label: "Producto físico" },
  { value: "servicios",       label: "Servicios" },
];

interface StartupFormProps {
  onClose: () => void;
}

export function StartupForm({ onClose }: StartupFormProps) {
  const [isPending, startTransition] = useTransition();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: 13, color: "#374151",
    backgroundColor: "#fafafa", border: "1px solid #e5e7eb",
    borderRadius: 8, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#6b7280",
    marginBottom: 6, display: "block",
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createStartup(fd);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      <div>
        <label style={labelStyle}>Nombre *</label>
        <input name="name" required placeholder="Ej: Acme Analytics" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Tagline</label>
        <input name="tagline" placeholder="Una frase corta que describe la startup" style={inputStyle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Tipo *</label>
          <select name="type" required style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">Selecciona tipo…</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Sector</label>
          <input name="sector" placeholder="Ej: Salud, Educación…" style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Ciclo *</label>
        <select name="batch" defaultValue={5} style={{ ...inputStyle, cursor: "pointer" }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>Ciclo {n}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
        <button
          type="button" onClick={onClose}
          style={{
            fontSize: 13, padding: "9px 18px", borderRadius: 8,
            border: "1px solid #e5e7eb", backgroundColor: "#fff",
            color: "#6b7280", cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={isPending}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, fontWeight: 600, padding: "9px 20px", borderRadius: 8,
            border: "none", backgroundColor: "#111827",
            color: "#fff", cursor: isPending ? "wait" : "pointer",
          }}
        >
          {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          Crear startup
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
