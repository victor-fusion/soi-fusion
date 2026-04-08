import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAreas } from "@/lib/data/areas";
import Link from "next/link";
import { Box, Text, Group, Badge } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import type { Card } from "@/types";
import { RecursoEditClient } from "./_components/RecursoEditClient";

const TYPE_LABELS: Record<string, string> = {
  playbook:      "Playbook",
  template:      "Plantilla",
  tool:          "Herramienta",
  ai_tool:       "Herramienta IA",
  checklist:     "Checklist",
  resource:      "Recurso",
  external_link: "Enlace externo",
  agent:         "Agente IA",
};

const TYPE_COLORS: Record<string, string> = {
  playbook:      "#2563eb",
  template:      "#7c3aed",
  tool:          "#d97706",
  ai_tool:       "#ea580c",
  checklist:     "#16a34a",
  resource:      "#0d9488",
  external_link: "#6b7280",
  agent:         "#db2777",
};

export default async function RecursoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const card = data as Card;
  const areas = await getAreas();

  // Resolver area_id desde section_id
  let areaId = "";
  for (const area of areas) {
    if (area.sections.some((s) => s.id === card.section_id)) {
      areaId = area.id;
      break;
    }
  }

  const cardWithArea = { ...card, area_id: areaId };
  const typeColor = TYPE_COLORS[card.type] ?? "#9ca3af";

  return (
    <Box p={40} maw={900} mx="auto">
      <Box mb={32}>
        <Link
          href="/admin/recursos"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 12 }}
        >
          <IconChevronLeft size={14} />
          Recursos
        </Link>
        <Group align="center" gap={10} mt={4}>
          <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>{card.title}</Text>
          <Badge
            size="sm" variant="light"
            styles={{ root: { backgroundColor: `${typeColor}15`, color: typeColor } }}
          >
            {TYPE_LABELS[card.type] ?? card.type}
          </Badge>
        </Group>
        <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Editar recurso</Text>
      </Box>

      <Box p={32} style={{ border: "1px solid #f3f4f6", borderRadius: 12, backgroundColor: "#fafafa" }}>
        <RecursoEditClient card={cardWithArea} areas={areas} />
      </Box>
    </Box>
  );
}
