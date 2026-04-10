"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, SimpleGrid } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import type { Profile, OfficeSchedule } from "@/types";
import { ScheduleEditor } from "./ScheduleEditor";
import { inviteMember, updateMember, removeMemberFromStartup } from "../member-actions";

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

interface MemberFormProps {
  startupId: string;
  member?: Profile;
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

export function MemberForm({ startupId, member, onClose }: MemberFormProps) {
  const isEdit = !!member;
  const [mode, setMode] = useState<"invitar" | "crear">("invitar");
  const [isPending, startTransition] = useTransition();
  const [schedule, setSchedule] = useState<OfficeSchedule>(member?.office_schedule ?? {});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("office_schedule", JSON.stringify(schedule));
    startTransition(async () => {
      if (isEdit) await updateMember(fd);
      else await inviteMember(fd);
      onClose();
    });
  };

  const handleRemove = () => {
    if (!member) return;
    const name = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;
    if (!confirm(`¿Desvincular a ${name} de esta startup?`)) return;
    startTransition(async () => {
      await removeMemberFromStartup(member.id, startupId);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <input type="hidden" name="startup_id" value={startupId} />
        {isEdit && <input type="hidden" name="member_id" value={member.id} />}

        {/* Selector modo (solo en creación) */}
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
                ? "Se enviará un email de invitación para completar el registro."
                : "Se crea el perfil directamente sin enviar ningún email."}
            </Text>
          </Box>
        )}

        {/* Email */}
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
            <label style={labelStyle}>Nombre *</label>
            <input
              name="first_name"
              required
              defaultValue={member?.first_name ?? ""}
              placeholder="María"
              style={inputStyle}
            />
          </Box>
          <Box>
            <label style={labelStyle}>Rol en la startup</label>
            <input
              name="role_title"
              defaultValue={member?.role_title ?? ""}
              placeholder="CTO, Head of Sales…"
              style={inputStyle}
            />
          </Box>
        </SimpleGrid>

        {/* Tipo + Dedicación */}
        <SimpleGrid cols={2} spacing={16}>
          <Box>
            <label style={labelStyle}>Tipo</label>
            <select name="member_type" defaultValue={member?.member_type ?? "cofundador"} style={{ ...inputStyle, cursor: "pointer" }}>
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

        {/* Fecha de incorporación */}
        <Box>
          <label style={labelStyle}>Fecha de incorporación</label>
          <input type="date" name="joined_at" defaultValue={member?.joined_at ?? ""} style={{ ...inputStyle, width: "auto" }} />
        </Box>

        {/* Horario */}
        <Box>
          <label style={labelStyle}>Horario habitual en oficinas Fusión</label>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
            Activa los días y ajusta las franjas horarias. Máximo 3 franjas por día.
          </Text>
          <ScheduleEditor value={schedule} onChange={setSchedule} />
        </Box>

        {/* Contacto */}
        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Datos de contacto
          </Text>
          <SimpleGrid cols={2} spacing={16} mb={16}>
            <Box>
              <label style={labelStyle}>Teléfono</label>
              <input type="tel" name="phone" defaultValue={member?.phone ?? ""} placeholder="+34 600 000 000" style={inputStyle} />
            </Box>
            <Box>
              <label style={labelStyle}>LinkedIn</label>
              <input type="url" name="linkedin_url" defaultValue={member?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." style={inputStyle} />
            </Box>
          </SimpleGrid>
          <Box>
            <label style={labelStyle}>Enlace de calendario</label>
            <input type="url" name="calendar_url" defaultValue={member?.calendar_url ?? ""} placeholder="https://cal.com/..." style={{ ...inputStyle, maxWidth: 280 }} />
          </Box>
        </Box>

        {/* Footer */}
        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
          <Group justify={isEdit ? "space-between" : "flex-end"} align="center">
            {isEdit && (
              <button type="button" onClick={handleRemove} disabled={isPending} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 500 }}>
                Desvincular de startup
              </button>
            )}
            <Group gap={8}>
              <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Cancelar
              </button>
              <button type="submit" disabled={isPending} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}>
                {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                {isEdit ? "Guardar cambios" : mode === "invitar" ? "Enviar invitación" : "Crear miembro"}
              </button>
            </Group>
          </Group>
        </Box>

      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
