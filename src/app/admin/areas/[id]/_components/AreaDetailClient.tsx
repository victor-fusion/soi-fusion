"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Group, Paper, Stack } from "@mantine/core";
import { IconPlus, IconPencil } from "@tabler/icons-react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { AreaForm } from "../../_components/AreaForm";
import { SectionForm } from "../../_components/SectionForm";

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
}

interface AreaDetailClientProps {
  area: AreaRecord;
  sections: Section[];
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block",
};

export function AreaDetailClient({ area, sections }: AreaDetailClientProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"area" | "section">("area");
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const openEditArea = () => {
    setDrawerMode("area");
    setDrawerOpen(true);
  };

  const openNewSection = () => {
    setEditingSection(null);
    setDrawerMode("section");
    setDrawerOpen(true);
  };

  const openEditSection = (s: Section) => {
    setEditingSection(s);
    setDrawerMode("section");
    setDrawerOpen(true);
  };

  const close = () => {
    setDrawerOpen(false);
    setEditingSection(null);
  };

  const drawerTitle = drawerMode === "area" ? "Editar área" : (editingSection ? "Editar sección" : "Nueva sección");
  const drawerSubtitle = drawerMode === "area" ? area.name : (editingSection ? editingSection.name : area.name);

  return (
    <>
      {/* Sección editar área */}
      <Box mb={32} p={24} style={{ borderRadius: 12, border: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
        <Group justify="space-between" mb={16}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Datos del área</Text>
          <button
            onClick={openEditArea}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#6b7280", background: "none", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}
          >
            <IconPencil size={13} />
            Editar
          </button>
        </Group>
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Box>
            <span style={labelStyle}>Nombre</span>
            <Text style={{ fontSize: 14, color: "#374151" }}>{area.name}</Text>
          </Box>
          <Box>
            <span style={labelStyle}>Color</span>
            <Group gap={8}>
              <Box style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: area.color }} />
              <Text style={{ fontSize: 13, color: "#9ca3af", fontFamily: "monospace" }}>{area.color}</Text>
            </Group>
          </Box>
          <Box>
            <span style={labelStyle}>ID (slug)</span>
            <Text style={{ fontSize: 13, color: "#9ca3af", fontFamily: "monospace" }}>{area.id}</Text>
          </Box>
        </Box>
      </Box>

      {/* Secciones */}
      <Box>
        <Group justify="space-between" mb={16}>
          <Box>
            <Text style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Secciones</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{sections.length} secciones en este área</Text>
          </Box>
          <button
            onClick={openNewSection}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <IconPlus size={15} />
            Nueva sección
          </button>
        </Group>

        <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
          <Box
            px={20} py={11}
            style={{
              display: "grid", gridTemplateColumns: "1fr 150px 32px",
              gap: 12, alignItems: "center",
              backgroundColor: "#fafafa", borderBottom: "1px solid #f3f4f6",
            }}
          >
            {["Sección", "ID", ""].map((h) => (
              <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </Text>
            ))}
          </Box>

          {sections.length === 0 ? (
            <Box px={20} py={32} style={{ textAlign: "center" }}>
              <Text style={{ fontSize: 13, color: "#d1d5db" }}>No hay secciones —{" "}
                <button onClick={openNewSection} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
                  añade la primera
                </button>
              </Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {sections.map((s, i) => (
                <Box
                  key={`${s.id}-${s.area_id}`}
                  px={20} py={13}
                  onClick={() => openEditSection(s)}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 150px 32px",
                    gap: 12, alignItems: "center",
                    borderBottom: i === sections.length - 1 ? "none" : "1px solid #f9fafb",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <Text style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{s.name}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{s.id}</Text>
                  <Box style={{ display: "flex", justifyContent: "center", color: "#d1d5db" }}>
                    <IconPencil size={13} />
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      <SlideDrawer open={drawerOpen} onClose={close} title={drawerTitle} subtitle={drawerSubtitle}>
        {drawerOpen && drawerMode === "area" && (
          <AreaForm area={area} onClose={close} onAfterDelete={() => router.push("/admin/areas")} />
        )}
        {drawerOpen && drawerMode === "section" && (
          <SectionForm
            section={editingSection ?? undefined}
            areaId={area.id}
            areaName={area.name}
            onClose={close}
          />
        )}
      </SlideDrawer>
    </>
  );
}
