"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Startup, Area } from "@/types";
import {
  Text, Box, Avatar, UnstyledButton, ScrollArea, Tooltip, Group,
} from "@mantine/core";
import {
  IconLayoutDashboard, IconLogout, IconChevronRight,
  IconChevronDown, IconSearch, IconTarget, IconBox,
  IconTrendingUp, IconCoin, IconScale, IconSettings, IconUsers,
} from "@tabler/icons-react";

const AREA_ICONS: Record<string, typeof IconTarget> = {
  estrategia:  IconTarget,
  producto:    IconBox,
  growth:      IconTrendingUp,
  finanzas:    IconCoin,
  legal:       IconScale,
  operaciones: IconSettings,
  equipo:      IconUsers,
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel del Ciclo", icon: IconLayoutDashboard, exact: true },
];

// ─── Componente interno que usa useSearchParams ───────────────
// Necesita estar separado para que Suspense funcione correctamente

interface AreasAccordionProps {
  expandedArea: string | null;
  setExpandedArea: (id: string | null) => void;
  pathname: string;
  isSearching: boolean;
  visibleAreas: Area[];
}

function AreasAccordion({
  expandedArea,
  setExpandedArea,
  pathname,
  isSearching,
  visibleAreas,
}: AreasAccordionProps) {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section");

  return (
    <>
      {visibleAreas.map((area) => {
        const isAreaActive = pathname.startsWith(`/dashboard/recursos/${area.id}`);
        const isExpanded = isSearching || expandedArea === area.id;

        return (
          <Box key={area.id} mb={2}>
            <UnstyledButton
              w="100%"
              px={10}
              py={7}
              onClick={() => {
                if (!isSearching) {
                  setExpandedArea(isExpanded ? null : area.id);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 8,
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            >
              {(() => { const Icon = AREA_ICONS[area.id] ?? IconBox; return <Icon size={15} color={area.color} style={{ flexShrink: 0 }} />; })()}
              <Text
                style={{
                  fontSize: "13px",
                  fontWeight: isAreaActive ? 700 : 500,
                  color: isAreaActive ? "#111827" : "#374151",
                  flex: 1,
                }}
              >
                {area.name}
              </Text>
              <IconChevronDown
                size={13}
                color="#9ca3af"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s",
                  flexShrink: 0,
                }}
              />
            </UnstyledButton>

            {isExpanded && (
              <Box pl={28} pb={4}>
                {area.sections.map((section) => {
                  const isSectionActive =
                    isAreaActive &&
                    pathname === `/dashboard/recursos/${area.id}` &&
                    activeSection === section.id;

                  return (
                    <UnstyledButton
                      key={section.id}
                      component={Link}
                      href={`/dashboard/recursos/${area.id}?section=${section.id}`}
                      w="100%"
                      px={10}
                      py={5}
                      style={{ display: "block", borderRadius: 6, textDecoration: "none" }}
                    >
                      <Text
                        style={{
                          fontSize: "13px",
                          color: isSectionActive ? "#111827" : "#9ca3af",
                          fontWeight: isSectionActive ? 600 : 400,
                        }}
                      >
                        {section.name}
                      </Text>
                    </UnstyledButton>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}

// ─── Sidebar principal ────────────────────────────────────────

interface SidebarProps {
  profile: Profile;
  startup: Startup | null;
  areas: Area[];
}

export function Sidebar({ profile, startup, areas }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  useEffect(() => {
    const match = pathname.match(/\/dashboard\/recursos\/([^/?]+)/);
    if (match?.[1]) setExpandedArea(match[1]);
  }, [pathname]);

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

  const searchTerm = search.trim().toLowerCase();

  const visibleAreas = searchTerm
    ? areas.map((area) => ({
        ...area,
        sections: area.sections.filter(
          (s) =>
            s.name.toLowerCase().includes(searchTerm) ||
            area.name.toLowerCase().includes(searchTerm)
        ),
      })).filter((a) => a.sections.length > 0)
    : areas;

  const isSearching = searchTerm.length > 0;

  const initials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase() || "?";

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
      <Box px={20} py={18}>
        <Text style={{ fontSize: "16px", color: "#111827" }}>
          <Text component="span" style={{ fontWeight: 800 }}>SOI</Text>
          {" "}
          <Text component="span" style={{ fontWeight: 400 }}>Fusión</Text>
        </Text>
      </Box>

      <ScrollArea flex={1} px={12}>

        {/* Panel del Ciclo */}
        <Box mb={12}>
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

        {/* Buscador */}
        <Box mb={16} style={{ position: "relative" }}>
          <IconSearch
            size={13}
            color="#9ca3af"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar secciones..."
            style={{
              width: "100%",
              padding: "7px 10px 7px 30px",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid #f3f4f6",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </Box>

        {/* Áreas */}
        <Box>
          <Text
            px={10}
            mb={6}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#9ca3af",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Áreas
          </Text>

          <Suspense fallback={null}>
            <AreasAccordion
              expandedArea={expandedArea}
              setExpandedArea={setExpandedArea}
              pathname={pathname}
              isSearching={isSearching}
              visibleAreas={visibleAreas}
            />
          </Suspense>
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
            <Avatar
              radius="xl"
              size={32}
              style={{
                backgroundColor: "#e5e7eb",
                color: "#374151",
                fontSize: "12px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Text style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }} truncate maw={130}>
                {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
              </Text>
              <Text style={{ fontSize: "11px", color: "#9ca3af" }} truncate maw={130}>
                {startup?.name ?? (profile.role === "admin" ? "Admin" : "Fusión")}
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
