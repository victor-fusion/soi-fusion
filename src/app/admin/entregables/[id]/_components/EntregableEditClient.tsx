"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Group } from "@mantine/core";
import { IconLoader2, IconX } from "@tabler/icons-react";
import type { EntregableTemplate, Area } from "@/types";
import { updateTemplate } from "../../actions";

type Phase = { number: number; name: string; color: string };

const TIPOS = [
  { value: "externo",    label: "Externo" },
  { value: "archivos",   label: "Archivos" },
  { value: "formulario", label: "Formulario" },
  { value: "link",       label: "Enlace" },
  { value: "checklist",  label: "Checklist" },
];

interface EntregableEditClientProps {
  template: EntregableTemplate;
  areas: Area[];
  phases: Phase[];
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: 14, color: "#374151",
  backgroundColor: "#fafafa", border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block",
};

export function EntregableEditClient({ template, areas, phases: PHASES }: EntregableEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedArea, setSelectedArea] = useState(template.area);
  const [tipo, setTipo] = useState<string>(template.tipo ?? "externo");
  const [fileSlots, setFileSlots] = useState<string[]>(
    template.file_slots?.map((s) => s.label) ?? [""]
  );

  const area = areas.find((a) => a.id === selectedArea);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (tipo === "archivos") {
      const slots = fileSlots.map((s) => s.trim()).filter(Boolean).map((label) => ({ label, required: true }));
      fd.set("file_slots", JSON.stringify(slots));
    } else {
      fd.set("file_slots", "[]");
    }
    fd.set("tipo", tipo);
    startTransition(async () => {
      await updateTemplate(fd);
      router.push("/admin/entregables");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={template.id} />

      <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Título */}
        <Box>
          <label style={labelStyle}>Título *</label>
          <input
            name="title" required
            defaultValue={template.title}
            placeholder="Ej: Pitch Deck con métricas"
            style={inputStyle}
          />
        </Box>

        {/* Descripción */}
        <Box>
          <label style={labelStyle}>Descripción</label>
          <textarea
            name="description"
            defaultValue={template.description ?? ""}
            placeholder="Qué debe contener este entregable y para qué sirve…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Box>

        {/* Área + Fase */}
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Box>
            <label style={labelStyle}>Área *</label>
            <select
              name="area" required
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Box>
          <Box>
            <label style={labelStyle}>Fase *</label>
            <select
              name="phase" required
              defaultValue={template.phase}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {PHASES.map((p) => (
                <option key={p.number} value={p.number}>{p.number} · {p.name}</option>
              ))}
            </select>
          </Box>
        </Box>

        {/* Sección + Orden */}
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 16 }}>
          <Box>
            <label style={labelStyle}>Sección *</label>
            <select
              name="section" required
              defaultValue={template.section}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Selecciona sección…</option>
              {(area?.sections ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Box>
          <Box>
            <label style={labelStyle}>Orden</label>
            <input
              type="number" name="order" min={0}
              defaultValue={template.order ?? 0}
              style={inputStyle}
            />
          </Box>
        </Box>

        {/* Tipo */}
        <Box>
          <label style={labelStyle}>Tipo</label>
          <Group gap={6}>
            {TIPOS.map((t) => (
              <button
                key={t.value} type="button"
                onClick={() => setTipo(t.value)}
                style={{
                  fontSize: 13, padding: "6px 14px", borderRadius: 6,
                  border: tipo === t.value ? "1.5px solid #2563eb" : "1.5px solid #e5e7eb",
                  backgroundColor: tipo === t.value ? "#eff6ff" : "#fff",
                  color: tipo === t.value ? "#2563eb" : "#6b7280",
                  cursor: "pointer", fontWeight: tipo === t.value ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </Group>
        </Box>

        {/* File slots */}
        {tipo === "archivos" && (
          <Box>
            <label style={labelStyle}>Slots de archivo</label>
            <Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {fileSlots.map((slot, i) => (
                <Box key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    value={slot}
                    onChange={(e) => {
                      const next = [...fileSlots];
                      next[i] = e.target.value;
                      setFileSlots(next);
                    }}
                    placeholder="Ej: Pitch Deck, Modelo financiero…"
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
                </Box>
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
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Box style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
          <button
            type="button"
            onClick={() => router.push("/admin/entregables")}
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
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
