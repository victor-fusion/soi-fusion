"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import { createSection, updateSection, deleteSection } from "../../areas/actions";

type Area = { id: string; name: string; color: string };

interface SeccionFormProps {
  section?: { id: string; area_id: string; name: string; sort_order: number };
  areaId: string;
  areaName: string;
  areas?: Area[];
  onClose: () => void;
}

const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .trim()
    .replace(/\s+/g, "_");

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: 14, color: "#374151",
  backgroundColor: "#fafafa", border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block",
};

export function SeccionForm({ section, areaId, areaName, areas, onClose }: SeccionFormProps) {
  const isEdit = !!section;
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState(section?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(areaId || (areas?.[0]?.id ?? ""));

  const effectiveAreaId = isEdit ? (section?.area_id ?? areaId) : selectedAreaId;
  const effectiveAreaName = isEdit
    ? areaName
    : (areas?.find((a) => a.id === selectedAreaId)?.name ?? areaName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugTouched) setSlug(toSlug(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("area_id", effectiveAreaId);
    startTransition(async () => {
      if (isEdit) await updateSection(fd);
      else await createSection(fd);
      onClose();
    });
  };

  const handleDelete = () => {
    if (!section) return;
    if (!confirm(`¿Eliminar la sección "${section.name}"? Esto puede afectar a recursos y entregables.`)) return;
    startTransition(async () => {
      await deleteSection(section.id, section.area_id);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {isEdit && <input type="hidden" name="id" value={section.id} />}

      {/* Área */}
      {isEdit || !areas ? (
        <Box px={14} py={10} style={{ backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }}>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>Área</Text>
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 2 }}>{effectiveAreaName}</Text>
        </Box>
      ) : (
        <Box>
          <label style={labelStyle}>Área *</label>
          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Selecciona un área</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Box>
      )}

      {/* Nombre */}
      <Box>
        <label style={labelStyle}>Nombre *</label>
        <input
          name="name" required
          defaultValue={section?.name ?? ""}
          placeholder="Ej: Ventas B2B"
          style={inputStyle}
          onChange={handleNameChange}
        />
      </Box>

      {/* Slug */}
      {!isEdit && (
        <Box>
          <label style={labelStyle}>ID (slug) *</label>
          <input
            name="id" required
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="ej: ventas_b2b"
            pattern="[a-z0-9_]+"
            style={inputStyle}
          />
          <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
            Se genera automáticamente. Solo minúsculas, números y guiones bajos.
          </Text>
        </Box>
      )}

      <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
        <Group justify={isEdit ? "space-between" : "flex-end"} align="center">
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={isPending}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 500 }}>
              Eliminar sección
            </button>
          )}
          <Group gap={8}>
            <button type="button" onClick={onClose}
              style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}>
              {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
              {isEdit ? "Guardar cambios" : "Crear sección"}
            </button>
          </Group>
        </Group>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
