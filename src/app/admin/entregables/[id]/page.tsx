import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAreas } from "@/lib/data/areas";
import { getPhases } from "@/lib/data/phases";
import Link from "next/link";
import { Box, Text, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import type { EntregableTemplate } from "@/types";
import { EntregableEditClient } from "./_components/EntregableEditClient";

export default async function EntregableEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data } = await supabase
    .from("entregable_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const template = data as EntregableTemplate;
  const [areas, phases] = await Promise.all([getAreas(), getPhases()]);

  return (
    <Box p={40} maw={900} mx="auto">
      <Box mb={32}>
        <Link
          href="/admin/entregables"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 12 }}
        >
          <IconChevronLeft size={14} />
          Entregables
        </Link>
        <Group align="center" gap={10} mt={4}>
          <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>{template.title}</Text>
        </Group>
        <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Editar entregable maestro</Text>
      </Box>

      <Box p={32} style={{ border: "1px solid #f3f4f6", borderRadius: 12, backgroundColor: "#fafafa" }}>
        <EntregableEditClient template={template} areas={areas} phases={phases} />
      </Box>
    </Box>
  );
}
