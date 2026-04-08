import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Box, Text, Group, Avatar, Badge, Paper } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Profile } from "@/types";
import { MemberEditClient } from "./_components/MemberEditClient";

const TYPE_LABELS: Record<string, string> = {
  cofundador:  "Cofundador",
  empleado:    "Empleado",
  advisor:     "Advisor",
  becario:     "Becario",
  contratista: "Contratista",
};

const TYPE_COLORS: Record<string, string> = {
  cofundador:  "#2563eb",
  empleado:    "#16a34a",
  advisor:     "#7c3aed",
  becario:     "#ea580c",
  contratista: "#d97706",
};

export default async function MiembroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: memberData } = await supabase
    .from("profiles")
    .select("*, startups(id, name, batch)")
    .eq("id", id)
    .single();

  if (!memberData) notFound();

  const member = memberData as Profile & {
    startups: { id: string; name: string; batch: number } | null;
  };

  // Startups disponibles para el selector
  const { data: startupsData } = await supabase
    .from("startups")
    .select("id, name, batch")
    .order("name");
  const startups = (startupsData ?? []) as { id: string; name: string; batch: number }[];

  const typeColor = member.member_type ? (TYPE_COLORS[member.member_type] ?? "#9ca3af") : "#9ca3af";
  const initials = member.full_name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Box p={40} maw={800} mx="auto">
      {/* Back */}
      <Link
        href="/admin/miembros"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 24 }}
      >
        <IconArrowLeft size={14} />
        Miembros
      </Link>

      {/* Header */}
      <Group gap={16} mb={32} align="flex-start">
        <Avatar
          size={56} radius="xl"
          style={{ backgroundColor: `${typeColor}18`, color: typeColor, fontSize: 20, fontWeight: 700, flexShrink: 0 }}
        >
          {initials}
        </Avatar>
        <Box>
          <Text style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{member.full_name}</Text>
          <Group gap={8} mt={4}>
            {member.member_type && (
              <Badge size="sm" variant="light" styles={{ root: { backgroundColor: `${typeColor}15`, color: typeColor } }}>
                {TYPE_LABELS[member.member_type] ?? member.member_type}
              </Badge>
            )}
            {member.role_title && (
              <Text style={{ fontSize: 13, color: "#6b7280" }}>{member.role_title}</Text>
            )}
            {(member as Profile & { startups: { id: string; name: string; batch: number } | null }).startups && (
              <Link
                href={`/admin/startups/${(member as Profile & { startups: { id: string; name: string; batch: number } | null }).startups!.id}`}
                style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}
              >
                {(member as Profile & { startups: { id: string; name: string; batch: number } | null }).startups!.name}
              </Link>
            )}
          </Group>
          <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{member.email}</Text>
        </Box>
      </Group>

      {/* Formulario de edición */}
      <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6" }}>
        <Box px={28} py={20} style={{ borderBottom: "1px solid #f3f4f6" }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Datos del miembro</Text>
        </Box>
        <Box p={28}>
          <MemberEditClient member={member} startups={startups} />
        </Box>
      </Paper>
    </Box>
  );
}
