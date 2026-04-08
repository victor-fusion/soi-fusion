"use client";

import { useTransition, useState } from "react";
import { Box } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import { createArea, updateArea, deleteArea } from "../actions";

interface AreaRecord {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

interface AreaFormProps {
  area?: AreaRecord;
  onClose: () => void;
  onAfterDelete?: () => void;
}

const PRESET_COLORS = [
  "#16A34A", "#2563EB", "#EA580C", "#7C3AED",
  "#DB2777", "#D97706", "#0D9488", "#6b7280", "#111827", "#ef4444",
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  fontSize: 14, color: "#374151",
  backgroundColor: "#fafafa",
  border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600,
  color: "#6b7280", marginBottom: 6, display: "block",
};

const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .trim()
    .replace(/\s+/g, "_");

export function AreaForm({ area, onClose, onAfterDelete }: AreaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedColor, setSelectedColor] = useState(area?.color ?? "#16A34A");
  const [slug, setSlug] = useState(area?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const isEdit = !!area;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugTouched) setSlug(toSlug(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (isEdit) await updateArea(fd);
      else await createArea(fd);
      onClose();
    });
  };

  const handleDelete = () => {
    if (!area) return;
    if (!confirm(`¿Eliminar el área "${area.name}" y todas sus secciones? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteArea(area.id);
      if (onAfterDelete) onAfterDelete();
      else onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20, padding: "4px 0" }}>
        {isEdit && <input type="hidden" name="id" value={area.id} />}

        <Box>
          <label style={labelStyle}>Nombre *</label>
          <input
            name="name"
            required
            defaultValue={area?.name ?? ""}
            placeholder="Ej: Estrategia"
            style={inputStyle}
            onChange={handleNameChange}
          />
        </Box>

        {!isEdit && (
          <Box>
            <label style={labelStyle}>ID (slug) *</label>
            <input
              name="id"
              required
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="ej: estrategia"
              pattern="[a-z0-9_]+"
              style={inputStyle}
            />
            <Box style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Se genera automáticamente. Solo minúsculas, números y guiones bajos.</Box>
          </Box>
        )}

        <Box>
          <label style={labelStyle}>Color</label>
          <input type="hidden" name="color" value={selectedColor} readOnly />
          <Box style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: c,
                  border: selectedColor === c ? "3px solid #111827" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "border-color 0.1s",
                }}
              />
            ))}
          </Box>
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            placeholder="#16A34A"
            pattern="^#[0-9A-Fa-f]{6}$"
            style={{ ...inputStyle, width: 140 }}
          />
        </Box>

        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20, display: "flex", justifyContent: isEdit ? "space-between" : "flex-end", alignItems: "center" }}>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 500 }}
            >
              Eliminar área
            </button>
          )}
          <Box style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}>
              {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
              {isEdit ? "Guardar cambios" : "Crear área"}
            </button>
          </Box>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
