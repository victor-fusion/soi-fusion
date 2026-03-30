import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PHASES } from "@/constants/areas";
import {
  Box, Text, Title, Group, Stack, Paper, Badge, ThemeIcon,
} from "@mantine/core";
import { IconSettings, IconCalendar, IconUsers, IconBuildingStore } from "@tabler/icons-react";

export default async function ConfigPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { count: startupCount } = await supabase
    .from("startups")
    .select("*", { count: "exact", head: true });

  const { count: founderCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "founder");

  const { count: adminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  return (
    <Box p={40} maw={800} mx="auto">

      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Title order={1} style={{ fontSize: "2rem", color: "#111827", marginTop: 4 }}>
          Configuración
        </Title>
      </Box>

      <Stack gap={20}>

        {/* Ciclo activo */}
        <Paper p={24} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
          <Group gap={10} mb={20}>
            <ThemeIcon size={32} radius="lg" color="green" variant="light">
              <IconCalendar size={16} />
            </ThemeIcon>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Ciclo activo</Text>
          </Group>

          <Group gap={32}>
            <Box>
              <Text style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Ciclo
              </Text>
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>5</Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Inicio
              </Text>
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>Abril 2026</Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Fases
              </Text>
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>6</Text>
            </Box>
          </Group>
        </Paper>

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
              <Text style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginTop: 2 }}>{startupCount ?? 0}</Text>
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
