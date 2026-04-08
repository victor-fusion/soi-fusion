"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import {
  Text, Box, Avatar, UnstyledButton, ScrollArea, Tooltip, Group,
} from "@mantine/core";
import {
  IconLayoutDashboard, IconLogout, IconChevronRight,
  IconUsers, IconRobot, IconSettings, IconUsersGroup,
  IconCheckbox, IconLayoutGrid,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Centro de Control", icon: IconLayoutDashboard, exact: true },
  { href: "/admin/startups", label: "Startups", icon: IconUsers },
  { href: "/admin/miembros", label: "Miembros", icon: IconUsersGroup },
  { href: "/admin/entregables", label: "Entregables", icon: IconCheckbox },
  { href: "/admin/recursos", label: "Recursos", icon: IconLayoutGrid },
];

const NAV_BOTTOM: { href: string; label: string; icon: typeof IconRobot; badge?: string; exact?: boolean }[] = [
  { href: "/admin/agente", label: "Agente SDR", icon: IconRobot, badge: "IA" },
  { href: "/admin/config", label: "Configuración", icon: IconSettings },
];

interface AdminSidebarProps {
  profile: Profile;
  startupCount: number;
}

export function AdminSidebar({ profile, startupCount }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Box
      style={{
        width: 256,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #f3f4f6",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Logo */}
      <Box px={20} py={20}>
        <Text style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#16a34a" }}>
          Fusión Startups
        </Text>
        <Text style={{ fontSize: "12px", color: "#9ca3af", marginTop: 2 }}>
          Admin · Ciclo 5
        </Text>
      </Box>

      {/* Stats rápidas */}
      <Box px={12} pb={12}>
        <Box
          p={12}
          style={{ backgroundColor: "#fff", borderRadius: 10, border: "1px solid #f3f4f6" }}
        >
          <Text style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ciclo activo
          </Text>
          <Text style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginTop: 2 }}>
            {startupCount} startups
          </Text>
          <Group gap={6} mt={4}>
            <Box style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#16a34a", flexShrink: 0 }} />
            <Text style={{ fontSize: "12px", color: "#6b7280" }}>En progreso</Text>
          </Group>
        </Box>
      </Box>

      <ScrollArea flex={1} px={12}>
        <Box mb={8}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <UnstyledButton
                key={item.href}
                component={Link}
                href={item.href}
                w="100%"
                px={10}
                py={8}
                mb={2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 8,
                  backgroundColor: active ? "#fff" : "transparent",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  border: active ? "1px solid #f3f4f6" : "1px solid transparent",
                  transition: "all 0.15s",
                  textDecoration: "none",
                  color: active ? "#111827" : "#6b7280",
                }}
              >
                <Icon size={16} color={active ? "#16a34a" : "#9ca3af"} />
                <Text style={{ fontSize: "14px", fontWeight: active ? 600 : 500, flex: 1, color: "inherit" }}>
                  {item.label}
                </Text>
                {active && <IconChevronRight size={12} color="#16a34a" />}
              </UnstyledButton>
            );
          })}
        </Box>

        <Box mb={8} pt={8} style={{ borderTop: "1px solid #f3f4f6" }}>
          {NAV_BOTTOM.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <UnstyledButton
                key={item.href}
                component={Link}
                href={item.href}
                w="100%"
                px={10}
                py={8}
                mb={2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 8,
                  backgroundColor: active ? "#fff" : "transparent",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  border: active ? "1px solid #f3f4f6" : "1px solid transparent",
                  transition: "all 0.15s",
                  textDecoration: "none",
                  color: active ? "#111827" : "#6b7280",
                }}
              >
                <Icon size={16} color={active ? "#16a34a" : "#9ca3af"} />
                <Text style={{ fontSize: "14px", fontWeight: active ? 600 : 500, flex: 1, color: "inherit" }}>
                  {item.label}
                </Text>
                {item.badge && (
                  <Box style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: 4, backgroundColor: "#fff7ed", color: "#ea580c" }}>
                    {item.badge}
                  </Box>
                )}
                {active && <IconChevronRight size={12} color="#16a34a" />}
              </UnstyledButton>
            );
          })}
        </Box>

      </ScrollArea>

      {/* User */}
      <Box px={12} py={12} style={{ borderTop: "1px solid #f3f4f6" }}>
        <UnstyledButton
          w="100%"
          px={10}
          py={8}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 8,
            transition: "background 0.15s",
          }}
          onClick={handleLogout}
        >
          <Group gap={10}>
            <Avatar color="green" radius="xl" size={28} style={{ fontSize: "12px" }}>
              {profile.full_name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Text style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }} truncate maw={130}>
                {profile.full_name}
              </Text>
              <Text style={{ fontSize: "11px", color: "#9ca3af" }}>Admin</Text>
            </Box>
          </Group>
          <Tooltip label="Cerrar sesión" position="right">
            <IconLogout size={15} color="#d1d5db" />
          </Tooltip>
        </UnstyledButton>
      </Box>
    </Box>
  );
}
