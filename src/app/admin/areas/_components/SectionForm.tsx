"use client";

import { useTransition } from "react";
import { Box } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import { createSection, updateSection, deleteSection } from "../actions";

interface Section {
  id: string;
  area_id: string;
  name: string;
  sort_order: number;
}

interface SectionFormProps {
  section?: Section;
  areaId: string;
  onClose: () => void;
}

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

export function SectionForm({ section, areaId, onClose }: SectionFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!section;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("area_id", areaId);
    startTransition(async () => {
      if (isEdit) await updateSection(fd);
      else await createSection(fd);
      onClose();
    });
  };

  const handleDelete = () => {
    if (!section) return;
    if (!confirm(`¿Eliminar la sección "${section.name}"?`)) return;
    startTransition(async () => {
      await deleteSection(section.id, areaId);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20, padding: "4px 0" }}>
        <input type="hidden" name="area_id" value={areaId} />
        {isEdit && <input type="hidden" name="id" value={section.id} />}

        {!isEdit && (
          <Box>
            <label style={labelStyle}>ID (slug) *</label>
            <input
              name="id"
              required
              placeholder="ej: captacion (sin espacios)"
              pattern="[a-z0-9_]+"
              style={inputStyle}
            />
            <Box style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Solo letras minúsculas, números y guiones bajos</Box>
          </Box>
        )}

        <Box>
          <label style={labelStyle}>Nombre *</label>
          <input
            name="name"
            required
            defaultValue={section?.name ?? ""}
            placeholder="Ej: Captación de usuarios"
            style={inputStyle}
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
              Eliminar sección
            </button>
          )}
          <Box style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}>
              {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
              {isEdit ? "Guardar" : "Crear sección"}
            </button>
          </Box>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
