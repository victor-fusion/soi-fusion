import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PHASES } from "@/constants/areas";
import type { Startup } from "@/types";
import Link from "next/link";
import { Suspense } from "react";
import {
  Box, Text, Title, Group, Stack, Progress,
  Badge, Paper, SimpleGrid, ThemeIcon, Avatar,
} from "@mantine/core";
import {
  IconTrendingUp, IconAlertTriangle,
  IconArrowRight, IconUsers, IconBuildingStore,
  IconCircleCheck,
} from "@tabler/icons-react";
import { BatchFilter } from "./_components/BatchFilter";

const TYPE_LABELS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  b2c_app: "B2C App",
  marketplace: "Marketplace",
  producto_fisico: "Producto físico",
  servicios: "Servicios",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  activa:      { label: "Activa",      color: "#16a34a" },
  en_pausa:    { label: "En pausa",    color: "#d97706" },
  en_revision: { label: "En revisión", color: "#2563eb" },
  inactiva:    { label: "Inactiva",    color: "#9ca3af" },
  cerrada:     { label: "Cerrada",     color: "#ef4444" },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch: batchParam } = await searchParams;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Todos los ciclos disponibles
  const { data: batchRows } = await supabase
    .from("startups")
    .select("batch")
    .order("batch");
  const availableBatches = [...new Set((batchRows ?? []).map((r: { batch: number }) => r.batch))].sort();

  // Ciclo activo por defecto: el mayor disponible. 0 = todos.
  const latestBatch = availableBatches.at(-1) ?? 5;
  const selectedBatch = batchParam !== undefined ? parseInt(batchParam, 10) : latestBatch;
  const showAll = selectedBatch === 0;

  let query = supabase.from("startups").select("*").order("name");
  if (!showAll) query = query.eq("batch", selectedBatch);

  const { data: startups } = await query;
  const allStartups = (startups ?? []) as Startup[];

  const startupIds = allStartups.map((s) => s.id);
  const { data: entregables } = startupIds.length > 0
    ? await supabase
        .from("entregables")
        .select("startup_id, status, phase")
        .in("startup_id", startupIds)
    : { data: [] };

  const progressMap = Object.fromEntries(
    allStartups.map((s) => {
      const mine = (entregables ?? []).filter(
        (e: { startup_id: string; phase: number; status: string }) =>
          e.startup_id === s.id && e.phase === s.current_phase
      );
      const done = mine.filter((e: { status: string }) => e.status === "completado").length;
      const pct = mine.length > 0 ? Math.round((done / mine.length) * 100) : 0;
      return [s.id, { done, total: mine.length, pct }];
    })
  );

  const active = allStartups.filter((s) => s.status === "activa").length;
  const avgProgress =
    allStartups.length > 0
      ? Math.round(
          allStartups.reduce((acc, s) => acc + (progressMap[s.id]?.pct ?? 0), 0) /
            allStartups.length
        )
      : 0;
  const atRisk = allStartups.filter(
    (s) => (progressMap[s.id]?.pct ?? 0) < 30 && s.status === "activa"
  ).length;

  // Distribución por fase
  const phaseDistribution = PHASES.map((phase) => ({
    phase,
    count: allStartups.filter((s) => s.current_phase === phase.number && s.status === "activa").length,
  })).filter((d) => d.count > 0);

  return (
    <Box p={40} maw={1100} mx="auto">

      {/* Header */}
      <Box mb={36}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Panel de administración</Text>
        <Group justify="space-between" align="flex-end" mt={4}>
          <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>
            Centro de Control
          </Title>
          <Suspense fallback={null}>
            <BatchFilter batches={availableBatches} activeBatch={selectedBatch} />
          </Suspense>
        </Group>
      </Box>

      {/* KPIs */}
      <SimpleGrid cols={3} spacing={16} mb={28}>
        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Startups activas
              </Text>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", lineHeight: 1.1, marginTop: 4 }}>
                {active}
                <Text component="span" style={{ fontSize: 14, color: "#9ca3af", fontWeight: 400 }}>
                  /{allStartups.length}
                </Text>
              </Text>
            </Box>
            <ThemeIcon size={36} radius="lg" color="green" variant="light">
              <IconBuildingStore size={18} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Progreso medio
              </Text>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", lineHeight: 1.1, marginTop: 4 }}>
                {avgProgress}%
              </Text>
            </Box>
            <ThemeIcon size={36} radius="lg" color="blue" variant="light">
              <IconTrendingUp size={18} />
            </ThemeIcon>
          </Group>
          <Progress
            value={avgProgress}
            size={4}
            radius="xl"
            mt={16}
            styles={{ root: { backgroundColor: "#f3f4f6" }, section: { backgroundColor: "#2563eb" } }}
          />
        </Paper>

        <Paper
          p={24}
          radius="lg"
          withBorder
          style={{
            borderColor: atRisk > 0 ? "#fef3c7" : "#f3f4f6",
            backgroundColor: atRisk > 0 ? "#fffbeb" : "#fff",
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Requieren atención
              </Text>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: atRisk > 0 ? "#d97706" : "#111827", lineHeight: 1.1, marginTop: 4 }}>
                {atRisk}
              </Text>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                {atRisk === 0 ? "Todo va bien" : atRisk === 1 ? "1 startup por debajo del 30%" : `${atRisk} startups por debajo del 30%`}
              </Text>
            </Box>
            <ThemeIcon size={36} radius="lg" color={atRisk > 0 ? "yellow" : "gray"} variant="light">
              <IconAlertTriangle size={18} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Distribución por fase */}
      {phaseDistribution.length > 0 && (
        <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6", marginBottom: 28 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 14 }}>
            Distribución por fase
          </Text>
          <Group gap={8} wrap="wrap">
            {PHASES.map((phase) => {
              const count = allStartups.filter(
                (s) => s.current_phase === phase.number && s.status === "activa"
              ).length;
              if (count === 0) return null;
              return (
                <Box
                  key={phase.number}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", borderRadius: 10,
                    backgroundColor: `${phase.color}10`,
                    border: `1px solid ${phase.color}30`,
                  }}
                >
                  <Box
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      backgroundColor: phase.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0,
                    }}
                  >
                    {phase.number}
                  </Box>
                  <Box>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{phase.name}</Text>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                      {count} {count === 1 ? "startup" : "startups"}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Group>
        </Paper>
      )}

      {/* Grid de startups */}
      {allStartups.length === 0 ? (
        <Paper p={48} radius="lg" withBorder style={{ borderColor: "#f3f4f6", textAlign: "center" }}>
          <ThemeIcon size={48} radius="xl" color="gray" variant="light" mx="auto" mb="md">
            <IconUsers size={22} />
          </ThemeIcon>
          <Text style={{ color: "#6b7280" }}>No hay startups en el Ciclo 5 todavía</Text>
          <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            Añade startups desde{" "}
            <Link href="/admin/startups" style={{ color: "#2563eb" }}>Startups</Link>
          </Text>
        </Paper>
      ) : (
        <Stack gap={0}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 14 }}>
            Startups del ciclo
          </Text>
          <SimpleGrid cols={2} spacing={12}>
            {allStartups.map((startup) => {
              const prog = progressMap[startup.id] ?? { done: 0, total: 0, pct: 0 };
              const phase = PHASES.find((p) => p.number === startup.current_phase) ?? PHASES[0];
              const statusCfg = STATUS_CONFIG[startup.status] ?? STATUS_CONFIG.inactiva;
              const isAtRisk = prog.pct < 30 && startup.status === "activa" && prog.total > 0;

              return (
                <Link
                  key={startup.id}
                  href={`/admin/startups/${startup.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Paper
                    p={20}
                    radius="lg"
                    withBorder
                    style={{
                      borderColor: isAtRisk ? "#fef3c7" : "#f3f4f6",
                      backgroundColor: isAtRisk ? "#fffbeb" : "#fff",
                      cursor: "pointer",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  >
                    {/* Header tarjeta */}
                    <Group justify="space-between" mb={12} align="flex-start">
                      <Group gap={12} align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                        <Avatar
                          src={startup.logo_url || undefined}
                          radius="md"
                          size={40}
                          style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", fontSize: 15, fontWeight: 700, flexShrink: 0 }}
                        >
                          {startup.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box style={{ minWidth: 0, flex: 1 }}>
                          <Group gap={6} mb={2}>
                            <Text style={{ fontSize: 15, fontWeight: 700, color: "#111827" }} truncate>
                              {startup.name}
                            </Text>
                            {isAtRisk && (
                              <IconAlertTriangle size={13} color="#d97706" style={{ flexShrink: 0 }} />
                            )}
                          </Group>
                          {startup.tagline && (
                            <Text style={{ fontSize: 12, color: "#6b7280" }} lineClamp={1}>
                              {startup.tagline}
                            </Text>
                          )}
                        </Box>
                      </Group>
                      <IconArrowRight size={14} color="#d1d5db" style={{ flexShrink: 0, marginTop: 3 }} />
                    </Group>

                    {/* Badges */}
                    <Group gap={6} mb={14}>
                      <Badge
                        size="xs"
                        variant="light"
                        style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                      >
                        Fase {phase.number} · {phase.name}
                      </Badge>
                      <Badge
                        size="xs"
                        variant="light"
                        style={{ backgroundColor: `${statusCfg.color}12`, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </Badge>
                      {startup.type && (
                        <Badge size="xs" color="gray" variant="light">
                          {TYPE_LABELS[startup.type] ?? startup.type}
                        </Badge>
                      )}
                    </Group>

                    {/* Progreso */}
                    {prog.total > 0 ? (
                      <Box>
                        <Group justify="space-between" mb={6}>
                          <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                            {prog.done}/{prog.total} entregables
                          </Text>
                          <Group gap={4} align="center">
                            {prog.pct === 100 && <IconCircleCheck size={12} color="#16a34a" />}
                            <Text style={{
                              fontSize: 11, fontWeight: 700,
                              color: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706",
                            }}>
                              {prog.pct}%
                            </Text>
                          </Group>
                        </Group>
                        <Progress
                          value={prog.pct}
                          size={5}
                          radius="xl"
                          styles={{
                            root: { backgroundColor: "#f3f4f6" },
                            section: {
                              backgroundColor: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706",
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <Text style={{ fontSize: 12, color: "#d1d5db" }}>Sin entregables asignados</Text>
                    )}
                  </Paper>
                </Link>
              );
            })}
          </SimpleGrid>
        </Stack>
      )}

    </Box>
  );
}
