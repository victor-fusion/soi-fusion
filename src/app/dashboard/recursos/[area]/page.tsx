import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_MAP } from "@/constants/areas";
import type { Card } from "@/types";
import Link from "next/link";
import {
  Box, Text, Title, Group, Stack, Badge, Paper, ThemeIcon,
} from "@mantine/core";
import {
  IconExternalLink, IconFileText, IconTool,
  IconRobot, IconChecklist, IconLink, IconBook2,
  IconArrowRight,
} from "@tabler/icons-react";

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

interface PageProps {
  params: Promise<{ area: string }>;
}

export default async function ArsenalAreaPage({ params }: PageProps) {
  const { area: areaId } = await params;

  const area = AREA_MAP[areaId];
  if (!area) notFound();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Cargar tarjetas de todas las secciones de esta área
  const sectionIds = area.sections.map((s) => s.id);
  const { data } = sectionIds.length > 0
    ? await supabase
        .from("cards")
        .select("*")
        .in("section_id", sectionIds)
        .eq("is_active", true)
        .order("order")
    : { data: [] };

  const cards = (data ?? []) as Card[];

  const cardsBySection = area.sections.map((section) => ({
    section,
    cards: cards.filter((c) => c.section_id === section.id),
  }));

  const totalCards = cards.length;

  return (
    <Box p={40} maw={900} mx="auto">

      {/* Header */}
      <Box mb={40}>
        <Group gap={8} mb={6}>
          <Text
            component={Link}
            href="/dashboard/recursos"
            style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}
          >
            Recursos
          </Text>
          <Text style={{ fontSize: 13, color: "#d1d5db" }}>·</Text>
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>{area.name}</Text>
        </Group>
        <Group gap={12} align="center">
          <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />
          <Title order={1} style={{ fontSize: "2rem", color: "#111827" }}>
            {area.name}
          </Title>
          {totalCards > 0 && (
            <Badge size="sm" variant="light" style={{ backgroundColor: `${area.color}15`, color: area.color }}>
              {totalCards} {totalCards === 1 ? "recurso" : "recursos"}
            </Badge>
          )}
        </Group>
      </Box>

      {/* Secciones */}
      <Stack gap={32}>
        {cardsBySection.map(({ section, cards: sectionCards }) => (
          <Box key={section.id}>
            {/* Título sección */}
            <Group gap={10} mb={16} pb={12} style={{ borderBottom: `2px solid ${area.color}20` }}>
              <Text style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {section.name}
              </Text>
              {sectionCards.length > 0 && (
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                  {sectionCards.length} {sectionCards.length === 1 ? "tarjeta" : "tarjetas"}
                </Text>
              )}
            </Group>

            {/* Tarjetas */}
            {sectionCards.length === 0 ? (
              <Box
                px={16}
                py={12}
                style={{
                  borderRadius: 10,
                  border: "1px dashed #e5e7eb",
                  backgroundColor: "#fafafa",
                }}
              >
                <Text style={{ fontSize: 13, color: "#d1d5db" }}>
                  Próximamente — recursos en preparación
                </Text>
              </Box>
            ) : (
              <Stack gap={8}>
                {sectionCards.map((card) => {
                  const typeConfig = CARD_TYPE_CONFIG[card.type] ?? CARD_TYPE_CONFIG.resource;
                  const Icon = typeConfig.icon;
                  const isExternal = EXTERNAL_TYPES.has(card.type) || !!card.url;

                  const cardContent = (
                    <Paper
                      p={16}
                      radius="lg"
                      withBorder
                      style={{
                        borderColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                    >
                      <ThemeIcon
                        size={36}
                        radius="lg"
                        variant="light"
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
                            size="xs"
                            variant="light"
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
        ))}
      </Stack>
    </Box>
  );
}
