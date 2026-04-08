"use client";

import { useTransition, useState } from "react";
import { Box, SimpleGrid } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import { createFase, updateFase, deleteFase } from "../actions";

interface Phase {
  id: number;
  number: number;
  name: string;
  color: string;
}

interface FaseFormProps {
  fase?: Phase;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#2563EB", "#D97706", "#EA580C", "#16A34A", "#7C3AED", "#DB2777",
  "#0D9488", "#6b7280", "#111827", "#ef4444",
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

export function FaseForm({ fase, onClose }: FaseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedColor, setSelectedColor] = useState(fase?.color ?? "#2563EB");
  const isEdit = !!fase;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (isEdit) {
        await updateFase(fd);
      } else {
        await createFase(fd);
      }
      onClose();
    });
  };

  const handleDelete = () => {
    if (!fase) return;
    if (!confirm(`¿Eliminar la fase "${fase.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteFase(fase.id);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20, padding: "4px 0" }}>
        {isEdit && <input type="hidden" name="id" value={fase.id} />}

        <SimpleGrid cols={2} spacing={16}>
          <Box>
            <label style={labelStyle}>Número</label>
            <input
              type="number"
              name="number"
              required
              min={1}
              defaultValue={fase?.number ?? ""}
              placeholder="1"
              style={inputStyle}
              disabled={isEdit}
            />
          </Box>
          <Box>
            <label style={labelStyle}>Nombre *</label>
            <input
              name="name"
              required
              defaultValue={fase?.name ?? ""}
              placeholder="Ej: Descubrir"
              style={inputStyle}
            />
          </Box>
        </SimpleGrid>

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
            placeholder="#2563EB"
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
              Eliminar fase
            </button>
          )}
          <Box style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}
            >
              {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
              {isEdit ? "Guardar cambios" : "Crear fase"}
            </button>
          </Box>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
