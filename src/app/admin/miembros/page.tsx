import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import {
  Box, Text, Title, Group, Stack, Badge, Paper, Avatar,
} from "@mantine/core";
import { IconArrowRight, IconMail, IconBrandLinkedin, IconPhone } from "@tabler/icons-react";
import { BatchFilter } from "../_components/BatchFilter";
import { StartupFilter, TypeFilter } from "./_components/MiembrosFilters";

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

export default async function MiembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; startup?: string; type?: string }>;
}) {
  const { batch: batchParam, startup: startupParam, type: typeParam } = await searchParams;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Ciclos disponibles
  const { data: batchRows } = await supabase
    .from("startups")
    .select("batch")
    .order("batch");
  const availableBatches = [
    ...new Set((batchRows ?? []).map((r: { batch: number }) => r.batch)),
  ].sort() as number[];
  const latestBatch = availableBatches.at(-1) ?? 5;
  const selectedBatch = batchParam !== undefined ? parseInt(batchParam, 10) : 0;
  const showAllBatches = selectedBatch === 0;

  // Startups disponibles (para filtro dropdown)
  let startupsQuery = supabase.from("startups").select("id, name, batch").order("name");
  if (!showAllBatches) startupsQuery = startupsQuery.eq("batch", selectedBatch);
  const { data: startupRows } = await startupsQuery;
  const allStartups = (startupRows ?? []) as { id: string; name: string; batch: number }[];

  // IDs de startups del ciclo seleccionado (para filtro por batch)
  const batchStartupIds = allStartups.map((s) => s.id);

  // Miembros (ahora en profiles)
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
    startups: { id: string; name: string; batch: number } | { id: string; name: string; batch: number }[] | null;
  };

  let query = supabase
    .from("profiles")
    .select("id, startup_id, full_name, email, role, role_title, member_type, dedication, phone, linkedin_url, startups(id, name, batch)")
    .order("full_name");

  // Filtro por startup específica
  if (startupParam) {
    query = query.eq("startup_id", startupParam);
  } else if (!showAllBatches && batchStartupIds.length > 0) {
    // Filtro por ciclo: mostrar perfiles de startups de ese ciclo
    query = query.in("startup_id", batchStartupIds);
  }

  // Filtro por tipo de miembro
  if (typeParam) query = query.eq("member_type", typeParam);

  const { data } = await query;
  const membersData = (data ?? []) as unknown as MemberRow[];

  const selectedStartupName = startupParam
    ? allStartups.find((s) => s.id === startupParam)?.name
    : null;

  return (
    <Box p={40} maw={1100} mx="auto">

      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Group justify="space-between" align="center" mt={4}>
          <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>
            Miembros
          </Title>
          <Group gap={10}>
            <Suspense fallback={null}>
              <BatchFilter
                batches={availableBatches}
                activeBatch={selectedBatch}
                basePath="/admin/miembros"
              />
            </Suspense>
            <StartupFilter
              startups={allStartups}
              activeStartup={startupParam ?? ""}
              activeBatch={selectedBatch}
              activeType={typeParam ?? ""}
            />
            <TypeFilter
              activeType={typeParam ?? ""}
              activeBatch={selectedBatch}
              activeStartup={startupParam ?? ""}
            />
          </Group>
        </Group>

        {/* Tags de filtros activos */}
        {(selectedStartupName || typeParam) && (
          <Group gap={8} mt={12}>
            {selectedStartupName && (
              <Box style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: "#eff6ff", borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: "#2563eb" }}>Startup: {selectedStartupName}</Text>
                <Link
                  href={`/admin/miembros?batch=${batchParam ?? latestBatch}${typeParam ? `&type=${typeParam}` : ""}`}
                  style={{ color: "#93c5fd", fontSize: 14, textDecoration: "none", lineHeight: 1 }}
                >×</Link>
              </Box>
            )}
            {typeParam && (
              <Box style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: "#f0fdf4", borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: "#16a34a" }}>Tipo: {TYPE_LABELS[typeParam] ?? typeParam}</Text>
                <Link
                  href={`/admin/miembros?batch=${batchParam ?? latestBatch}${startupParam ? `&startup=${startupParam}` : ""}`}
                  style={{ color: "#86efac", fontSize: 14, textDecoration: "none", lineHeight: 1 }}
                >×</Link>
              </Box>
            )}
          </Group>
        )}
      </Box>

      <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
        {/* Cabecera */}
        <Box
          px={24} py={14}
          style={{
            borderBottom: "1px solid #f3f4f6",
            display: "grid",
            gridTemplateColumns: "1fr 140px 110px 110px 80px",
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

        {membersData.length === 0 ? (
          <Box py={48} style={{ textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No hay miembros con los filtros seleccionados</Text>
          </Box>
        ) : (
          <Stack gap={0}>
            {membersData.map((member, i) => {
              const startup = Array.isArray(member.startups) ? member.startups[0] ?? null : member.startups;
              const isLast = i === membersData.length - 1;
              const typeColor = member.member_type ? (TYPE_COLORS[member.member_type] ?? "#9ca3af") : "#9ca3af";
              const initials = member.full_name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <Box
                  key={member.id}
                  px={24} py={14}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 110px 110px 80px",
                    gap: 16, alignItems: "center",
                    borderBottom: isLast ? "none" : "1px solid #f9fafb",
                  }}
                >
                  {/* Nombre */}
                  <Group gap={10}>
                    <Avatar
                      size={32} radius="xl"
                      style={{ backgroundColor: `${typeColor}18`, color: typeColor, fontSize: 12, fontWeight: 700, flexShrink: 0 }}
                    >
                      {initials}
                    </Avatar>
                    <Box style={{ minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }} truncate>
                        {member.full_name}
                      </Text>
                      {member.role_title && (
                        <Text style={{ fontSize: 12, color: "#9ca3af" }} truncate>
                          {member.role_title}
                        </Text>
                      )}
                    </Box>
                  </Group>

                  {/* Startup */}
                  {startup ? (
                    <Box style={{ minWidth: 0 }}>
                      <Link
                        href={`/admin/startups/${startup.id}`}
                        style={{ fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 500 }}
                      >
                        {startup.name}
                      </Link>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>Ciclo {startup.batch}</Text>
                    </Box>
                  ) : (
                    <Text style={{ fontSize: 12, color: "#d1d5db" }}>—</Text>
                  )}

                  {/* Tipo */}
                  {member.member_type ? (
                    <Badge
                      size="sm" variant="light"
                      styles={{ root: { backgroundColor: `${typeColor}15`, color: typeColor } }}
                    >
                      {TYPE_LABELS[member.member_type] ?? member.member_type}
                    </Badge>
                  ) : (
                    <Badge size="sm" variant="light" color="gray">
                      {member.role === "admin" ? "Admin Fusión" : "Sin asignar"}
                    </Badge>
                  )}

                  {/* Dedicación */}
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {member.dedication ? (DEDICATION_LABELS[member.dedication] ?? member.dedication) : "—"}
                  </Text>

                  {/* Contacto */}
                  <Group gap={8}>
                    {member.email && (
                      <a href={`mailto:${member.email}`} title={member.email} style={{ color: "#9ca3af", display: "flex" }}>
                        <IconMail size={14} />
                      </a>
                    )}
                    {member.linkedin_url && (
                      <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: "#9ca3af", display: "flex" }}>
                        <IconBrandLinkedin size={14} />
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`} title={member.phone} style={{ color: "#9ca3af", display: "flex" }}>
                        <IconPhone size={14} />
                      </a>
                    )}
                    {startup && (
                      <Link href={`/admin/startups/${startup.id}`} style={{ color: "#d1d5db", display: "flex" }}>
                        <IconArrowRight size={14} />
                      </Link>
                    )}
                  </Group>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Text style={{ fontSize: 12, color: "#d1d5db", marginTop: 16, textAlign: "right" }}>
        {membersData.length} miembro{membersData.length !== 1 ? "s" : ""}
      </Text>
    </Box>
  );
}
