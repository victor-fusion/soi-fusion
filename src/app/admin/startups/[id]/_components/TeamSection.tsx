"use client";

import { useState } from "react";
import { Box, Text, Group, Avatar, Badge } from "@mantine/core";
import {
  IconPlus, IconPencil, IconBrandLinkedin,
  IconCalendar, IconPhone, IconMail,
} from "@tabler/icons-react";
import type { Profile, OfficeSchedule } from "@/types";
import { MemberForm } from "./MemberForm";
import { SlideDrawer } from "@/components/ui/SlideDrawer";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  cofundador:  { label: "Cofundador",  color: "#2563eb" },
  empleado:    { label: "Empleado",    color: "#16a34a" },
  advisor:     { label: "Advisor",     color: "#7c3aed" },
  becario:     { label: "Becario",     color: "#d97706" },
  contratista: { label: "Contratista", color: "#6b7280" },
};

const DEDICATION_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "puntual":   "Puntual",
};

const DAY_LABELS: Record<keyof OfficeSchedule, string> = {
  monday: "L", tuesday: "M", wednesday: "X",
  thursday: "J", friday: "V", saturday: "S", sunday: "D",
};

const DAY_ORDER: (keyof OfficeSchedule)[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

function ScheduleSummary({ schedule }: { schedule: OfficeSchedule }) {
  const activeDays = DAY_ORDER.filter((d) => schedule[d] && schedule[d]!.length > 0);
  if (activeDays.length === 0) return null;

  return (
    <Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {activeDays.map((day) => {
        const ranges = schedule[day]!;
        return (
          <Box
            key={day}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 8px", borderRadius: 6,
              backgroundColor: "#f3f4f6",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
              {DAY_LABELS[day]}
            </Text>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}>
              {ranges.map((r) => `${r.start}–${r.end}`).join(", ")}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

interface TeamSectionProps {
  startupId: string;
  members: Profile[];
}

export function TeamSection({ startupId, members }: TeamSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (m: Profile) => { setEditing(m); setShowForm(true); };
  const close = () => { setShowForm(false); setEditing(null); };

  return (
    <>
      <Box>
        <Group justify="space-between" mb={16} align="center">
          <Group gap={8}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Equipo
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {members.length} {members.length === 1 ? "miembro" : "miembros"}
            </Text>
          </Group>
          <button
            type="button"
            onClick={openAdd}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid #e5e7eb", backgroundColor: "#fff",
              color: "#374151", fontSize: 13, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <IconPlus size={14} />
            Añadir miembro
          </button>
        </Group>

        {members.length === 0 ? (
          <Box
            p={32}
            style={{
              borderRadius: 12, border: "1px dashed #e5e7eb",
              backgroundColor: "#fafafa", textAlign: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "#9ca3af" }}>
              Aún no hay miembros en el equipo.
            </Text>
          </Box>
        ) : (
          <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {members.map((member) => {
              const typeCfg = TYPE_CONFIG[member.member_type ?? "empleado"] ?? TYPE_CONFIG.empleado;
              const initials = [member.first_name, member.last_name].filter(Boolean).map((w) => w![0]).join("").toUpperCase() || "?";

              return (
                <Box
                  key={member.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 18px", borderRadius: 12,
                    border: "1px solid #f3f4f6", backgroundColor: "#fff",
                  }}
                >
                  <Avatar
                    src={member.avatar_url ?? undefined}
                    radius="xl"
                    size={42}
                    style={{
                      backgroundColor: `${typeCfg.color}15`,
                      color: typeCfg.color,
                      fontSize: 14, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {initials}
                  </Avatar>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap={8} mb={4} align="center">
                      <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {[member.first_name, member.last_name].filter(Boolean).join(" ") || member.email}
                      </Text>
                      {member.role_title && (
                        <Text style={{ fontSize: 13, color: "#6b7280" }}>
                          · {member.role_title}
                        </Text>
                      )}
                    </Group>

                    <Group gap={6} mb={4}>
                      <Badge
                        size="xs"
                        variant="light"
                        style={{ backgroundColor: `${typeCfg.color}12`, color: typeCfg.color }}
                      >
                        {typeCfg.label}
                      </Badge>
                      <Badge size="xs" color="gray" variant="light">
                        {member.dedication ? (DEDICATION_LABELS[member.dedication] ?? member.dedication) : "—"}
                      </Badge>
                      {member.joined_at && (
                        <Text style={{ fontSize: 11, color: "#d1d5db" }}>
                          desde {new Date(member.joined_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                        </Text>
                      )}
                    </Group>

                    {/* Contacto */}
                    <Group gap={12} mt={6}>
                      {member.email && (
                        <a href={`mailto:${member.email}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "#6b7280", textDecoration: "none" }}>
                          <IconMail size={12} />
                          <Text style={{ fontSize: 12 }}>{member.email}</Text>
                        </a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "#6b7280", textDecoration: "none" }}>
                          <IconPhone size={12} />
                          <Text style={{ fontSize: 12 }}>{member.phone}</Text>
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", textDecoration: "none" }}>
                          <IconBrandLinkedin size={12} />
                          <Text style={{ fontSize: 12 }}>LinkedIn</Text>
                        </a>
                      )}
                      {member.calendar_url && (
                        <a href={member.calendar_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "#7c3aed", textDecoration: "none" }}>
                          <IconCalendar size={12} />
                          <Text style={{ fontSize: 12 }}>Calendario</Text>
                        </a>
                      )}
                    </Group>

                    {/* Horario */}
                    {Object.keys(member.office_schedule).length > 0 && (
                      <ScheduleSummary schedule={member.office_schedule} />
                    )}
                  </Box>

                  <button
                    type="button"
                    onClick={() => openEdit(member)}
                    style={{
                      background: "none", border: "none",
                      cursor: "pointer", padding: 6, color: "#d1d5db",
                      display: "flex", alignItems: "center",
                      borderRadius: 6,
                    }}
                  >
                    <IconPencil size={14} />
                  </button>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <SlideDrawer
        open={showForm}
        onClose={close}
        title={editing ? "Editar miembro" : "Añadir miembro"}
        subtitle={editing ? ([editing.first_name, editing.last_name].filter(Boolean).join(" ") || editing.email) : "Invitar o crear un miembro del equipo"}
      >
        {showForm && (
          <MemberForm
            startupId={startupId}
            member={editing ?? undefined}
            onClose={close}
          />
        )}
      </SlideDrawer>
    </>
  );
}
