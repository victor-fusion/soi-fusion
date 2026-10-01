import { createClient } from "@/lib/supabase/server";
import { getPhases } from "@/lib/data/phases";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cycle } from "@/types";
import { CyclesSection } from "./_components/CyclesSection";

/** En Configuración se leen sin caché, para ver al momento lo que se acaba de editar. */
async function getCyclesFresh(supabase: SupabaseClient): Promise<Cycle[]> {
  const { data } = await supabase.from("cycles").select("number, name, start_date, end_date, is_active").order("number");
  return (data ?? []) as Cycle[];
}
import {
  Box, Text, Title, Group, Stack, Paper, Badge, ThemeIcon,
} from "@mantine/core";
import { IconSettings, IconCalendar, IconUsers, IconBuildingStore } from "@tabler/icons-react";

export default async function ConfigPage() {
  const supabase = await createClient();

  const [PHASES, cycles, { data: batchRows }, { count: founderCount }, { count: adminCount }] = await Promise.all([
    getPhases(),
    getCyclesFresh(supabase),
    supabase.from("startups").select("batch"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "founder"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
  ]);

  const startupCount = batchRows?.length ?? 0;
  const startupsPerCycle: Record<number, number> = {};
  for (const r of batchRows ?? []) startupsPerCycle[r.batch] = (startupsPerCycle[r.batch] ?? 0) + 1;

  return (
    <Box p={40} maw={800} mx="auto">

      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Title order={1} style={{ fontSize: "2rem", color: "#111827", marginTop: 4 }}>
          Configuración
        </Title>
      </Box>

      <Stack gap={20}>

        {/* Ciclos */}
        <CyclesSection cycles={cycles} startupsPerCycle={startupsPerCycle} />

        {/* Usuarios */}
        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Group gap={10} mb={20}>
            <ThemeIcon size={32} radius="lg" color="blue" variant="light">
              <IconUsers size={16} />
            </ThemeIcon>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Usuarios</Text>
          </Group>

          <Group gap={32}>
            <Box>
              <Text style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Founders
              </Text>
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>{founderCount ?? 0}</Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Admins
              </Text>
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>{adminCount ?? 0}</Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Startups
              </Text>
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>{startupCount}</Text>
            </Box>
          </Group>
        </Paper>

        {/* Fases */}
        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Group gap={10} mb={20}>
            <ThemeIcon size={32} radius="lg" color="violet" variant="light">
              <IconBuildingStore size={16} />
            </ThemeIcon>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Fases del ciclo</Text>
          </Group>

          <Stack gap={8}>
            {PHASES.map((phase) => (
              <Group key={phase.number} gap={12}>
                <Box
                  style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: phase.color, fontSize: 11, fontWeight: 700, color: "white",
                  }}
                >
                  {phase.number}
                </Box>
                <Text style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{phase.name}</Text>
              </Group>
            ))}
          </Stack>
        </Paper>

        {/* Próximamente */}
        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6", backgroundColor: "#fafafa" }}>
          <Group gap={10} mb={12}>
            <ThemeIcon size={32} radius="lg" color="gray" variant="light">
              <IconSettings size={16} />
            </ThemeIcon>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Ajustes avanzados</Text>
            <Badge size="xs" color="gray" variant="light">Próximamente</Badge>
          </Group>
          <Text style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
            Gestión de usuarios, asignación de startups a founders, configuración del Agente SDR y ajustes del ciclo.
          </Text>
        </Paper>

      </Stack>
    </Box>
  );
}
