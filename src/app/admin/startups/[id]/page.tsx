import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREAS, PHASES } from "@/constants/areas";
import type { Entregable } from "@/types";
import Link from "next/link";
import {
  Box, Text, Title, Group, Stack, Badge, Paper, Progress,
} from "@mantine/core";
import {
  IconArrowLeft, IconCircleCheck, IconCircle, IconClock,
  IconChevronRight,
} from "@tabler/icons-react";
import { changePhase } from "./actions";
import { StatusSelect } from "./_components/StatusSelect";
import { AddEntregableForm } from "./_components/AddEntregableForm";

const TYPE_LABELS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  b2c_app: "B2C App",
  marketplace: "Marketplace",
  producto_fisico: "Producto físico",
  servicios: "Servicios",
};

const STATUS_ICON = {
  done:        { Icon: IconCircleCheck, color: "#16a34a" },
  in_progress: { Icon: IconClock,        color: "#2563eb" },
  pending:     { Icon: IconCircle,       color: "#d1d5db" },
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

  // Founder
  const { data: founderProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("startup_id", id)
    .eq("role", "founder")
    .maybeSingle();

  // Entregables (fase actual)
  const { data: entregablesData } = await supabase
    .from("entregables")
    .select("*")
    .eq("startup_id", id)
    .eq("phase", startup.current_phase)
    .order("area");

  const entregables = (entregablesData ?? []) as Entregable[];

  const currentPhase = PHASES.find((p) => p.number === startup.current_phase) ?? PHASES[0];
  const totalDone = entregables.filter((e) => e.status === "done").length;
  const totalItems = entregables.length;
  const progressPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const byArea = AREAS.map((area) => ({
    area,
    items: entregables.filter((e) => e.area === area.id),
  })).filter((g) => g.items.length > 0);

  return (
    <Box p={40} maw={900} mx="auto">

      {/* Back */}
      <Link
        href="/admin"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#9ca3af", textDecoration: "none",
          marginBottom: 24,
        }}
      >
        <IconArrowLeft size={14} />
        Centro de Control
      </Link>

      {/* Header */}
      <Box mb={32}>
        <Group align="center" gap={12} mb={8}>
          <Title order={1} style={{ fontSize: "1.75rem", color: "#111827" }}>
            {startup.name}
          </Title>
          <Badge size="sm" color="gray" variant="light">
            {TYPE_LABELS[startup.type] ?? startup.type}
          </Badge>
          <Badge
            size="sm"
            variant="dot"
            styles={{
              root: {
                color: startup.status === "activa" ? "#16a34a" : "#d97706",
                borderColor: "transparent",
              },
            }}
          >
            {startup.status === "activa" ? "Activa" : startup.status}
          </Badge>
        </Group>

        <Group gap={20}>
          {founderProfile && (
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              Founder: <strong style={{ color: "#374151" }}>{founderProfile.full_name}</strong>
              {founderProfile.email && (
                <Text component="span" style={{ color: "#9ca3af" }}> · {founderProfile.email}</Text>
              )}
            </Text>
          )}
          {startup.sector && (
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              Sector: <strong style={{ color: "#374151" }}>{startup.sector}</strong>
            </Text>
          )}
          {startup.north_star_metric && (
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              North star: <strong style={{ color: "#374151" }}>{startup.north_star_metric}</strong>
              {" "}→ <strong style={{ color: currentPhase.color }}>{startup.north_star_value ?? "—"}</strong>
            </Text>
          )}
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
              const done = items.filter((i) => i.status === "done").length;
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
                      return (
                        <Box
                          key={item.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 10px", borderRadius: 8,
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <Icon size={14} color={s.color} style={{ flexShrink: 0 }} />
                          <Text style={{ fontSize: 13, color: "#374151", flex: 1 }} lineClamp={1}>
                            {item.title}
                          </Text>
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

    </Box>
  );
}
