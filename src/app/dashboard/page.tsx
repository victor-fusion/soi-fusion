import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAreas } from "@/lib/data/areas";
import { getPhases } from "@/lib/data/phases";
import type { Entregable } from "@/types";
import {
  Box, Text, Title, Group, Stack, Progress,
  Badge, Paper,
} from "@mantine/core";
import {
  IconCircleCheck, IconCircle, IconClock,
  IconLock, IconCalendar, IconCheckbox, IconPlus, IconCalendarEvent,
} from "@tabler/icons-react";

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  if (diffDays < 0) return { label: `Venció el ${label}`, color: "#ef4444", bg: "#fef2f2" };
  if (diffDays === 0) return { label: "Vence hoy", color: "#d97706", bg: "#fffbeb" };
  if (diffDays <= 7) return { label: `${diffDays}d · ${label}`, color: "#d97706", bg: "#fffbeb" };
  return { label, color: "#9ca3af", bg: "#f3f4f6" };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 13) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof IconCircleCheck }> = {
  completado:          { label: "Completado",  color: "#16a34a", bg: "#f0fdf4", icon: IconCircleCheck },
  en_revision:         { label: "En revisión", color: "#ca8a04", bg: "#fef9c3", icon: IconClock },
  cambios_solicitados: { label: "Cambios sol.", color: "#e11d48", bg: "#fff1f2", icon: IconClock },
  en_progreso:         { label: "En progreso", color: "#2563eb", bg: "#eff6ff", icon: IconClock },
  pendiente:           { label: "Pendiente",   color: "#9ca3af", bg: "#f9fafb", icon: IconCircle },
};

const PHASE_QUESTION: Record<number, string> = {
  1: "¿Hay alguien con este problema al que le importa lo suficiente como para buscar una solución?",
  2: "¿Nuestra solución conecta con el problema validado y hay gente dispuesta a saber más?",
  3: "¿Hay personas que usan nuestro producto y obtienen valor de él?",
  4: "¿Alguien paga por esto y podemos repetirlo?",
  5: "¿Podemos crecer de forma predecible y sostenible?",
  6: "¿Estamos preparados para funcionar sin Fusión?",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [AREAS, PHASES] = await Promise.all([getAreas(), getPhases()]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, startups(*)")
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");

  const startup = profile.startups as {
    id: string; name: string; current_phase: number; type: string;
  } | null;

  let entregables: Entregable[] = [];

  if (startup) {
    const { data } = await supabase
      .from("entregables")
      .select("*")
      .eq("startup_id", startup.id)
      .order("area");
    entregables = (data ?? []) as Entregable[];
  }

  const currentPhaseNum = startup?.current_phase ?? 1;
  const currentPhase = PHASES.find((p) => p.number === currentPhaseNum) ?? PHASES[0];

  const currentEntregables = entregables.filter((e) => e.phase === currentPhaseNum);
  const totalDone = currentEntregables.filter((e) => e.status === "completado").length;
  const totalEntregables = currentEntregables.length;
  const progressPct = totalEntregables > 0 ? Math.round((totalDone / totalEntregables) * 100) : 0;

  const byArea = AREAS.map((area) => ({
    area,
    items: currentEntregables.filter((e) => e.area === area.id),
  })).filter((g) => g.items.length > 0);

  const firstName = profile.first_name ?? "—";

  return (
    <Box p={40} maw={1100} mx="auto">

      {/* Header */}
      <Box mb={32}>
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
          <Title order={3} style={{ color: "#111827" }}>Aún no tienes startup asignada</Title>
          <Text mt="xs" style={{ color: "#6b7280" }}>El equipo de Fusión te asignará tu startup en breve.</Text>
        </Paper>
      )}

      {startup && (
        <Stack gap={28}>

          {/* Timeline de fases */}
          <Box>
            <Box style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {PHASES.map((phase, i) => {
                const isDone = phase.number < currentPhaseNum;
                const isCurrent = phase.number === currentPhaseNum;
                const isLocked = phase.number > currentPhaseNum;
                const isLast = i === PHASES.length - 1;

                return (
                  <Box key={phase.number} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
                    <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <Box
                        style={{
                          width: isCurrent ? 36 : 28,
                          height: isCurrent ? 36 : 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isDone ? "#bbf7d0" : isCurrent ? phase.color : "#f3f4f6",
                          border: isCurrent ? `3px solid ${phase.color}` : "none",
                          flexShrink: 0,
                        }}
                      >
                        {isDone
                          ? <IconCircleCheck size={16} color="#16a34a" />
                          : isLocked
                          ? <IconLock size={12} color="#d1d5db" />
                          : <Text style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{phase.number}</Text>
                        }
                      </Box>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: isCurrent ? 700 : 400,
                          color: isCurrent ? "#111827" : isDone ? "#6b7280" : "#d1d5db",
                          textAlign: "center",
                          width: 80,
                          lineHeight: 1.3,
                        }}
                      >
                        {phase.name}
                      </Text>
                    </Box>
                    {!isLast && (
                      <Box
                        style={{
                          flex: 1,
                          height: 2,
                          marginBottom: 22,
                          backgroundColor: isDone ? "#bbf7d0" : "#f3f4f6",
                          marginLeft: 4,
                          marginRight: 4,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Fase actual — hero */}
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
            <Box style={{ position: "absolute", inset: 0, opacity: 0.08, background: "radial-gradient(ellipse at top right, white, transparent)" }} />
            <Box style={{ position: "relative" }}>
              <Group justify="space-between" mb={16} align="flex-start">
                <Box>
                  <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                    Fase {currentPhase.number} de 6 · Fase actual
                  </Text>
                  <Title order={2} style={{ color: "white", marginTop: 4, marginBottom: 8 }}>{currentPhase.name}</Title>
                  <Text style={{ fontSize: 14, opacity: 0.85, maxWidth: 520, lineHeight: 1.6 }}>
                    {PHASE_QUESTION[currentPhaseNum]}
                  </Text>
                </Box>
                {totalEntregables > 0 && (
                  <Box style={{ textAlign: "right", flexShrink: 0 }}>
                    <Text style={{ fontSize: 11, opacity: 0.7 }}>Progreso</Text>
                    <Text style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{progressPct}%</Text>
                    <Text style={{ fontSize: 12, opacity: 0.7 }}>{totalDone}/{totalEntregables} entregables</Text>
                  </Box>
                )}
              </Group>
              <Progress
                value={progressPct}
                size={6}
                radius="xl"
                styles={{ root: { backgroundColor: "rgba(255,255,255,0.2)" }, section: { backgroundColor: "white" } }}
              />
            </Box>
          </Box>

          {/* Tres columnas: Tareas · Reuniones · (próximamente) */}
          <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

            {/* Tareas */}
            <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
              <Group justify="space-between" mb={16}>
                <Group gap={8}>
                  <IconCheckbox size={15} color="#16a34a" />
                  <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Tareas</Text>
                </Group>
                <Link
                  href="/dashboard/tareas"
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 12, color: "#16a34a", fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  <IconPlus size={12} />
                  Nueva
                </Link>
              </Group>
              <Box style={{ textAlign: "center", padding: "24px 0" }}>
                <IconCheckbox size={32} color="#e5e7eb" />
                <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>No tienes tareas aún</Text>
                <Link
                  href="/dashboard/tareas"
                  style={{
                    display: "inline-block", marginTop: 12,
                    fontSize: 12, color: "#16a34a", fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Crear primera tarea →
                </Link>
              </Box>
            </Paper>

            {/* Reuniones */}
            <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
              <Group justify="space-between" mb={16}>
                <Group gap={8}>
                  <IconCalendarEvent size={15} color="#2563eb" />
                  <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Próximas reuniones</Text>
                </Group>
                <Link
                  href="/dashboard/reuniones"
                  style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}
                >
                  Ver todas
                </Link>
              </Group>
              <Stack gap={8}>
                {[
                  { type: "PM Weekly",        title: "Seguimiento del proyecto",    date: "14/04/2026", time: "10:00" },
                  { type: "Demo",              title: "Demo Fase 1 con inversores",  date: "16/04/2026", time: "16:00" },
                  { type: "Mentor Session",    title: "Revisión de estrategia GTM",  date: "18/04/2026", time: "11:30" },
                  { type: "PM Weekly",         title: "Seguimiento del proyecto",    date: "21/04/2026", time: "10:00" },
                  { type: "Workshop",          title: "Taller de pricing",           date: "24/04/2026", time: "09:00" },
                ].map((r, i) => (
                  <Box
                    key={i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 12px", borderRadius: 8,
                      backgroundColor: "#f9fafb", border: "1px solid #f3f4f6",
                    }}
                  >
                    <Box
                      style={{
                        flexShrink: 0, width: 36, textAlign: "center",
                        backgroundColor: "#eff6ff", borderRadius: 6, padding: "4px 0",
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", lineHeight: 1.2 }}>
                        {r.date.split("/")[0]}
                      </Text>
                      <Text style={{ fontSize: 9, color: "#93c5fd", lineHeight: 1.2 }}>
                        {["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"][parseInt(r.date.split("/")[1]) - 1]}
                      </Text>
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Badge size="xs" variant="light" color="blue" mb={2}>{r.type}</Badge>
                      <Text style={{ fontSize: 12, fontWeight: 500, color: "#111827" }} lineClamp={1}>{r.title}</Text>
                      <Group gap={4} mt={2}>
                        <IconCalendar size={10} color="#9ca3af" />
                        <Text style={{ fontSize: 11, color: "#9ca3af" }}>{r.date} · {r.time}</Text>
                      </Group>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Entregables */}
            <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
              <Group justify="space-between" mb={16}>
                <Group gap={8}>
                  <IconCircle size={15} color="#7c3aed" />
                  <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Entregables</Text>
                </Group>
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>{totalDone}/{totalEntregables}</Text>
              </Group>
              {byArea.length === 0 ? (
                <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>
                  No hay entregables para esta fase todavía.
                </Text>
              ) : (
                <Stack gap={12}>
                  {byArea.map(({ area, items }) => {
                    const done = items.filter((i) => i.status === "completado").length;
                    return (
                      <Box key={area.id}>
                        <Group justify="space-between" mb={6}>
                          <Group gap={6}>
                            <Box style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: area.color }} />
                            <Text style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{area.name}</Text>
                          </Group>
                          <Text style={{ fontSize: 11, color: "#9ca3af" }}>{done}/{items.length}</Text>
                        </Group>
                        <Stack gap={4}>
                          {items.map((item) => {
                            const s = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
                            const Icon = s.icon;
                            const dl = item.deadline ? formatDeadline(item.deadline) : null;
                            return (
                              <Link key={item.id} href={`/dashboard/entregables/${item.id}`} style={{ textDecoration: "none" }}>
                                <Box style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", borderRadius: 8, backgroundColor: s.bg, cursor: "pointer" }}>
                                  <Icon size={13} color={s.color} style={{ marginTop: 2, flexShrink: 0 }} />
                                  <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontSize: 12, fontWeight: 500, color: "#111827" }} lineClamp={1}>{item.title}</Text>
                                    {dl && (
                                      <Box style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3, padding: "1px 6px", borderRadius: 4, backgroundColor: dl.bg }}>
                                        <IconCalendar size={9} color={dl.color} />
                                        <Text style={{ fontSize: 10, fontWeight: 600, color: dl.color }}>{dl.label}</Text>
                                      </Box>
                                    )}
                                  </Box>
                                  <Badge size="xs" variant="light" style={{ backgroundColor: `${s.color}18`, color: s.color, flexShrink: 0 }}>{s.label}</Badge>
                                </Box>
                              </Link>
                            );
                          })}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>

          </Box>

          {/* Próximas fases */}
          {currentPhaseNum < 6 && (
            <Box>
              <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginBottom: 12 }}>
                Próximas fases
              </Text>
              <Stack gap={8}>
                {PHASES.filter((p) => p.number > currentPhaseNum).map((phase) => (
                  <Box
                    key={phase.number}
                    px={20}
                    py={14}
                    style={{
                      borderRadius: 12,
                      border: "1px solid #f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      opacity: 0.5,
                    }}
                  >
                    <Box
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        backgroundColor: "#f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconLock size={11} color="#d1d5db" />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>
                        Fase {phase.number} — {phase.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                        {PHASE_QUESTION[phase.number]}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

        </Stack>
      )}
    </Box>
  );
}
