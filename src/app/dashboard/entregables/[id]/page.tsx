import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/session";
import { getAreaMap } from "@/lib/data/areas";
import { getPhases } from "@/lib/data/phases";
import type { Entregable, EntregableComment } from "@/types";
import Link from "next/link";
import { Box, Text, Title, Group, Badge, Paper } from "@mantine/core";
import {
  IconArrowLeft, IconTarget, IconBox, IconTrendingUp,
  IconCoin, IconScale, IconSettings, IconUsers, IconCalendar,
} from "@tabler/icons-react";
import { EntregableControls } from "./_components/EntregableControls";
import { EntregableLink } from "./_components/EntregableLink";
import { CommentsSection } from "./_components/CommentsSection";

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

  const commentsQuery = () => supabase
    .from("entregable_comments")
    .select("*, author:profiles(full_name, avatar_url, role)")
    .eq("entregable_id", id)
    .order("created_at", { ascending: true });

  const [profile, { data }, { data: commentsRaw }, { data: repliesRaw }, AREA_MAP, PHASES] = await Promise.all([
    getCurrentProfile(),
    supabase.from("entregables").select("*").eq("id", id).single(),
    commentsQuery().is("parent_id", null),           // comentarios raíz
    commentsQuery().not("parent_id", "is", null),    // replies
    getAreaMap(),
    getPhases(),
  ]);

  if (!profile) redirect("/login");
  const startup = profile.startups as { id: string; name: string; current_phase: number } | null;

  if (!data) notFound();
  const entregable = data as Entregable;

  // Seguridad: solo puede ver sus propios entregables
  if (!startup || entregable.startup_id !== startup.id) notFound();

  const topComments = (commentsRaw ?? []) as EntregableComment[];
  const allReplies = (repliesRaw ?? []) as EntregableComment[];

  // Anida replies en sus comentarios padre
  const comments: EntregableComment[] = topComments.map((c) => ({
    ...c,
    replies: allReplies.filter((r) => r.parent_id === c.id),
  }));

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

      {/* Controles interactivos: estado */}
      <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6", marginBottom: 24 }}>
        <EntregableControls
          entregableId={entregable.id}
          currentStatus={entregable.status}
          reviewerNotes={entregable.reviewer_notes}
        />
        <Box mt={20} pt={20} style={{ borderTop: "1px solid #f3f4f6" }}>
          <EntregableLink
            entregableId={entregable.id}
            linkUrl={entregable.link_url}
            locked={entregable.status === "completado"}
          />
        </Box>
      </Paper>

      {/* Deadline */}
      {deadline && (
        <Group gap={8} style={{ color: "#9ca3af", marginBottom: 32 }}>
          <IconCalendar size={14} />
          <Text style={{ fontSize: 13 }}>Fecha límite: <strong style={{ color: "#374151" }}>{deadline}</strong></Text>
        </Group>
      )}

      {/* Conversación */}
      <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
        <CommentsSection
          entregableId={id}
          comments={comments}
          currentUserId={profile.id}
        />
      </Paper>

    </Box>
  );
}
