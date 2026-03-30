"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Startup } from "@/types";
import { AREAS } from "@/constants/areas";
import {
  Text,
  Group,
  Box,
  Avatar,
  UnstyledButton,
  ScrollArea,
  Tooltip,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconMap,
  IconBook2,
  IconUsers,
  IconRobot,
  IconLogout,
  IconChevronRight,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel del Ciclo", icon: IconLayoutDashboard, exact: true },
  { href: "/dashboard/roadmap", label: "El Camino", icon: IconMap },
  { href: "/dashboard/arsenal", label: "El Arsenal", icon: IconBook2 },
  { href: "/dashboard/crm", label: "CRM", icon: IconUsers },
  { href: "/dashboard/agente", label: "Agente SDR", icon: IconRobot, badge: "IA" },
];

interface SidebarProps {
  profile: Profile;
  startup: Startup | null;
}

export function Sidebar({ profile, startup }: SidebarProps) {
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
          SOI · Ciclo 5
        </Text>
      </Box>

      {/* Startup */}
      {startup && (
        <Box px={12} pb={12}>
          <Box
            p={12}
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              border: "1px solid #f3f4f6",
            }}
          >
            <Text style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tu startup
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginTop: 2 }} truncate>
              {startup.name}
            </Text>
            <Group gap={6} mt={4}>
              <Box
                style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#16a34a", flexShrink: 0 }}
              />
              <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                Fase {startup.current_phase} de 6
              </Text>
            </Group>
          </Box>
        </Box>
      )}

      <ScrollArea flex={1} px={12}>

        {/* Nav principal */}
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
                {item.badge && (
                  <Box
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 4,
                      backgroundColor: "#fff7ed",
                      color: "#ea580c",
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
                {active && <IconChevronRight size={12} color="#16a34a" />}
              </UnstyledButton>
            );
          })}
        </Box>

        {/* 7 Áreas */}
        <Box pt={8} style={{ borderTop: "1px solid #f3f4f6" }}>
          <Text
            px={10}
            mb={6}
            style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            7 Áreas
          </Text>
          {AREAS.map((area) => {
            const active = pathname === `/dashboard/arsenal/${area.id}`;
            return (
              <UnstyledButton
                key={area.id}
                component={Link}
                href={`/dashboard/arsenal/${area.id}`}
                w="100%"
                px={10}
                py={7}
                mb={1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  backgroundColor: active ? "#fff" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                <Box
                  style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }}
                />
                <Text style={{ fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? "#111827" : "#6b7280" }}>
                  {area.name}
                </Text>
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
              <Text style={{ fontSize: "11px", color: "#9ca3af" }}>
                {profile.role === "admin" ? "Admin" : "Founder"}
              </Text>
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
