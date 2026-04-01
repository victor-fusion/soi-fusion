import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_MAP, PHASES } from "@/constants/areas";
import type { Entregable } from "@/types";
import Link from "next/link";
import { Box, Text, Title, Group, Badge, Paper } from "@mantine/core";
import {
  IconArrowLeft, IconTarget, IconBox, IconTrendingUp,
  IconCoin, IconScale, IconSettings, IconUsers, IconCalendar,
} from "@tabler/icons-react";
import { EntregableControls } from "./_components/EntregableControls";

const AREA_ICONS: Record<string, typeof IconTarget> = {
  estrategia:  IconTarget,
  producto:    IconBox,
  growth:      IconTrendingUp,
  finanzas:    IconCoin,
  legal:       IconScale,
  operaciones: IconSettings,
  equipo:      IconUsers,
};

export default async function EntregablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, startups(*)")
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");

  const startup = profile.startups as { id: string; name: string; current_phase: number } | null;

  const { data } = await supabase
    .from("entregables")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const entregable = data as Entregable;

  // Seguridad: solo puede ver sus propios entregables
  if (!startup || entregable.startup_id !== startup.id) notFound();

  const area = AREA_MAP[entregable.area];
  const section = area?.sections.find((s) => s.id === entregable.section);
  const phase = PHASES.find((p) => p.number === entregable.phase);
  const AreaIcon = AREA_ICONS[entregable.area] ?? IconBox;

  const deadline = entregable.deadline
    ? new Date(entregable.deadline).toLocaleDateString("es-ES", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <Box p={40} maw={1100} mx="auto">

      {/* Volver */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 28,
        }}
      >
        <IconArrowLeft size={14} />
        Panel del Ciclo
      </Link>

      {/* Header */}
      <Box mb={36}>
        <Group gap={10} mb={12} align="center">
          {area && <AreaIcon size={18} color={area.color} />}
          <Text style={{ fontSize: 13, color: "#6b7280" }}>
            {area?.name}
            {section && <> · {section.name}</>}
          </Text>
          {phase && (
            <Badge
              size="sm"
              variant="light"
              style={{ backgroundColor: `${phase.color}18`, color: phase.color }}
            >
              Fase {phase.number}
            </Badge>
          )}
        </Group>

        <Title order={1} style={{ fontSize: "1.75rem", color: "#111827", lineHeight: 1.3, marginBottom: 12 }}>
          {entregable.title}
        </Title>

        {entregable.description && (
          <Text style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 640 }}>
            {entregable.description}
          </Text>
        )}
      </Box>

      {/* Controles interactivos: estado + pasos */}
      <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6", marginBottom: 24 }}>
        <EntregableControls
          entregableId={entregable.id}
          currentStatus={entregable.status}
          steps={entregable.steps ?? []}
          completedSteps={entregable.completed_steps ?? []}
        />
      </Paper>

      {/* Deadline */}
      {deadline && (
        <Group gap={8} style={{ color: "#9ca3af" }}>
          <IconCalendar size={14} />
          <Text style={{ fontSize: 13 }}>Fecha límite: <strong style={{ color: "#374151" }}>{deadline}</strong></Text>
        </Group>
      )}

    </Box>
  );
}
