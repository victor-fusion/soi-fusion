import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PHASES } from "@/constants/areas";
import type { Startup } from "@/types";
import Link from "next/link";
import { Suspense } from "react";
import {
  Box, Text, Title, Group, Stack, Badge, Paper, Progress, ThemeIcon,
} from "@mantine/core";
import { IconArrowRight, IconUsers } from "@tabler/icons-react";
import { CreateStartupForm } from "./_components/CreateStartupForm";
import { BatchFilter } from "../_components/BatchFilter";

const TYPE_LABELS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  b2c_app: "B2C App",
  marketplace: "Marketplace",
  producto_fisico: "Producto físico",
  servicios: "Servicios",
};

const STATUS_COLOR: Record<string, string> = {
  activa: "#16a34a",
  en_pausa: "#d97706",
  en_revision: "#2563eb",
  inactiva: "#9ca3af",
  cerrada: "#ef4444",
};

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch: batchParam } = await searchParams;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Ciclos disponibles
  const { data: batchRows } = await supabase
    .from("startups")
    .select("batch")
    .order("batch");
  const availableBatches = [...new Set((batchRows ?? []).map((r: { batch: number }) => r.batch))].sort() as number[];

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

  return (
    <Box p={40} maw={1100} mx="auto">

      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Group justify="space-between" align="center" mt={4}>
          <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>
            Startups
          </Title>
          <Group gap={12}>
            <Suspense fallback={null}>
              <BatchFilter batches={availableBatches} activeBatch={selectedBatch} basePath="/admin/startups" />
            </Suspense>
            <CreateStartupForm />
          </Group>
        </Group>
      </Box>

      <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
        <Box
          px={24} py={14}
          style={{
            borderBottom: "1px solid #f3f4f6",
            display: "grid",
            gridTemplateColumns: "1fr 100px 140px 180px 80px 32px",
            gap: 16, alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          {["Startup", "Tipo", "Fase actual", "Progreso de fase", "Estado", ""].map((h) => (
            <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </Text>
          ))}
        </Box>

        {allStartups.length === 0 ? (
          <Box py={48} style={{ textAlign: "center" }}>
            <ThemeIcon size={48} radius="xl" color="gray" variant="light" mx="auto" mb="md">
              <IconUsers size={22} />
            </ThemeIcon>
            <Text style={{ color: "#6b7280" }}>No hay startups todavía</Text>
            <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
              Crea la primera con el botón de arriba
            </Text>
          </Box>
        ) : (
          <Stack gap={0}>
            {allStartups.map((startup, i) => {
              const prog = progressMap[startup.id] ?? { done: 0, total: 0, pct: 0 };
              const phase = PHASES.find((p) => p.number === startup.current_phase) ?? PHASES[0];
              const isLast = i === allStartups.length - 1;

              return (
                <Box
                  key={startup.id}
                  px={24} py={16}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 140px 180px 80px 32px",
                    gap: 16, alignItems: "center",
                    borderBottom: isLast ? "none" : "1px solid #f9fafb",
                  }}
                >
                  <Box style={{ minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }} truncate>
                      {startup.name}
                    </Text>
                    {startup.tagline && (
                      <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }} truncate>
                        {startup.tagline}
                      </Text>
                    )}
                  </Box>

                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {TYPE_LABELS[startup.type] ?? startup.type}
                  </Text>

                  <Group gap={8}>
                    <Box
                      style={{
                        width: 20, height: 20, borderRadius: 5,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, flexShrink: 0,
                        backgroundColor: phase.color, color: "white",
                      }}
                    >
                      {phase.number}
                    </Box>
                    <Text style={{ fontSize: 12, color: "#374151" }} lineClamp={1}>
                      {phase.name}
                    </Text>
                  </Group>

                  <Box>
                    {prog.total > 0 ? (
                      <>
                        <Group justify="space-between" mb={4}>
                          <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                            {prog.done}/{prog.total}
                          </Text>
                          <Text style={{ fontSize: 11, fontWeight: 600, color: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706" }}>
                            {prog.pct}%
                          </Text>
                        </Group>
                        <Progress
                          value={prog.pct} size={6} radius="xl"
                          styles={{
                            root: { backgroundColor: "#f3f4f6" },
                            section: { backgroundColor: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706" },
                          }}
                        />
                      </>
                    ) : (
                      <Text style={{ fontSize: 12, color: "#d1d5db" }}>Sin entregables</Text>
                    )}
                  </Box>

                  <Badge
                    size="sm" variant="dot"
                    styles={{ root: { color: STATUS_COLOR[startup.status] ?? "#9ca3af", borderColor: "transparent" } }}
                  >
                    {startup.status === "activa" ? "Activa"
                      : startup.status === "en_pausa" ? "En pausa"
                      : startup.status}
                  </Badge>

                  <Link
                    href={`/admin/startups/${startup.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", textDecoration: "none" }}
                  >
                    <IconArrowRight size={14} />
                  </Link>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
