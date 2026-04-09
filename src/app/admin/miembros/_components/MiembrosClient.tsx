"use client";

import Link from "next/link";
import { Box, Text, Title, Group, Stack, Badge, Paper, Avatar } from "@mantine/core";
import { IconPencil, IconBrandLinkedin, IconPhone } from "@tabler/icons-react";
import { BatchFilter } from "../../_components/BatchFilter";
import { StartupFilter, TypeFilter } from "./MiembrosFilters";
import { NewMemberButton } from "./NewMemberButton";
import { Pagination } from "@/components/ui/Pagination";
import { Suspense } from "react";

const TYPE_LABELS: Record<string, string> = {
  cofundador:  "Cofundador",
  empleado:    "Empleado",
  advisor:     "Advisor",
  becario:     "Becario",
  contratista: "Contratista",
};

const TYPE_COLORS: Record<string, string> = {
  cofundador:  "#2563eb",
  empleado:    "#16a34a",
  advisor:     "#7c3aed",
  becario:     "#ea580c",
  contratista: "#d97706",
};

const DEDICATION_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "puntual":   "Puntual",
};

type MemberRow = {
  id: string;
  startup_id: string | null;
  full_name: string;
  email: string;
  role: string;
  role_title?: string;
  member_type: string | null;
  dedication: string | null;
  phone?: string;
  linkedin_url?: string;
  avatar_url?: string;
  startups: { id: string; name: string; batch: number } | { id: string; name: string; batch: number }[] | null;
};

interface MiembrosClientProps {
  members: MemberRow[];
  allStartups: { id: string; name: string; batch: number }[];
  availableBatches: number[];
  selectedBatch: number;
  startupParam: string;
  typeParam: string;
  total: number;
  page: number;
}

export function MiembrosClient({
  members,
  allStartups,
  availableBatches,
  selectedBatch,
  startupParam,
  typeParam,
  total,
  page,
}: MiembrosClientProps) {
  return (
    <Box p={40} maw={1100} mx="auto">
      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Group justify="space-between" align="center" mt={4}>
          <Box>
            <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>Miembros</Title>
            <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {total} miembro{total !== 1 ? "s" : ""}
            </Text>
          </Box>
          <NewMemberButton startups={allStartups} />
        </Group>
      </Box>

      <Group gap={10} mb={24}>
        <Suspense fallback={null}>
          <BatchFilter batches={availableBatches} activeBatch={selectedBatch} basePath="/admin/miembros" />
        </Suspense>
        <StartupFilter startups={allStartups} activeStartup={startupParam} activeBatch={selectedBatch} activeType={typeParam} />
        <TypeFilter activeType={typeParam} activeBatch={selectedBatch} activeStartup={startupParam} />
        {(selectedBatch !== 0 || startupParam || typeParam) && (
          <Link href="/admin/miembros" style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}>
            Limpiar filtros
          </Link>
        )}
        <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>{total} resultados</Text>
      </Group>

      <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
        <Box
          px={24} py={14}
          style={{
            borderBottom: "1px solid #f3f4f6",
            display: "grid",
            gridTemplateColumns: "1fr 140px 110px 110px 60px",
            gap: 16, alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          {["Miembro", "Startup", "Tipo", "Dedicación", "Contacto"].map((h) => (
            <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </Text>
          ))}
        </Box>

        {members.length === 0 ? (
          <Box py={48} style={{ textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No hay miembros con los filtros seleccionados</Text>
          </Box>
        ) : (
          <Stack gap={0}>
            {members.map((member, i) => {
              const startup = Array.isArray(member.startups) ? member.startups[0] ?? null : member.startups;
              const isLast = i === members.length - 1;
              const typeColor = member.member_type ? (TYPE_COLORS[member.member_type] ?? "#9ca3af") : "#9ca3af";
              const initials = member.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

              return (
                <Link
                  key={member.id}
                  href={`/admin/miembros/${member.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 110px 110px 60px",
                    gap: 16, alignItems: "center", padding: "14px 24px",
                    borderBottom: isLast ? "none" : "1px solid #f9fafb",
                    textDecoration: "none", color: "inherit", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <Group gap={10}>
                    <Avatar
                      src={member.avatar_url ?? null}
                      size={32} radius="xl"
                      style={{ backgroundColor: `${typeColor}18`, color: typeColor, fontSize: 12, fontWeight: 700, flexShrink: 0 }}
                    >
                      {initials}
                    </Avatar>
                    <Box style={{ minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }} truncate>{member.full_name}</Text>
                      {member.role_title && <Text style={{ fontSize: 12, color: "#9ca3af" }} truncate>{member.role_title}</Text>}
                    </Box>
                  </Group>

                  {startup ? (
                    <Box style={{ minWidth: 0 }}>
                      <Link href={`/admin/startups/${startup.id}`} style={{ fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 500 }} onClick={(e) => e.stopPropagation()}>
                        {startup.name}
                      </Link>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>Ciclo {startup.batch}</Text>
                    </Box>
                  ) : (
                    <Text style={{ fontSize: 12, color: "#d1d5db" }}>—</Text>
                  )}

                  {member.member_type ? (
                    <Badge size="sm" variant="light" styles={{ root: { backgroundColor: `${typeColor}15`, color: typeColor } }}>
                      {TYPE_LABELS[member.member_type] ?? member.member_type}
                    </Badge>
                  ) : (
                    <Badge size="sm" variant="light" color="gray">
                      {member.role === "admin" ? "Admin Fusión" : "Sin asignar"}
                    </Badge>
                  )}

                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {member.dedication ? (DEDICATION_LABELS[member.dedication] ?? member.dedication) : "—"}
                  </Text>

                  <Group gap={8}>
                    {member.linkedin_url && (
                      <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "#9ca3af", display: "flex" }}>
                        <IconBrandLinkedin size={14} />
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`} onClick={(e) => e.stopPropagation()} style={{ color: "#9ca3af", display: "flex" }}>
                        <IconPhone size={14} />
                      </a>
                    )}
                    <Box style={{ color: "#d1d5db", display: "flex" }}>
                      <IconPencil size={14} />
                    </Box>
                  </Group>
                </Link>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Pagination total={total} page={page} perPage={15} />
    </Box>
  );
}
