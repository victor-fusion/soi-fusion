import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PHASES, AREAS } from "@/constants/areas";
import type { Entregable } from "@/types";
import {
  Box, Text, Title, Group, Stack, Badge, Paper, ThemeIcon,
} from "@mantine/core";
import {
  IconCircleCheck, IconLock, IconChevronRight,
  IconCircle, IconClock,
} from "@tabler/icons-react";

const PHASE_CRITERIA: Record<number, string[]> = {
  1: [
    "Mínimo 15 entrevistas documentadas (no amigos ni familia)",
    "Más del 60% confirman el problema sin inducción",
    "ICP v1 definido con un segmento concreto y acotado",
  ],
  2: [
    "Mockup mostrado a mínimo 10 ICPs con feedback documentado",
    "Lista de 100 ICPs construida y primeros mensajes enviados",
    "Pricing v1 testeado en al menos 5 conversaciones",
    "Landing activa recibiendo registros",
  ],
  3: [
    "MVP lanzado y funcional",
    "Mínimo 15 demos realizadas con feedback documentado",
    "CRM activo con pipeline real",
    "Al menos 20% de las demos generan follow-up o interés concreto",
  ],
  4: [
    "Al menos un cliente que ha pagado o piloto con compromiso de pago",
    "Unit economics calculados con datos reales (CAC, LTV, margen)",
    "Funnel documentado con métricas reales",
    "Un caso de éxito que se puede contar",
  ],
  5: [
    "Canal de adquisición identificado con datos",
    "Pitch deck con métricas reales validado por al menos 3 externos",
    "Proyección financiera a 12 meses construida",
    "Al menos un proceso operativo automatizado",
  ],
  6: [
    "Dashboard financiero completo (MRR, CAC, LTV, burn rate, runway)",
    "Plan operativo 6-12 meses documentado",
    "Kit inversor preparado (si aplica)",
    "Pitch de Demo Day preparado y ensayado",
    "Plan de equipo post-ciclo definido",
  ],
};

const PHASE_QUESTION: Record<number, string> = {
  1: "¿Hay alguien con este problema al que le importa lo suficiente como para buscar una solución?",
  2: "¿Nuestra solución conecta con el problema validado y hay gente dispuesta a saber más?",
  3: "¿Hay personas que usan nuestro producto y obtienen valor de él?",
  4: "¿Alguien paga por esto y podemos repetirlo?",
  5: "¿Podemos crecer de forma predecible y sostenible?",
  6: "¿Estamos preparados para funcionar sin Fusión?",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof IconCircleCheck }> = {
  completado:          { label: "Completado",        color: "#16a34a", bg: "#f0fdf4", icon: IconCircleCheck },
  en_revision:         { label: "En revisión",       color: "#ca8a04", bg: "#fef9c3", icon: IconClock },
  cambios_solicitados: { label: "Cambios sol.",      color: "#e11d48", bg: "#fff1f2", icon: IconClock },
  en_progreso:         { label: "En progreso",       color: "#2563eb", bg: "#eff6ff", icon: IconClock },
  pendiente:           { label: "Pendiente",         color: "#9ca3af", bg: "#f9fafb", icon: IconCircle },
};

export default async function RoadmapPage() {
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
  } | null;

  if (!startup) {
    return (
      <Box p={40} maw={900} mx="auto">
        <Text style={{ color: "#6b7280" }}>No tienes startup asignada.</Text>
      </Box>
    );
  }

  const currentPhaseNum = startup.current_phase;

  // Cargar entregables de todas las fases
  const { data } = await supabase
    .from("entregables")
    .select("*")
    .eq("startup_id", startup.id)
    .order("area");

  const entregables = (data ?? []) as Entregable[];

  const currentPhase = PHASES.find((p) => p.number === currentPhaseNum)!;

  // Entregables de la fase actual agrupados por área
  const currentEntregables = entregables.filter((e) => e.phase === currentPhaseNum);
  const byArea = AREAS.map((area) => ({
    area,
    items: currentEntregables.filter((e) => e.area === area.id),
  })).filter((g) => g.items.length > 0);

  const totalDone = currentEntregables.filter((e) => e.status === "completado").length;
  const totalItems = currentEntregables.length;

  return (
    <Box p={40} maw={900} mx="auto">

      {/* Header */}
      <Box mb={40}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Tu progresión</Text>
        <Title order={1} style={{ fontSize: "2rem", color: "#111827", marginTop: 4 }}>
          Roadmap
        </Title>
      </Box>

      {/* Timeline de fases */}
      <Box mb={48}>
        <Box style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {PHASES.map((phase, i) => {
            const isDone = phase.number < currentPhaseNum;
            const isCurrent = phase.number === currentPhaseNum;
            const isLocked = phase.number > currentPhaseNum;
            const isLast = i === PHASES.length - 1;

            return (
              <Box key={phase.number} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
                {/* Nodo */}
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
                      position: "relative",
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

                {/* Línea conectora */}
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

      {/* Fase actual — bloque principal */}
      <Box
        mb={32}
        p={32}
        style={{
          borderRadius: 16,
          backgroundColor: currentPhase.color,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box style={{ position: "absolute", inset: 0, opacity: 0.07, background: "radial-gradient(ellipse at top right, white, transparent)" }} />
        <Box style={{ position: "relative" }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                Fase actual · {currentPhaseNum} de 6
              </Text>
              <Title order={2} style={{ color: "white", marginTop: 4, marginBottom: 12 }}>
                {currentPhase.name}
              </Title>
              <Text style={{ fontSize: 14, opacity: 0.85, maxWidth: 520, lineHeight: 1.6 }}>
                {PHASE_QUESTION[currentPhaseNum]}
              </Text>
            </Box>
            {totalItems > 0 && (
              <Box style={{ textAlign: "right", flexShrink: 0 }}>
                <Text style={{ fontSize: 11, opacity: 0.7 }}>Entregables</Text>
                <Text style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
                  {totalDone}/{totalItems}
                </Text>
              </Box>
            )}
          </Group>
        </Box>
      </Box>

      <Group align="flex-start" gap={24} style={{ alignItems: "flex-start" }}>

        {/* Criterios de avance */}
        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6", flex: 1 }}>
          <Group gap={8} mb={20}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Criterios de avance
            </Text>
            <Badge size="xs" color="gray" variant="light">Fusión decide</Badge>
          </Group>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 }}>
            Estas son las condiciones que el equipo de Fusión evalúa para autorizar el avance a la siguiente fase.
          </Text>
          <Stack gap={10}>
            {(PHASE_CRITERIA[currentPhaseNum] ?? []).map((criterion, i) => (
              <Box
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  backgroundColor: "#fafafa",
                  border: "1px solid #f3f4f6",
                }}
              >
                <Box
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: "2px dashed #d1d5db",
                    flexShrink: 0, marginTop: 1,
                  }}
                />
                <Text style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                  {criterion}
                </Text>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Entregables por área */}
        <Box style={{ flex: 1 }}>
          {byArea.length === 0 ? (
            <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>
                No hay entregables cargados para esta fase todavía.
              </Text>
            </Paper>
          ) : (
            <Stack gap={12}>
              {byArea.map(({ area, items }) => {
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
                        const s = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                        const Icon = s.icon;
                        return (
                          <Box
                            key={item.id}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 10,
                              padding: "8px 10px", borderRadius: 8,
                              backgroundColor: s.bg,
                            }}
                          >
                            <Icon size={14} color={s.color} style={{ marginTop: 2, flexShrink: 0 }} />
                            <Box style={{ flex: 1, minWidth: 0 }}>
                              <Text style={{ fontSize: 13, fontWeight: 500, color: "#111827" }} lineClamp={2}>
                                {item.title}
                              </Text>
                            </Box>
                            <Badge size="xs" variant="light" style={{ backgroundColor: `${s.color}18`, color: s.color, flexShrink: 0 }}>
                              {s.label}
                            </Badge>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>

      </Group>

      {/* Fases bloqueadas — vista previa */}
      {currentPhaseNum < 6 && (
        <Box mt={48}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginBottom: 16 }}>
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
                  <Text style={{ fontSize: 12, color: "#9ca3af" }} lineClamp={1}>
                    {PHASE_QUESTION[phase.number]}
                  </Text>
                </Box>
                <IconChevronRight size={14} color="#d1d5db" />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

    </Box>
  );
}
