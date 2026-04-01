import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREAS, PHASES } from "@/constants/areas";
import type { Entregable, Profile } from "@/types";
import Link from "next/link";
import {
  Box, Text, Title, Group, Stack, Badge, Paper, Progress, Avatar,
} from "@mantine/core";
import {
  IconArrowLeft, IconCircleCheck, IconCircle, IconClock,
  IconChevronRight, IconCalendar, IconUsers,
} from "@tabler/icons-react";

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  if (diffDays < 0) return { label, color: "#ef4444", bg: "#fef2f2" };      // vencido
  if (diffDays <= 7) return { label, color: "#d97706", bg: "#fffbeb" };     // próximo
  return { label, color: "#9ca3af", bg: "#f9fafb" };                        // normal
}
import { changePhase } from "./actions";
import { getStartupRelatedCounts } from "./delete-action";
import { StatusSelect } from "./_components/StatusSelect";
import { AddEntregableForm } from "./_components/AddEntregableForm";
import { TeamSection } from "./_components/TeamSection";
import { StartupEditForm } from "./_components/StartupEditForm";
import { DeleteStartupModal } from "./_components/DeleteStartupModal";

const TYPE_LABELS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  b2c_app: "B2C App",
  marketplace: "Marketplace",
  producto_fisico: "Producto físico",
  servicios: "Servicios",
};

const STATUS_ICON: Record<string, { Icon: typeof IconCircleCheck; color: string }> = {
  completado:          { Icon: IconCircleCheck, color: "#16a34a" },
  en_revision:         { Icon: IconClock,       color: "#ca8a04" },
  cambios_solicitados: { Icon: IconClock,       color: "#e11d48" },
  en_progreso:         { Icon: IconClock,       color: "#2563eb" },
  pendiente:           { Icon: IconCircle,      color: "#d1d5db" },
};

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Startup
  const { data: startup } = await supabase
    .from("startups")
    .select("*")
    .eq("id", id)
    .single();

  if (!startup) notFound();

  // Entregables (fase actual)
  const { data: entregablesData } = await supabase
    .from("entregables")
    .select("*")
    .eq("startup_id", id)
    .eq("phase", startup.current_phase)
    .order("area");

  const entregables = (entregablesData ?? []) as Entregable[];

  // Miembros del equipo
  const { data: membersData } = await supabase
    .from("profiles")
    .select("*")
    .eq("startup_id", id)
    .order("display_order")
    .order("created_at");

  const members = (membersData ?? []) as Profile[];

  // Conteos para modal de eliminación
  const relatedCounts = await getStartupRelatedCounts(id);

  const currentPhase = PHASES.find((p) => p.number === startup.current_phase) ?? PHASES[0];
  const totalDone = entregables.filter((e) => e.status === "completado").length;
  const totalItems = entregables.length;
  const progressPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const byArea = AREAS.map((area) => ({
    area,
    items: entregables.filter((e) => e.area === area.id),
  })).filter((g) => g.items.length > 0);

  return (
    <Box p={40} maw={1100} mx="auto">

      {/* Back */}
      <Link
        href="/admin/startups"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#9ca3af", textDecoration: "none",
          marginBottom: 24,
        }}
      >
        <IconArrowLeft size={14} />
        Startups
      </Link>

      {/* Header */}
      <Box mb={32}>
        <Group justify="space-between" align="flex-start">
          <Group gap={16} align="flex-start">
            <Avatar
              src={startup.logo_url || undefined}
              radius="lg"
              size={56}
              style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", fontSize: 20, fontWeight: 700, flexShrink: 0 }}
            >
              {startup.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Group align="center" gap={10} mb={4}>
                <Title order={1} style={{ fontSize: "1.75rem", color: "#111827" }}>
                  {startup.name}
                </Title>
                <Badge size="sm" color="gray" variant="light">
                  {TYPE_LABELS[startup.type] ?? startup.type}
                </Badge>
                <Badge
                  size="sm"
                  variant="dot"
                  styles={{ root: { color: startup.status === "activa" ? "#16a34a" : "#d97706", borderColor: "transparent" } }}
                >
                  {startup.status === "activa" ? "Activa" : startup.status}
                </Badge>
              </Group>

              {startup.tagline && (
                <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                  {startup.tagline}
                </Text>
              )}

              <Group gap={20}>
                <Link
                  href={`/admin/miembros?startup=${id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 13, color: "#6b7280", textDecoration: "none",
                  }}
                >
                  <IconUsers size={13} />
                  Ver miembros
                </Link>
                {startup.sector && (
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    Sector: <strong style={{ color: "#374151" }}>{startup.sector}</strong>
                  </Text>
                )}
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  Ciclo <strong style={{ color: "#374151" }}>{startup.batch}</strong>
                </Text>
                {startup.cycle_start_date && (
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    Inicio: <strong style={{ color: "#374151" }}>
                      {new Date(startup.cycle_start_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </strong>
                  </Text>
                )}
              </Group>
            </Box>
          </Group>

          <Group gap={8}>
            <StartupEditForm startup={startup} />
            <DeleteStartupModal
              startupId={id}
              startupName={startup.name}
              counts={relatedCounts}
            />
          </Group>
        </Group>
      </Box>

      {/* Selector de fase */}
      <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6", marginBottom: 28 }}>
        <Text style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
          Fase actual
        </Text>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PHASES.map((phase) => {
            const isCurrent = phase.number === startup.current_phase;
            const isPast = phase.number < startup.current_phase;
            const changePhaseAction = changePhase.bind(null, id, phase.number);

            return (
              <form key={phase.number} action={changePhaseAction}>
                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: isCurrent ? `2px solid ${phase.color}` : "1px solid #f3f4f6",
                    backgroundColor: isCurrent ? phase.color : isPast ? "#f9fafb" : "#fff",
                    color: isCurrent ? "#fff" : isPast ? "#9ca3af" : "#374151",
                    fontSize: 13,
                    fontWeight: isCurrent ? 700 : 400,
                    cursor: isCurrent ? "default" : "pointer",
                    transition: "all 0.15s",
                  }}
                  disabled={isCurrent}
                >
                  <Box
                    style={{
                      width: 20, height: 20, borderRadius: 5,
                      backgroundColor: isCurrent ? "rgba(255,255,255,0.25)" : isPast ? "#e5e7eb" : phase.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      color: isCurrent ? "#fff" : isPast ? "#9ca3af" : "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {phase.number}
                  </Box>
                  {phase.name}
                  {isCurrent && <IconChevronRight size={12} style={{ opacity: 0.7 }} />}
                </button>
              </form>
            );
          })}
        </div>
        {totalItems > 0 && (
          <Box mt={16}>
            <Group justify="space-between" mb={6}>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                Progreso — {totalDone} de {totalItems} entregables completados
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 600, color: currentPhase.color }}>
                {progressPct}%
              </Text>
            </Group>
            <Progress
              value={progressPct}
              size={6}
              radius="xl"
              styles={{
                root: { backgroundColor: "#f3f4f6" },
                section: { backgroundColor: currentPhase.color },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Entregables por área */}
      <Box mb={8}>
        <Group justify="space-between" mb={16}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            Entregables — {currentPhase.name}
          </Text>
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>
            {totalDone}/{totalItems} completados
          </Text>
        </Group>

        <Stack gap={12}>
          {byArea.length === 0 ? (
            <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>
                No hay entregables para esta fase. Añade el primero.
              </Text>
            </Paper>
          ) : (
            byArea.map(({ area, items }) => {
              const done = items.filter((i) => i.status === "completado").length;
              return (
                <Paper key={area.id} p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
                  <Group justify="space-between" mb={12}>
                    <Group gap={8}>
                      <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: area.color }} />
                      <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{area.name}</Text>
                    </Group>
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>{done}/{items.length}</Text>
                  </Group>

                  <Stack gap={6}>
                    {items.map((item) => {
                      const s = STATUS_ICON[item.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.pending;
                      const Icon = s.Icon;
                      const dl = item.deadline ? formatDeadline(item.deadline) : null;
                      return (
                        <Box
                          key={item.id}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 10,
                            padding: "10px 10px", borderRadius: 8,
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <Icon size={14} color={s.color} style={{ flexShrink: 0, marginTop: 2 }} />
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontSize: 13, color: "#374151" }} lineClamp={1}>
                              {item.title}
                            </Text>
                            {item.description && (
                              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }} lineClamp={2}>
                                {item.description}
                              </Text>
                            )}
                            {dl && (
                              <Box style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, padding: "2px 7px", borderRadius: 5, backgroundColor: dl.bg }}>
                                <IconCalendar size={10} color={dl.color} />
                                <Text style={{ fontSize: 10, fontWeight: 600, color: dl.color }}>{dl.label}</Text>
                              </Box>
                            )}
                          </Box>
                          <StatusSelect
                            entregableId={item.id}
                            startupId={id}
                            currentStatus={item.status}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              );
            })
          )}

          <AddEntregableForm startupId={id} currentPhase={startup.current_phase} />
        </Stack>
      </Box>

      {/* Equipo */}
      <Box mt={40} style={{ borderTop: "1px solid #f3f4f6", paddingTop: 32 }}>
        <TeamSection startupId={id} members={members} />
      </Box>

    </Box>
  );
}
