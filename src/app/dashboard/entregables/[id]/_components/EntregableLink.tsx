"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconLink, IconExternalLink, IconLoader2 } from "@tabler/icons-react";
import { updateEntregableLink } from "../actions";

interface EntregableLinkProps {
  entregableId: string;
  linkUrl?: string | null;
  locked: boolean;
}

/** Enlace al documento del entregable (Drive, Notion, Figma…). */
export function EntregableLink({ entregableId, linkUrl, locked }: EntregableLinkProps) {
  const [value, setValue] = useState(linkUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const dirty = value.trim() !== (linkUrl ?? "");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => updateEntregableLink(entregableId, value));
  };

  return (
    <Box>
      <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        Documento del entregable
      </Text>
      {locked ? (
        linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a" }}>
            <IconExternalLink size={14} />
            {linkUrl}
          </a>
        ) : (
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>Sin enlace.</Text>
        )
      ) : (
        <form onSubmit={save}>
          <Group gap={8} wrap="nowrap">
            <Box style={{ position: "relative", flex: 1 }}>
              <IconLink size={14} color="#9ca3af" style={{ position: "absolute", left: 10, top: 11 }} />
              <input
                type="url"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://drive.google.com/…"
                style={{
                  width: "100%", padding: "9px 12px 9px 30px",
                  fontSize: 13, color: "#374151", backgroundColor: "#fafafa",
                  border: "1px solid #e5e7eb", borderRadius: 8, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </Box>
            {linkUrl && !dirty && (
              <a href={linkUrl} target="_blank" rel="noopener noreferrer" title="Abrir" style={{ color: "#16a34a", display: "flex" }}>
                <IconExternalLink size={16} />
              </a>
            )}
            {dirty && (
              <button
                type="submit"
                disabled={isPending}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  backgroundColor: "#111827", color: "#fff",
                  fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                }}
              >
                {isPending && <IconLoader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
                Guardar
              </button>
            )}
          </Group>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </form>
      )}
    </Box>
  );
}
