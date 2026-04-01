"use client";

import { useState, useTransition } from "react";
import { AREAS } from "@/constants/areas";
import { IconLoader2 } from "@tabler/icons-react";
import type { Card } from "@/types";
import { createRecurso, updateRecurso } from "../actions";

const CARD_TYPES = [
  { value: "playbook",      label: "Playbook" },
  { value: "template",      label: "Plantilla" },
  { value: "tool",          label: "Herramienta" },
  { value: "ai_tool",       label: "Herramienta IA" },
  { value: "checklist",     label: "Checklist" },
  { value: "resource",      label: "Recurso" },
  { value: "external_link", label: "Enlace externo" },
];

interface RecursoFormProps {
  card?: Card & { area_id?: string };
  onClose: () => void;
}

export function RecursoForm({ card, onClose }: RecursoFormProps) {
  const isEdit = !!card;
  const [isPending, startTransition] = useTransition();

  // Determinar área actual desde section_id
  const initialArea = card?.area_id ?? AREAS[0].id;
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedSection, setSelectedSection] = useState(card?.section_id ?? "");
  const [cardType, setCardType] = useState<string>(card?.type ?? "resource");

  const area = AREAS.find((a) => a.id === selectedArea);

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
    fd.set("section_id", selectedSection);
    fd.set("type", cardType);
    startTransition(async () => {
      if (isEdit) await updateRecurso(fd);
      else await createRecurso(fd);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {isEdit && <input type="hidden" name="id" value={card.id} />}

      {/* Título */}
      <div>
        <label style={labelStyle}>Título *</label>
        <input
          name="title" required
          defaultValue={card?.title ?? ""}
          placeholder="Ej: Guía de pricing B2B SaaS"
          style={inputStyle}
        />
      </div>

      {/* Descripción */}
      <div>
        <label style={labelStyle}>Descripción</label>
        <textarea
          name="description"
          defaultValue={card?.description ?? ""}
          placeholder="Qué aprenderá o encontrará el founder en este recurso…"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Área + Sección */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Área *</label>
          <select
            value={selectedArea}
            onChange={(e) => { setSelectedArea(e.target.value); setSelectedSection(""); }}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
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
        </div>
      </div>

      {/* Tipo */}
      <div>
        <label style={labelStyle}>Tipo *</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CARD_TYPES.map((t) => (
            <button
              key={t.value} type="button"
              onClick={() => setCardType(t.value)}
              style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 6,
                border: cardType === t.value ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                backgroundColor: cardType === t.value ? "#f0fdf4" : "#fff",
                color: cardType === t.value ? "#16a34a" : "#6b7280",
                cursor: "pointer", fontWeight: cardType === t.value ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* URL (para external_link, tool, ai_tool) */}
      {["external_link", "tool", "ai_tool"].includes(cardType) && (
        <div>
          <label style={labelStyle}>URL</label>
          <input
            type="url" name="url"
            defaultValue={card?.url ?? ""}
            placeholder="https://…"
            style={inputStyle}
          />
        </div>
      )}

      {/* Contenido markdown (para playbook, template, checklist, resource) */}
      {["playbook", "template", "checklist", "resource"].includes(cardType) && (
        <div>
          <label style={labelStyle}>Contenido (Markdown)</label>
          <textarea
            name="content"
            defaultValue={card?.content ?? ""}
            placeholder={"# Título\n\nEscribe el contenido en Markdown…"}
            rows={8}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
          />
        </div>
      )}

      {/* Footer */}
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
          {isEdit ? "Guardar cambios" : "Crear recurso"}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
