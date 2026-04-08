"use client";

import { useState } from "react";
import { Box, Text, Group, Badge, Paper, Stack } from "@mantine/core";
import { IconPlus, IconFileDescription } from "@tabler/icons-react";
import type { EntregableTemplate } from "@/types";
import { AREAS } from "@/constants/areas";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { TemplateForm } from "./TemplateForm";
import { TemplateToggle } from "./TemplateToggle";

const TIPO_LABELS: Record<string, string> = {
  archivos:   "Archivos",
  formulario: "Formulario",
  link:       "Enlace",
  checklist:  "Checklist",
  externo:    "Externo",
};

const TIPO_COLORS: Record<string, string> = {
  archivos:   "#2563eb",
  formulario: "#7c3aed",
  link:       "#0d9488",
  checklist:  "#d97706",
  externo:    "#9ca3af",
};

interface EntregablesClientProps {
  templates: EntregableTemplate[];
}

export function EntregablesClient({ templates }: EntregablesClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EntregableTemplate | null>(null);
  const [filterArea, setFilterArea] = useState("");

  const openNew = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (t: EntregableTemplate) => { setEditing(t); setDrawerOpen(true); };
  const close = () => { setDrawerOpen(false); setEditing(null); };

  const filtered = templates.filter((t) => {
    if (filterArea && t.area !== filterArea) return false;
    return true;
  });

  // Agrupar por área
  const byArea = AREAS.map((a) => ({
    area: a,
    items: filtered.filter((t) => t.area === a.id),
  })).filter((g) => g.items.length > 0);

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
                Entregables
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {templates.length} entregables maestros · {templates.filter((t) => t.is_active).length} activos
              </Text>
            </Box>
            <button
              onClick={openNew}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 8,
                border: "none", backgroundColor: "#111827",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <IconPlus size={15} />
              Nuevo entregable
            </button>
          </Group>
        </Box>

        {/* Filtros */}
        <Group gap={10} mb={24}>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            style={selectStyle}
          >
            <option value="">Todas las áreas</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {filterArea && (
            <button
              onClick={() => { setFilterArea(""); }}
              style={{
                fontSize: 12, color: "#9ca3af", background: "none",
                border: "none", cursor: "pointer", padding: "0 4px",
              }}
            >
              Limpiar filtros
            </button>
          )}
          <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {filtered.length} resultados
          </Text>
        </Group>

        {/* Lista agrupada por fase */}
        {byArea.length === 0 ? (
          <Paper p={40} radius="lg" withBorder style={{ borderColor: "#f3f4f6", textAlign: "center" }}>
            <IconFileDescription size={32} color="#d1d5db" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#9ca3af" }}>No hay entregables con los filtros seleccionados.</Text>
          </Paper>
        ) : (
          <Stack gap={20}>
            {byArea.map(({ area, items }) => (
              <Box key={area.id}>
                {/* Cabecera de área */}
                <Group gap={10} mb={10} align="center">
                  <Box
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      backgroundColor: area.color,
                      flexShrink: 0,
                    }}
                  />
                  <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {area.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                    {items.length} entregables
                  </Text>
                </Group>

                {/* Tabla */}
                <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
                  {/* Cabecera */}
                  <Box
                    px={20} py={11}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 130px 130px 80px 44px",
                      gap: 12, alignItems: "center",
                      backgroundColor: "#fafafa",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {["Entregable", "Área", "Tipo", "Sección", ""].map((h) => (
                      <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </Text>
                    ))}
                  </Box>

                  {items.map((t, i) => {
                    const areaData = AREAS.find((a) => a.id === t.area);
                    const sectionData = areaData?.sections.find((s) => s.id === t.section);
                    const tipoColor = TIPO_COLORS[t.tipo] ?? "#9ca3af";
                    const isLast = i === items.length - 1;

                    return (
                      <Box
                        key={t.id}
                        px={20} py={13}
                        onClick={() => openEdit(t)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 130px 130px 80px 44px",
                          gap: 12, alignItems: "center",
                          borderBottom: isLast ? "none" : "1px solid #f9fafb",
                          cursor: "pointer",
                          opacity: t.is_active ? 1 : 0.45,
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                      >
                        <Box style={{ minWidth: 0 }}>
                          <Text style={{ fontSize: 13, fontWeight: 500, color: "#111827" }} truncate>
                            {t.title}
                          </Text>
                          {t.description && (
                            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }} truncate>
                              {t.description}
                            </Text>
                          )}
                        </Box>

                        <Group gap={6} style={{ minWidth: 0 }}>
                          {areaData && (
                            <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: areaData.color, flexShrink: 0 }} />
                          )}
                          <Text style={{ fontSize: 12, color: "#374151" }} truncate>
                            {areaData?.name ?? t.area}
                          </Text>
                        </Group>

                        <Badge
                          size="xs" variant="light"
                          styles={{ root: { backgroundColor: `${tipoColor}15`, color: tipoColor } }}
                        >
                          {TIPO_LABELS[t.tipo] ?? t.tipo}
                        </Badge>

                        <Text style={{ fontSize: 12, color: "#6b7280" }} truncate>
                          {sectionData?.name ?? t.section}
                        </Text>

                        <TemplateToggle id={t.id} isActive={t.is_active} />
                      </Box>
                    );
                  })}
                </Paper>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <SlideDrawer
        open={drawerOpen}
        onClose={close}
        title={editing ? "Editar entregable maestro" : "Nuevo entregable maestro"}
        subtitle={editing ? editing.title : "Se asignará automáticamente a nuevas startups"}
      >
        {drawerOpen && (
          <TemplateForm template={editing ?? undefined} onClose={close} />
        )}
      </SlideDrawer>
    </>
  );
}
