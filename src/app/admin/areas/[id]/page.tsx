import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Box, Text, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { AreaDetailClient } from "./_components/AreaDetailClient";

export default async function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: area } = await supabase
    .from("areas")
    .select("id, name, color, sort_order")
    .eq("id", id)
    .single();

  if (!area) notFound();

  const { data: sectionsData } = await supabase
    .from("area_sections")
    .select("id, area_id, name, sort_order")
    .eq("area_id", id)
    .order("sort_order");

  const sections = sectionsData ?? [];

  return (
    <Box p={40} maw={900} mx="auto">
      <Box mb={32}>
        <Link href="/admin/areas" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 12 }}>
          <IconChevronLeft size={14} />
          Áreas
        </Link>
        <Group align="center" gap={10} mt={4}>
          <Box style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: area.color }} />
          <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>{area.name}</Text>
        </Group>
      </Box>

      <AreaDetailClient area={area} sections={sections} />
    </Box>
  );
}
