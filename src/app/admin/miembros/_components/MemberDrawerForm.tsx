"use client";

import { useState, useTransition } from "react";
import { Box, Text, SimpleGrid } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import type { Profile, OfficeSchedule } from "@/types";
import { inviteMiembro, updateMiembro } from "../actions";

interface Startup {
  id: string;
  name: string;
  batch: number;
}

interface MemberDrawerFormProps {
  member?: Profile;
  startups: Startup[];
  defaultStartupId?: string;
  onClose: () => void;
}

const MEMBER_TYPES = [
  { value: "cofundador",  label: "Cofundador" },
  { value: "empleado",    label: "Empleado" },
  { value: "advisor",     label: "Advisor" },
  { value: "becario",     label: "Becario" },
  { value: "contratista", label: "Contratista" },
];

const DEDICATIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "puntual",   label: "Puntual" },
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

export function MemberDrawerForm({ member, startups, defaultStartupId, onClose }: MemberDrawerFormProps) {
  const isEdit = !!member;
  const [mode, setMode] = useState<"invitar" | "crear">("invitar");
  const [isPending, startTransition] = useTransition();
  const [schedule] = useState<OfficeSchedule>(member?.office_schedule ?? {});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("office_schedule", JSON.stringify(schedule));
    startTransition(async () => {
      if (isEdit) await updateMiembro(fd);
      else await inviteMiembro(fd);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {isEdit && <input type="hidden" name="member_id" value={member.id} />}

        {/* Selector de modo (solo en creación) */}
        {!isEdit && (
          <Box>
            <Box style={{ display: "flex", gap: 0, borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              {(["invitar", "crear"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "9px 0",
                    fontSize: 13, fontWeight: 600,
                    border: "none", cursor: "pointer",
                    backgroundColor: mode === m ? "#111827" : "#fff",
                    color: mode === m ? "#fff" : "#6b7280",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "invitar" ? "Invitar por email" : "Crear manualmente"}
                </button>
              ))}
            </Box>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
              {mode === "invitar"
                ? "Se enviará un email de invitación para que el miembro complete su registro."
                : "Se crea el perfil directamente sin que el miembro reciba ningún email."}
            </Text>
          </Box>
        )}

        {/* Email — siempre visible en invitar, en edición no */}
        {!isEdit && (
          <Box>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="nombre@ejemplo.com"
              style={inputStyle}
            />
          </Box>
        )}

        {/* Nombre + Cargo */}
        <SimpleGrid cols={2} spacing={16}>
          <Box>
            <label style={labelStyle}>Nombre completo {!isEdit && mode === "crear" ? "*" : ""}</label>
            <input
              name="full_name"
              required={!isEdit && mode === "crear"}
              defaultValue={member?.full_name ?? ""}
              placeholder="María García"
              style={inputStyle}
            />
          </Box>
          <Box>
            <label style={labelStyle}>Cargo</label>
            <input
              name="role_title"
              defaultValue={member?.role_title ?? ""}
              placeholder="CTO, Head of Sales…"
              style={inputStyle}
            />
          </Box>
        </SimpleGrid>

        {/* Startup */}
        <Box>
          <label style={labelStyle}>Startup</label>
          <select
            name="startup_id"
            defaultValue={member?.startup_id ?? defaultStartupId ?? ""}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Sin startup asignada</option>
            {startups.map((s) => (
              <option key={s.id} value={s.id}>{s.name} (Ciclo {s.batch})</option>
            ))}
          </select>
        </Box>

        {/* Tipo + Dedicación */}
        <SimpleGrid cols={2} spacing={16}>
          <Box>
            <label style={labelStyle}>Tipo</label>
            <select name="member_type" defaultValue={member?.member_type ?? "cofundador"} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Sin tipo</option>
              {MEMBER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Box>
          <Box>
            <label style={labelStyle}>Dedicación</label>
            <select name="dedication" defaultValue={member?.dedication ?? "full-time"} style={{ ...inputStyle, cursor: "pointer" }}>
              {DEDICATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Box>
        </SimpleGrid>

        {/* Contacto */}
        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            Contacto
          </Text>
          <SimpleGrid cols={2} spacing={16}>
            <Box>
              <label style={labelStyle}>Teléfono</label>
              <input type="tel" name="phone" defaultValue={member?.phone ?? ""} placeholder="+34 600 000 000" style={inputStyle} />
            </Box>
            <Box>
              <label style={labelStyle}>LinkedIn</label>
              <input type="url" name="linkedin_url" defaultValue={member?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." style={inputStyle} />
            </Box>
          </SimpleGrid>
        </Box>

        {/* Botones */}
        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" disabled={isPending} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}>
            {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {isEdit ? "Guardar cambios" : mode === "invitar" ? "Enviar invitación" : "Crear miembro"}
          </button>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
