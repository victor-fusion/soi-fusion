"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import type { TemplateField } from "@/types";
import { saveTemplateResponse } from "../actions";

interface TemplateFormProps {
  cardId: string;
  fields: TemplateField[];
  savedResponses: Record<string, string>;
  savedAt?: string | null;
  areaColor: string;
}

export function TemplateForm({
  cardId,
  fields,
  savedResponses,
  savedAt,
  areaColor,
}: TemplateFormProps) {
  const [values, setValues] = useState<Record<string, string>>(savedResponses);
  const [lastSaved, setLastSaved] = useState<string | null>(savedAt ?? null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveTemplateResponse(cardId, values);
      setLastSaved(new Date().toISOString());
    });
  };

  const hasChanges = JSON.stringify(values) !== JSON.stringify(savedResponses);

  return (
    <Box>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          borderRadius: 12,
          border: "1px solid #f3f4f6",
          overflow: "hidden",
        }}
      >
        {fields.map((field, i) => (
          <Box
            key={field.id}
            style={{
              padding: "20px 24px",
              borderBottom: i < fields.length - 1 ? "1px solid #f3f4f6" : "none",
              backgroundColor: "#fff",
            }}
          >
            <Box mb={8}>
              <Group gap={6} align="center">
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {field.label}
                </Text>
                {field.required && (
                  <Text style={{ fontSize: 12, color: areaColor, fontWeight: 500 }}>
                    *
                  </Text>
                )}
              </Group>
              {field.hint && (
                <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {field.hint}
                </Text>
              )}
            </Box>

            {field.type === "textarea" ? (
              <textarea
                value={values[field.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                placeholder={field.placeholder ?? ""}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "#fafafa",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = areaColor;
                  e.target.style.boxShadow = `0 0 0 3px ${areaColor}18`;
                  e.target.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                  e.target.style.backgroundColor = "#fafafa";
                }}
              />
            ) : (
              <input
                type="text"
                value={values[field.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                placeholder={field.placeholder ?? ""}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "#fafafa",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = areaColor;
                  e.target.style.boxShadow = `0 0 0 3px ${areaColor}18`;
                  e.target.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                  e.target.style.backgroundColor = "#fafafa";
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer: guardar */}
      <Group justify="space-between" align="center" mt={16}>
        <Box>
          {lastSaved && !hasChanges && (
            <Group gap={6} align="center">
              <IconCircleCheck size={14} color="#16a34a" />
              <Text style={{ fontSize: 12, color: "#6b7280" }}>
                Guardado{" "}
                {new Date(lastSaved).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Group>
          )}
        </Box>

        <button
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: hasChanges && !isPending ? areaColor : "#f3f4f6",
            color: hasChanges && !isPending ? "#fff" : "#9ca3af",
            fontSize: 13,
            fontWeight: 600,
            cursor: isPending ? "wait" : !hasChanges ? "default" : "pointer",
            transition: "background-color 0.15s",
          }}
        >
          {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          {isPending ? "Guardando…" : "Guardar"}
        </button>
      </Group>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}
