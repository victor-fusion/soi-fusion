import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_MAP } from "@/constants/areas";
import type { Card, Entregable } from "@/types";
import Link from "next/link";
import {
  Box, Text, Title, Group, Badge, Paper, ThemeIcon, Stack,
} from "@mantine/core";
import {
  IconExternalLink, IconFileText, IconTool,
  IconRobot, IconChecklist, IconLink, IconBook2,
  IconArrowRight, IconLayoutGrid, IconCircleCheck,
  IconCircle, IconClock, IconTarget, IconBox,
  IconTrendingUp, IconCoin, IconScale, IconSettings, IconUsers,
} from "@tabler/icons-react";

const AREA_ICONS: Record<string, typeof IconTarget> = {
  estrategia: IconTarget,
  producto:   IconBox,
  growth:     IconTrendingUp,
  finanzas:   IconCoin,
  legal:      IconScale,
  operaciones: IconSettings,
  equipo:     IconUsers,
};

const CARD_TYPE_CONFIG: Record<string, { label: string; icon: typeof IconFileText; color: string }> = {
  playbook:      { label: "Playbook",    icon: IconBook2,     color: "#2563eb" },
  template:      { label: "Template",    icon: IconFileText,  color: "#7c3aed" },
  tool:          { label: "Herramienta", icon: IconTool,      color: "#d97706" },
  ai_tool:       { label: "IA",          icon: IconRobot,     color: "#ea580c" },
  checklist:     { label: "Checklist",   icon: IconChecklist, color: "#16a34a" },
  resource:      { label: "Recurso",     icon: IconBook2,     color: "#6b7280" },
  external_link: { label: "Enlace",      icon: IconLink,      color: "#0d9488" },
  agent:         { label: "Agente",      icon: IconRobot,     color: "#db2777" },
};

const EXTERNAL_TYPES = new Set(["tool", "ai_tool", "external_link", "agent"]);

const STATUS_CONFIG = {
  done:        { icon: IconCircleCheck, color: "#16a34a", label: "Completado" },
  in_progress: { icon: IconClock,       color: "#2563eb", label: "En progreso" },
  pending:     { icon: IconCircle,      color: "#d1d5db", label: "Pendiente" },
};

interface PageProps {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ section?: string }>;
}

export default async function RecursosAreaPage({ params, searchParams }: PageProps) {
  const { area: areaId } = await params;
  const { section: sectionId } = await searchParams;

  const area = AREA_MAP[areaId];
  if (!area) notFound();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Perfil + startup para cargar entregables del área
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, startups(*)")
    .eq("id", session.user.id)
    .single();

  const startup = profile?.startups as {
    id: string; name: string; current_phase: number;
  } | null;

  // Entregables de esta sección en la fase actual (solo cuando hay sección activa)
  let areaEntregables: Entregable[] = [];
  if (startup && sectionId) {
    const { data } = await supabase
      .from("entregables")
      .select("*")
      .eq("startup_id", startup.id)
      .eq("area", areaId)
      .eq("section", sectionId)
      .eq("phase", startup.current_phase)
      .order("status");
    areaEntregables = (data ?? []) as Entregable[];
  }

  const doneCnt = areaEntregables.filter((e) => e.status === "done").length;

  // Sin sección seleccionada → lista de secciones
  if (!sectionId) {
    return (
      <Box p={40} maw={900} mx="auto">
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
            Recursos · {area.name}
          </Text>
          <Group gap={10} align="center" mt={4}>
            {(() => { const Icon = AREA_ICONS[areaId] ?? IconBox; return <Icon size={24} color={area.color} />; })()}
            <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>
              {area.name}
            </Title>
          </Group>
        </Box>

        <Stack gap={8}>
          {area.sections.map((section) => (
            <Link
              key={section.id}
              href={`/dashboard/recursos/${areaId}?section=${section.id}`}
              style={{ textDecoration: "none" }}
            >
              <Box
                px={20} py={14}
                style={{
                  borderRadius: 12, border: "1px solid #f3f4f6",
                  backgroundColor: "#fff", display: "flex",
                  alignItems: "center", gap: 14,
                  transition: "border-color 0.15s", cursor: "pointer",
                }}
              >
                <Box
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    backgroundColor: `${area.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <IconLayoutGrid size={15} color={area.color} />
                </Box>
                <Text style={{ fontSize: 14, fontWeight: 500, color: "#374151", flex: 1 }}>
                  {section.name}
                </Text>
                <IconArrowRight size={14} color="#d1d5db" />
              </Box>
            </Link>
          ))}
        </Stack>
      </Box>
    );
  }

  // Con sección seleccionada → cargar tarjetas
  const section = area.sections.find((s) => s.id === sectionId);

  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("section_id", sectionId)
    .eq("is_active", true)
    .order("order");

  const cards = (data ?? []) as Card[];

  return (
    <Box p={40} maw={900} mx="auto">

      {/* Breadcrumb */}
      <Box mb={32}>
        <Group gap={6} mb={6}>
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>Recursos</Text>
          <Text style={{ fontSize: 13, color: "#d1d5db" }}>·</Text>
          <Link
            href={`/dashboard/recursos/${areaId}`}
            style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}
          >
            {area.name}
          </Link>
          <Text style={{ fontSize: 13, color: "#d1d5db" }}>·</Text>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>{section?.name}</Text>
        </Group>
        <Group gap={10} align="center">
          {(() => { const Icon = AREA_ICONS[areaId] ?? IconBox; return <Icon size={22} color={area.color} style={{ flexShrink: 0 }} />; })()}
          <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>
            {section?.name ?? sectionId}
          </Title>
        </Group>
      </Box>

      <Stack gap={28}>

        {/* Entregables del área — solo si existen */}
        {areaEntregables.length > 0 && (
          <Paper p={20} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
            <Group justify="space-between" mb={14}>
              <Group gap={8}>
                <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: area.color }} />
                <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  Entregables de {area.name}
                </Text>
              </Group>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                {doneCnt}/{areaEntregables.length} completados
              </Text>
            </Group>

            <Stack gap={6}>
              {areaEntregables.map((item) => {
                const s = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const Icon = s.icon;
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
                    <Badge
                      size="xs"
                      variant="light"
                      style={{ backgroundColor: `${s.color}18`, color: s.color, flexShrink: 0 }}
                    >
                      {s.label}
                    </Badge>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        )}

        {/* Recursos */}
        <Box>
          {cards.length > 0 && (
            <Group gap={8} mb={16}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Recursos</Text>
              <Badge size="xs" color="gray" variant="light">
                {cards.length} {cards.length === 1 ? "tarjeta" : "tarjetas"}
              </Badge>
            </Group>
          )}

          {cards.length === 0 ? (
            <Box
              p={48}
              style={{
                borderRadius: 16, border: "1px dashed #e5e7eb",
                backgroundColor: "#fafafa", textAlign: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                Próximamente — recursos en preparación para esta sección.
              </Text>
            </Box>
          ) : (
            <Stack gap={8}>
              {cards.map((card) => {
                const typeConfig = CARD_TYPE_CONFIG[card.type] ?? CARD_TYPE_CONFIG.resource;
                const Icon = typeConfig.icon;
                const isExternal = EXTERNAL_TYPES.has(card.type) || !!card.url;

                const cardContent = (
                  <Paper
                    p={16} radius="lg" withBorder
                    style={{
                      borderColor: "#f3f4f6", display: "flex",
                      alignItems: "flex-start", gap: 14,
                      cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <ThemeIcon
                      size={36} radius="lg" variant="light"
                      style={{ backgroundColor: `${typeConfig.color}12`, color: typeConfig.color, flexShrink: 0 }}
                    >
                      <Icon size={17} />
                    </ThemeIcon>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap={8} mb={4}>
                        <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                          {card.title}
                        </Text>
                        <Badge
                          size="xs" variant="light"
                          style={{ backgroundColor: `${typeConfig.color}12`, color: typeConfig.color }}
                        >
                          {typeConfig.label}
                        </Badge>
                      </Group>
                      {card.description && (
                        <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }} lineClamp={2}>
                          {card.description}
                        </Text>
                      )}
                    </Box>

                    {isExternal
                      ? <IconExternalLink size={14} color="#d1d5db" style={{ flexShrink: 0, marginTop: 2 }} />
                      : <IconArrowRight size={14} color="#d1d5db" style={{ flexShrink: 0, marginTop: 2 }} />
                    }
                  </Paper>
                );

                if (isExternal && card.url) {
                  return (
                    <a key={card.id} href={card.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      {cardContent}
                    </a>
                  );
                }

                return (
                  <Link key={card.id} href={`/dashboard/recursos/${areaId}/${card.id}`} style={{ textDecoration: "none" }}>
                    {cardContent}
                  </Link>
                );
              })}
            </Stack>
          )}
        </Box>

      </Stack>
    </Box>
  );
}
