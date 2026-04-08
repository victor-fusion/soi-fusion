"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Group } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import type { Card, Area } from "@/types";
import { updateRecurso, deleteRecurso } from "../../actions";

const CARD_TYPES = [
  { value: "playbook",      label: "Playbook" },
  { value: "template",      label: "Plantilla" },
  { value: "tool",          label: "Herramienta" },
  { value: "ai_tool",       label: "Herramienta IA" },
  { value: "checklist",     label: "Checklist" },
  { value: "resource",      label: "Recurso" },
  { value: "external_link", label: "Enlace externo" },
];

interface RecursoEditClientProps {
  card: Card & { area_id: string };
  areas: Area[];
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: 14, color: "#374151",
  backgroundColor: "#fafafa", border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block",
};

export function RecursoEditClient({ card, areas }: RecursoEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedArea, setSelectedArea] = useState(card.area_id);
  const [selectedSection, setSelectedSection] = useState(card.section_id);
  const [cardType, setCardType] = useState<string>(card.type);

  const area = areas.find((a) => a.id === selectedArea);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("section_id", selectedSection);
    fd.set("type", cardType);
    startTransition(async () => {
      await updateRecurso(fd);
      router.push("/admin/recursos");
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el recurso "${card.title}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteRecurso(card.id);
      router.push("/admin/recursos");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={card.id} />

      <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Título */}
        <Box>
          <label style={labelStyle}>Título *</label>
          <input
            name="title" required
            defaultValue={card.title}
            placeholder="Ej: Guía de pricing B2B SaaS"
            style={inputStyle}
          />
        </Box>

        {/* Descripción */}
        <Box>
          <label style={labelStyle}>Descripción</label>
          <textarea
            name="description"
            defaultValue={card.description ?? ""}
            placeholder="Qué aprenderá o encontrará el founder en este recurso…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Box>

        {/* Área + Sección */}
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Box>
            <label style={labelStyle}>Área *</label>
            <select
              value={selectedArea}
              onChange={(e) => { setSelectedArea(e.target.value); setSelectedSection(""); }}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Box>
          <Box>
            <label style={labelStyle}>Sección *</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              required
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Selecciona…</option>
              {(area?.sections ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Box>
        </Box>

        {/* Tipo */}
        <Box>
          <label style={labelStyle}>Tipo *</label>
          <Group gap={6} style={{ flexWrap: "wrap" }}>
            {CARD_TYPES.map((t) => (
              <button
                key={t.value} type="button"
                onClick={() => setCardType(t.value)}
                style={{
                  fontSize: 13, padding: "6px 14px", borderRadius: 6,
                  border: cardType === t.value ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                  backgroundColor: cardType === t.value ? "#f0fdf4" : "#fff",
                  color: cardType === t.value ? "#16a34a" : "#6b7280",
                  cursor: "pointer", fontWeight: cardType === t.value ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </Group>
        </Box>

        {/* URL (para external_link, tool, ai_tool) */}
        {["external_link", "tool", "ai_tool"].includes(cardType) && (
          <Box>
            <label style={labelStyle}>URL</label>
            <input
              type="url" name="url"
              defaultValue={card.url ?? ""}
              placeholder="https://…"
              style={inputStyle}
            />
          </Box>
        )}

        {/* Contenido markdown (para playbook, template, checklist, resource) */}
        {["playbook", "template", "checklist", "resource"].includes(cardType) && (
          <Box>
            <label style={labelStyle}>Contenido (Markdown)</label>
            <textarea
              name="content"
              defaultValue={card.content ?? ""}
              placeholder={"# Título\n\nEscribe el contenido en Markdown…"}
              rows={12}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
            />
          </Box>
        )}

        {/* Footer */}
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 500 }}
          >
            Eliminar recurso
          </button>
          <Box style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => router.push("/admin/recursos")}
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
              Guardar cambios
            </button>
          </Box>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
