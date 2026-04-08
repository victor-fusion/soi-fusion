"use client";

import { useState } from "react";
import { Box, Text, Group, Paper, Stack, Badge } from "@mantine/core";
import { IconPlus, IconChevronDown, IconChevronRight, IconPencil } from "@tabler/icons-react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { AreaForm } from "./AreaForm";
import { SectionForm } from "./SectionForm";

interface Section {
  id: string;
  area_id: string;
  name: string;
  sort_order: number;
}

interface AreaRecord {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  sections: Section[];
}

interface AreasClientProps {
  areas: AreaRecord[];
}

export function AreasClient({ areas }: AreasClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"area" | "section">("area");
  const [editingArea, setEditingArea] = useState<AreaRecord | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionAreaId, setSectionAreaId] = useState<string>("");
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set(areas.map((a) => a.id)));

  const openNewArea = () => {
    setEditingArea(null);
    setDrawerMode("area");
    setDrawerOpen(true);
  };

  const openEditArea = (a: AreaRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArea(a);
    setDrawerMode("area");
    setDrawerOpen(true);
  };

  const openNewSection = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSection(null);
    setSectionAreaId(areaId);
    setDrawerMode("section");
    setDrawerOpen(true);
  };

  const openEditSection = (s: Section, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSection(s);
    setSectionAreaId(s.area_id);
    setDrawerMode("section");
    setDrawerOpen(true);
  };

  const close = () => {
    setDrawerOpen(false);
    setEditingArea(null);
    setEditingSection(null);
  };

  const toggleExpand = (areaId: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  const drawerTitle = drawerMode === "area"
    ? (editingArea ? "Editar área" : "Nueva área")
    : (editingSection ? "Editar sección" : "Nueva sección");

  const drawerSubtitle = drawerMode === "area"
    ? (editingArea ? editingArea.name : undefined)
    : (editingSection ? editingSection.name : areas.find((a) => a.id === sectionAreaId)?.name);

  return (
    <>
      <Box p={40} maw={900} mx="auto">
        {/* Header */}
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
          <Group justify="space-between" align="center" mt={4}>
            <Box>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Áreas</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {areas.length} áreas · {areas.reduce((acc, a) => acc + a.sections.length, 0)} secciones
              </Text>
            </Box>
            <button
              onClick={openNewArea}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <IconPlus size={15} />
              Nueva área
            </button>
          </Group>
        </Box>

        {/* Lista */}
        <Stack gap={12}>
          {areas.map((area) => {
            const expanded = expandedAreas.has(area.id);
            return (
              <Paper key={area.id} p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
                {/* Cabecera de área */}
                <Box
                  px={20} py={16}
                  onClick={() => toggleExpand(area.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", backgroundColor: "#fafafa" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                >
                  <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />
                  <Text style={{ fontSize: 15, fontWeight: 600, color: "#111827", flex: 1 }}>{area.name}</Text>
                  <Badge size="xs" variant="light" color="gray">{area.sections.length} secciones</Badge>
                  <button
                    onClick={(e) => openEditArea(area, e)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}
                  >
                    <IconPencil size={14} />
                  </button>
                  {expanded ? <IconChevronDown size={14} color="#9ca3af" /> : <IconChevronRight size={14} color="#9ca3af" />}
                </Box>

                {/* Secciones */}
                {expanded && (
                  <Box>
                    {area.sections.map((s, i) => (
                      <Box
                        key={s.id}
                        px={20} py={12}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
                        <Box style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0, marginLeft: 4 }} />
                        <Text style={{ fontSize: 13, color: "#374151", flex: 1 }}>{s.name}</Text>
                        <Text style={{ fontSize: 11, color: "#d1d5db" }}>{s.id}</Text>
                        <button
                          onClick={(e) => openEditSection(s, e)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", display: "flex", padding: 4 }}
                        >
                          <IconPencil size={13} />
                        </button>
                      </Box>
                    ))}
                    {/* Añadir sección */}
                    <Box
                      px={20} py={10}
                      style={{ borderTop: "1px solid #f3f4f6" }}
                    >
                      <button
                        onClick={(e) => openNewSection(area.id, e)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 12, padding: 0 }}
                      >
                        <IconPlus size={12} />
                        Añadir sección
                      </button>
                    </Box>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      </Box>

      <SlideDrawer open={drawerOpen} onClose={close} title={drawerTitle} subtitle={drawerSubtitle}>
        {drawerOpen && drawerMode === "area" && (
          <AreaForm area={editingArea ?? undefined} onClose={close} />
        )}
        {drawerOpen && drawerMode === "section" && (
          <SectionForm
            section={editingSection ?? undefined}
            areaId={sectionAreaId}
            onClose={close}
          />
        )}
      </SlideDrawer>
    </>
  );
}
