import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREAS, PHASES } from "@/constants/areas";
import type { Entregable } from "@/types";
import Link from "next/link";
import {
  Box, Text, Title, Group, Stack, Progress,
  Badge, Paper, SimpleGrid, ThemeIcon,
} from "@mantine/core";
import {
  IconCircleCheck, IconCircle, IconClock,
  IconTrophy, IconArrowRight, IconTrendingUp,
} from "@tabler/icons-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 13) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  done:        { label: "Completado", color: "green" },
  in_progress: { label: "En progreso", color: "blue" },
  pending:     { label: "Pendiente", color: "gray" },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, startups(*)")
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");

  const startup = profile.startups as {
    id: string; name: string; current_phase: number;
    north_star_metric?: string; north_star_value?: string; type: string;
  } | null;

  let entregables: Entregable[] = [];

  if (startup) {
    const { data } = await supabase
      .from("entregables")
      .select("*")
      .eq("startup_id", startup.id)
      .eq("phase", startup.current_phase)
      .order("area");
    entregables = (data ?? []) as Entregable[];
  }

  const totalDone = entregables.filter((e) => e.status === "done").length;
  const totalEntregables = entregables.length;
  const progressPct = totalEntregables > 0 ? Math.round((totalDone / totalEntregables) * 100) : 0;
  const currentPhase = PHASES.find((m) => m.number === (startup?.current_phase ?? 1)) ?? PHASES[0];
  const pending = entregables.filter((e) => e.status !== "done").slice(0, 4);
  const byArea = AREAS.map((area) => ({
    area,
    items: entregables.filter((e) => e.area === area.id),
  })).filter((g) => g.items.length > 0);

  const firstName = profile.full_name.split(" ")[0];

  return (
    <Box p={40} maw={960} mx="auto">

      {/* Header */}
      <Box mb={40}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{getGreeting()}</Text>
        <Title order={1} style={{ fontSize: "2rem", color: "#111827", marginTop: 4 }}>
          {firstName}
          {startup && (
            <Text component="span" style={{ color: "#d1d5db", fontWeight: 400 }}> · {startup.name}</Text>
          )}
        </Title>
      </Box>

      {/* Sin startup */}
      {!startup && (
        <Paper p={48} radius="lg" withBorder style={{ textAlign: "center", borderColor: "#f3f4f6" }}>
          <ThemeIcon size={48} radius="xl" color="gray" variant="light" mx="auto" mb="md">
            <IconTrophy size={22} />
          </ThemeIcon>
          <Title order={3} style={{ color: "#111827" }}>Aún no tienes startup asignada</Title>
          <Text mt="xs" style={{ color: "#6b7280" }}>El equipo de Fusión te asignará tu startup en breve.</Text>
        </Paper>
      )}

      {startup && (
        <Stack gap={24}>

          {/* Mes actual */}
          <Box
            p={28}
            style={{
              borderRadius: 16,
              backgroundColor: currentPhase.color,
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                position: "absolute", inset: 0, opacity: 0.08,
                background: "radial-gradient(ellipse at top right, white, transparent)",
              }}
            />
            <Box style={{ position: "relative" }}>
              <Group justify="space-between" mb={16} align="flex-start">
                <Box>
                  <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                    Fase {currentPhase.number} de 6
                  </Text>
                  <Title order={2} style={{ color: "white", marginTop: 4 }}>{currentPhase.name}</Title>
                </Box>
                <Box style={{ textAlign: "right" }}>
                  <Text style={{ fontSize: 11, opacity: 0.7 }}>Progreso del mes</Text>
                  <Text style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{progressPct}%</Text>
                </Box>
              </Group>

              <Progress
                value={progressPct}
                size={6}
                radius="xl"
                mb={14}
                styles={{ root: { backgroundColor: "rgba(255,255,255,0.2)" }, section: { backgroundColor: "white" } }}
              />

              <Group justify="space-between">
                <Text style={{ fontSize: 13, opacity: 0.8 }}>
                  {totalDone} de {totalEntregables} entregables completados
                </Text>
                {startup.north_star_metric && (
                  <Group gap={6}>
                    <IconTrendingUp size={13} opacity={0.8} />
                    <Text style={{ fontSize: 13, opacity: 0.8 }}>
                      {startup.north_star_metric}:{" "}
                      <strong style={{ opacity: 1 }}>{startup.north_star_value ?? "—"}</strong>
                    </Text>
                  </Group>
                )}
              </Group>
            </Box>
          </Box>

          {/* Grid principal */}
          <SimpleGrid cols={3} spacing={20}>

            {/* Columna izquierda — 2/3 */}
            <Box style={{ gridColumn: "span 2" }}>
              <Stack gap={20}>

                {/* Próximas tareas */}
                <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
                  <Group justify="space-between" mb={20}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Próximas tareas</Text>
                    <Link
                      href="/dashboard/roadmap"
                      style={{ fontSize: 13, color: "#16a34a", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      Ver todo <IconArrowRight size={12} />
                    </Link>
                  </Group>

                  {pending.length === 0 ? (
                    <Box style={{ textAlign: "center", padding: "24px 0" }}>
                      <IconCircleCheck size={32} color="#86efac" style={{ margin: "0 auto 8px" }} />
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>¡Todo completado este mes!</Text>
                    </Box>
                  ) : (
                    <Stack gap={8}>
                      {pending.map((item) => {
                        const area = AREAS.find((a) => a.id === item.area);
                        const s = STATUS_MAP[item.status] ?? STATUS_MAP.pending;
                        return (
                          <Box
                            key={item.id}
                            p={14}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 12,
                              borderRadius: 10, border: "1px solid #f3f4f6",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            {item.status === "in_progress"
                              ? <IconClock size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                              : <IconCircle size={16} color="#d1d5db" style={{ marginTop: 2, flexShrink: 0 }} />
                            }
                            <Box style={{ flex: 1, minWidth: 0 }}>
                              <Text style={{ fontSize: 14, fontWeight: 500, color: "#111827" }} lineClamp={1}>
                                {item.title}
                              </Text>
                              <Group gap={6} mt={4}>
                                {area && (
                                  <Badge
                                    size="xs"
                                    variant="light"
                                    style={{ backgroundColor: `${area.color}18`, color: area.color }}
                                  >
                                    {area.name}
                                  </Badge>
                                )}
                                <Badge size="xs" color={s.color} variant="light">{s.label}</Badge>
                              </Group>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>

                {/* Áreas activas */}
                {byArea.length > 0 && (
                  <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                      Áreas activas este mes
                    </Text>
                    <Stack gap={12}>
                      {byArea.map(({ area, items }) => {
                        const done = items.filter((i) => i.status === "done").length;
                        const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
                        return (
                          <Link
                            key={area.id}
                            href={`/dashboard/arsenal/${area.id}`}
                            style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
                          >
                            <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />
                            <Text style={{ fontSize: 13, fontWeight: 500, color: "#374151", width: 110, flexShrink: 0 }}>
                              {area.name}
                            </Text>
                            <Progress
                              value={pct} size={4} radius="xl" flex={1}
                              styles={{ root: { backgroundColor: "#f3f4f6" }, section: { backgroundColor: area.color } }}
                            />
                            <Text style={{ fontSize: 12, color: "#9ca3af", width: 32, textAlign: "right", flexShrink: 0 }}>
                              {done}/{items.length}
                            </Text>
                          </Link>
                        );
                      })}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Box>

            {/* Columna derecha — 1/3 */}
            <Stack gap={20}>

              {/* Tu ciclo */}
              <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
                <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Las 6 fases</Text>
                <Stack gap={8}>
                  {PHASES.map((m) => {
                    const isCurrent = m.number === startup.current_phase;
                    const isPast = m.number < startup.current_phase;
                    return (
                      <Group key={m.number} gap={10}>
                        <Box
                          style={{
                            width: 24, height: 24, borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                            backgroundColor: isCurrent ? m.color : isPast ? "#f3f4f6" : "#fafafa",
                            color: isCurrent ? "white" : isPast ? "#9ca3af" : "#d1d5db",
                          }}
                        >
                          {m.number}
                        </Box>
                        <Text style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "#111827" : "#9ca3af", flex: 1 }}>
                          {m.name}
                        </Text>
                        {isPast && <IconCircleCheck size={14} color="#86efac" />}
                      </Group>
                    );
                  })}
                </Stack>
              </Paper>

              {/* Acceso rápido */}
              <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
                <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Acceso rápido</Text>
                <Stack gap={4}>
                  {[
                    { href: "/dashboard/crm", label: "Ver CRM", color: "#2563eb" },
                    { href: "/dashboard/agente", label: "Agente SDR", color: "#ea580c" },
                    { href: "/dashboard/arsenal", label: "El Arsenal", color: "#7c3aed" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 0", textDecoration: "none",
                        borderBottom: "1px solid #f9fafb",
                        color: link.color, fontSize: 14, fontWeight: 500,
                      }}
                    >
                      {link.label}
                      <IconArrowRight size={14} />
                    </Link>
                  ))}
                </Stack>
              </Paper>

            </Stack>
          </SimpleGrid>
        </Stack>
      )}
    </Box>
  );
}
