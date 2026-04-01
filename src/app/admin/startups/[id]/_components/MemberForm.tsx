"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, SimpleGrid } from "@mantine/core";
import { IconX, IconLoader2 } from "@tabler/icons-react";
import type { Profile, OfficeSchedule } from "@/types";
import { ScheduleEditor } from "./ScheduleEditor";
import { inviteMember, updateMember, removeMemberFromStartup } from "../member-actions";

const MEMBER_TYPES = [
  { value: "cofundador",   label: "Cofundador" },
  { value: "empleado",     label: "Empleado" },
  { value: "advisor",      label: "Advisor" },
  { value: "becario",      label: "Becario" },
  { value: "contratista",  label: "Contratista" },
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

export function MemberForm({ startupId, member, onClose }: MemberFormProps) {
  const isEdit = !!member;
  const [isPending, startTransition] = useTransition();
  const [schedule, setSchedule] = useState<OfficeSchedule>(member?.office_schedule ?? {});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("office_schedule", JSON.stringify(schedule));
    startTransition(async () => {
      if (isEdit) {
        await updateMember(fd);
      } else {
        await inviteMember(fd);
      }
      onClose();
    });
  };

  const handleRemove = () => {
    if (!member) return;
    if (!confirm(`¿Desvincular a ${member.full_name} de esta startup? El usuario conservará su cuenta SOI.`)) return;
    startTransition(async () => {
      await removeMemberFromStartup(member.id, startupId);
      onClose();
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    fontSize: 14, color: "#374151",
    backgroundColor: "#fafafa",
    border: "1px solid #e5e7eb",
    borderRadius: 8, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600,
    color: "#6b7280", marginBottom: 6, display: "block",
  };

  return (
    <Box
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Box
        style={{
          backgroundColor: "#fff", borderRadius: 16,
          width: "100%", maxWidth: 600,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header modal */}
        <Box
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Box>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              {isEdit ? "Editar miembro" : "Invitar miembro"}
            </Text>
            {!isEdit && (
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Se enviará un email de invitación para completar el registro
              </Text>
            )}
          </Box>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#9ca3af", padding: 4, display: "flex",
            }}
          >
            <IconX size={18} />
          </button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box style={{ padding: "24px" }}>

            <input type="hidden" name="startup_id" value={startupId} />
            {isEdit && <input type="hidden" name="member_id" value={member.id} />}

            {/* Email (solo en modo invitación) */}
            {!isEdit && (
              <Box mb={16}>
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

            {/* Nombre + Rol */}
            <SimpleGrid cols={2} spacing={16} mb={16}>
              <Box>
                <label style={labelStyle}>Nombre completo *</label>
                <input
                  name="full_name"
                  required
                  defaultValue={member?.full_name ?? ""}
                  placeholder="Ej: María García"
                  style={inputStyle}
                />
              </Box>
              <Box>
                <label style={labelStyle}>Rol en la startup</label>
                <input
                  name="role_title"
                  defaultValue={member?.role_title ?? ""}
                  placeholder="Ej: CTO, Head of Sales"
                  style={inputStyle}
                />
              </Box>
            </SimpleGrid>

            {/* Tipo + Dedicación */}
            <SimpleGrid cols={2} spacing={16} mb={16}>
              <Box>
                <label style={labelStyle}>Tipo</label>
                <select
                  name="member_type"
                  defaultValue={member?.member_type ?? "cofundador"}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {MEMBER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Box>
              <Box>
                <label style={labelStyle}>Dedicación</label>
                <select
                  name="dedication"
                  defaultValue={member?.dedication ?? "full-time"}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {DEDICATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </Box>
            </SimpleGrid>

            {/* Fecha incorporación */}
            <Box mb={16}>
              <label style={labelStyle}>Fecha de incorporación</label>
              <input
                type="date"
                name="joined_at"
                defaultValue={member?.joined_at ?? ""}
                style={{ ...inputStyle, width: "auto" }}
              />
            </Box>

            {/* Horario en oficina */}
            <Box mb={20}>
              <label style={labelStyle}>Horario habitual en oficinas Fusión</label>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
                Activa los días y ajusta las franjas horarias. Máximo 3 franjas por día.
              </Text>
              <ScheduleEditor value={schedule} onChange={setSchedule} />
            </Box>

            {/* Separador */}
            <Box style={{ borderTop: "1px solid #f3f4f6", marginBottom: 16 }} />
            <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
              Datos de contacto
            </Text>

            {/* Email (edit mode) + Teléfono */}
            <SimpleGrid cols={2} spacing={16} mb={16}>
              {isEdit && (
                <Box>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={member?.phone ?? ""}
                    placeholder="+34 600 000 000"
                    style={inputStyle}
                  />
                </Box>
              )}
              {!isEdit && (
                <Box>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+34 600 000 000"
                    style={inputStyle}
                  />
                </Box>
              )}
              <Box>
                <label style={labelStyle}>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin_url"
                  defaultValue={member?.linkedin_url ?? ""}
                  placeholder="https://linkedin.com/in/..."
                  style={inputStyle}
                />
              </Box>
            </SimpleGrid>

            <Box mb={24}>
              <label style={labelStyle}>Enlace de calendario</label>
              <input
                type="url"
                name="calendar_url"
                defaultValue={member?.calendar_url ?? ""}
                placeholder="https://cal.com/..."
                style={{ ...inputStyle, maxWidth: 280 }}
              />
            </Box>

            {/* Footer botones */}
            <Group justify={isEdit ? "space-between" : "flex-end"} align="center">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isPending}
                  style={{
                    background: "none", border: "none",
                    cursor: isPending ? "wait" : "pointer",
                    color: "#ef4444", fontSize: 13, fontWeight: 500,
                    padding: "8px 0",
                  }}
                >
                  Desvincular de startup
                </button>
              )}
              <Group gap={8}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "9px 18px", borderRadius: 8,
                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                    color: "#6b7280", fontSize: 13, fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 20px", borderRadius: 8,
                    border: "none", backgroundColor: "#111827",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: isPending ? "wait" : "pointer",
                  }}
                >
                  {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  {isEdit ? "Guardar cambios" : "Enviar invitación"}
                </button>
              </Group>
            </Group>
          </Box>
        </form>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}
