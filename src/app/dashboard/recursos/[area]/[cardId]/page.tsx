import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_MAP } from "@/constants/areas";
import type { Card } from "@/types";
import Link from "next/link";
import {
  Box, Text, Title, Group, ThemeIcon,
} from "@mantine/core";
import {
  IconArrowLeft, IconFileText, IconTool,
  IconRobot, IconChecklist, IconLink, IconBook2,
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

interface PageProps {
  params: Promise<{ area: string; cardId: string }>;
}

export default async function CardPage({ params }: PageProps) {
  const { area: areaId, cardId } = await params;

  const area = AREA_MAP[areaId];
  if (!area) notFound();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (!data) notFound();
  const card = data as Card;

  const typeConfig = CARD_TYPE_CONFIG[card.type] ?? CARD_TYPE_CONFIG.resource;
  const Icon = typeConfig.icon;

  // Encontrar la sección a la que pertenece
  const section = area.sections.find((s) => s.id === card.section_id);

  return (
    <Box p={40} maw={760} mx="auto">

      {/* Breadcrumb + volver */}
      <Box mb={40}>
        <Group gap={8} mb={16}>
          <Link
            href={`/dashboard/recursos/${areaId}`}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "#6b7280", textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <IconArrowLeft size={14} />
            {area.name}
            {section && <> · {section.name}</>}
          </Link>
        </Group>

        <Group gap={12} align="flex-start">
          <ThemeIcon
            size={44}
            radius="lg"
            variant="light"
            style={{ backgroundColor: `${typeConfig.color}12`, color: typeConfig.color, flexShrink: 0 }}
          >
            <Icon size={20} />
          </ThemeIcon>
          <Box>
            <Group gap={8} mb={4}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: typeConfig.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {typeConfig.label}
              </Text>
            </Group>
            <Title order={1} style={{ fontSize: "1.75rem", color: "#111827", lineHeight: 1.2 }}>
              {card.title}
            </Title>
            {card.description && (
              <Text mt={8} style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6, maxWidth: 600 }}>
                {card.description}
              </Text>
            )}
          </Box>
        </Group>
      </Box>

      {/* Contenido */}
      <Box
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "#374151",
        }}
      >
        {card.content ? (
          <Box
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
          >
            {card.content}
          </Box>
        ) : (
          <Box
            p={32}
            style={{
              borderRadius: 12,
              border: "1px dashed #e5e7eb",
              backgroundColor: "#fafafa",
              textAlign: "center",
            }}
          >
            <Text style={{ color: "#9ca3af" }}>Contenido en preparación.</Text>
          </Box>
        )}
      </Box>

    </Box>
  );
}
