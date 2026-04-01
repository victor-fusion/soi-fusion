"use client";

import { useState } from "react";
import { Box, Text, Group, Badge, Paper, Stack } from "@mantine/core";
import { IconPlus, IconLayoutGrid } from "@tabler/icons-react";
import type { Card } from "@/types";
import { AREAS } from "@/constants/areas";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { RecursoForm } from "./RecursoForm";
import { RecursoToggle } from "./RecursoToggle";

const TYPE_LABELS: Record<string, string> = {
  playbook:      "Playbook",
  template:      "Plantilla",
  tool:          "Herramienta",
  ai_tool:       "Herramienta IA",
  checklist:     "Checklist",
  resource:      "Recurso",
  external_link: "Enlace externo",
  agent:         "Agente IA",
};

const TYPE_COLORS: Record<string, string> = {
  playbook:      "#2563eb",
  template:      "#7c3aed",
  tool:          "#d97706",
  ai_tool:       "#ea580c",
  checklist:     "#16a34a",
  resource:      "#0d9488",
  external_link: "#6b7280",
  agent:         "#db2777",
};

// Card enriquecido con el area_id para el formulario
type CardWithArea = Card & { area_id: string };

interface RecursosClientProps {
  cards: CardWithArea[];
}

export function RecursosClient({ cards }: RecursosClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CardWithArea | null>(null);
  const [filterArea, setFilterArea] = useState("");
  const [filterType, setFilterType] = useState("");

  const openNew = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (c: CardWithArea) => { setEditing(c); setDrawerOpen(true); };
  const close = () => { setDrawerOpen(false); setEditing(null); };

  const filtered = cards.filter((c) => {
    if (filterArea && c.area_id !== filterArea) return false;
    if (filterType && c.type !== filterType) return false;
    return true;
  });

  // Agrupar por área
  const byArea = AREAS.map((a) => ({
    area: a,
    items: filtered.filter((c) => c.area_id === a.id),
  })).filter((g) => g.items.length > 0);

  const allTypes = [...new Set(cards.map((c) => c.type))].sort();

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
                Recursos
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {cards.length} recursos · {cards.filter((c) => c.is_active).length} activos
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
              Nuevo recurso
            </button>
          </Group>
        </Box>

        {/* Filtros */}
        <Group gap={10} mb={24}>
          <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} style={selectStyle}>
            <option value="">Todas las áreas</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
            <option value="">Todos los tipos</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>
          {(filterArea || filterType) && (
            <button
              onClick={() => { setFilterArea(""); setFilterType(""); }}
              style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}
            >
              Limpiar filtros
            </button>
          )}
          <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {filtered.length} resultados
          </Text>
        </Group>

        {/* Lista agrupada por área */}
        {byArea.length === 0 ? (
          <Paper p={40} radius="lg" withBorder style={{ borderColor: "#f3f4f6", textAlign: "center" }}>
            <IconLayoutGrid size={32} color="#d1d5db" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#9ca3af" }}>No hay recursos con los filtros seleccionados.</Text>
          </Paper>
        ) : (
          <Stack gap={20}>
            {byArea.map(({ area, items }) => (
              <Box key={area.id}>
                {/* Cabecera de área */}
                <Group gap={10} mb={10} align="center">
                  <Box style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />
                  <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{area.name}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>{items.length} recursos</Text>
                </Group>

                <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
                  {/* Cabecera */}
                  <Box
                    px={20} py={11}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 130px 130px 44px",
                      gap: 12, alignItems: "center",
                      backgroundColor: "#fafafa",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {["Recurso", "Sección", "Tipo", ""].map((h) => (
                      <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </Text>
                    ))}
                  </Box>

                  {items.map((c, i) => {
                    const areaData = AREAS.find((a) => a.id === c.area_id);
                    const sectionData = areaData?.sections.find((s) => s.id === c.section_id);
                    const typeColor = TYPE_COLORS[c.type] ?? "#9ca3af";
                    const isLast = i === items.length - 1;

                    return (
                      <Box
                        key={c.id}
                        px={20} py={13}
                        onClick={() => openEdit(c)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 130px 130px 44px",
                          gap: 12, alignItems: "center",
                          borderBottom: isLast ? "none" : "1px solid #f9fafb",
                          cursor: "pointer",
                          opacity: c.is_active ? 1 : 0.45,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                      >
                        <Box style={{ minWidth: 0 }}>
                          <Text style={{ fontSize: 13, fontWeight: 500, color: "#111827" }} truncate>
                            {c.title}
                          </Text>
                          {c.description && (
                            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }} truncate>
                              {c.description}
                            </Text>
                          )}
                        </Box>

                        <Text style={{ fontSize: 12, color: "#6b7280" }} truncate>
                          {sectionData?.name ?? c.section_id}
                        </Text>

                        <Badge
                          size="xs" variant="light"
                          styles={{ root: { backgroundColor: `${typeColor}15`, color: typeColor } }}
                        >
                          {TYPE_LABELS[c.type] ?? c.type}
                        </Badge>

                        <RecursoToggle id={c.id} isActive={c.is_active} />
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
        title={editing ? "Editar recurso" : "Nuevo recurso"}
        subtitle={editing ? editing.title : undefined}
      >
        {drawerOpen && (
          <RecursoForm card={editing ?? undefined} onClose={close} />
        )}
      </SlideDrawer>
    </>
  );
}
