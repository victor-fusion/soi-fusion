"use client";

import { useState } from "react";
import { Box, Text, Group, Paper, Stack } from "@mantine/core";
import { IconPlus, IconFolder } from "@tabler/icons-react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { SeccionForm } from "./SeccionForm";

type Area = { id: string; name: string; color: string; sort_order: number };
type Section = { id: string; area_id: string; name: string; sort_order: number };

interface SeccionesClientProps {
  areas: Area[];
  sections: Section[];
}

interface EditTarget {
  section: Section;
  areaId: string;
}

export function SeccionesClient({ areas, sections }: SeccionesClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [newAreaId, setNewAreaId] = useState<string>("");
  const [filterArea, setFilterArea] = useState("");

  const openNew = (areaId: string) => {
    setEditing(null);
    setNewAreaId(areaId);
    setDrawerOpen(true);
  };
  const openEdit = (section: Section) => {
    setEditing({ section, areaId: section.area_id });
    setNewAreaId("");
    setDrawerOpen(true);
  };
  const close = () => { setDrawerOpen(false); setEditing(null); setNewAreaId(""); };

  const filteredAreas = filterArea ? areas.filter((a) => a.id === filterArea) : areas;

  const byArea = filteredAreas.map((area) => ({
    area,
    items: sections.filter((s) => s.area_id === area.id),
  })).filter((g) => g.items.length > 0 || !filterArea);

  const selectStyle: React.CSSProperties = {
    fontSize: 13, padding: "7px 10px", borderRadius: 8,
    border: "1px solid #e5e7eb", backgroundColor: "#fff",
    color: "#374151", outline: "none", cursor: "pointer",
  };

  return (
    <>
      <Box p={40} maw={1100} mx="auto">
        {/* Header */}
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
          <Group justify="space-between" align="center" mt={4}>
            <Box>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>
                Secciones
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {sections.length} secciones en {areas.length} áreas
              </Text>
            </Box>
          </Group>
        </Box>

        {/* Filtro */}
        <Group gap={10} mb={24}>
          <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} style={selectStyle}>
            <option value="">Todas las áreas</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {filterArea && (
            <button onClick={() => setFilterArea("")} style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
              Limpiar
            </button>
          )}
          <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {sections.filter((s) => !filterArea || s.area_id === filterArea).length} secciones
          </Text>
        </Group>

        {/* Lista agrupada por área */}
        <Stack gap={20}>
          {byArea.map(({ area, items }) => (
            <Box key={area.id}>
              <Group gap={10} mb={10} align="center" justify="space-between">
                <Group gap={8}>
                  <Box style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />
                  <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{area.name}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>{items.length} secciones</Text>
                </Group>
                <button
                  onClick={() => openNew(area.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 500, color: "#6b7280",
                    background: "none", border: "1px solid #e5e7eb",
                    borderRadius: 7, padding: "5px 12px", cursor: "pointer",
                  }}
                >
                  <IconPlus size={12} />
                  Añadir
                </button>
              </Group>

              <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
                {/* Cabecera */}
                <Box
                  px={20} py={11}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 120px 32px",
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

                {items.length === 0 ? (
                  <Box px={20} py={24} style={{ textAlign: "center" }}>
                    <Text style={{ fontSize: 13, color: "#d1d5db" }}>
                      No hay secciones —{" "}
                      <button onClick={() => openNew(area.id)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
                        añade la primera
                      </button>
                    </Text>
                  </Box>
                ) : items.map((s, i) => {
                  const isLast = i === items.length - 1;
                  return (
                    <Box
                      key={`${s.id}-${s.area_id}`}
                      px={20} py={13}
                      onClick={() => openEdit(s)}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 120px 32px",
                        gap: 12, alignItems: "center",
                        borderBottom: isLast ? "none" : "1px solid #f9fafb",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                    >
                      <Text style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                        {s.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>
                        {s.id}
                      </Text>
                      <IconFolder size={13} color="#d1d5db" />
                    </Box>
                  );
                })}
              </Paper>
            </Box>
          ))}
        </Stack>
      </Box>

      <SlideDrawer
        open={drawerOpen}
        onClose={close}
        title={editing ? "Editar sección" : "Nueva sección"}
        subtitle={editing ? editing.section.name : areas.find((a) => a.id === newAreaId)?.name}
      >
        {drawerOpen && (
          <SeccionForm
            section={editing?.section}
            areaId={editing?.areaId ?? newAreaId}
            areaName={areas.find((a) => a.id === (editing?.areaId ?? newAreaId))?.name ?? ""}
            onClose={close}
          />
        )}
      </SlideDrawer>
    </>
  );
}
