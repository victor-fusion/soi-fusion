"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Group, Badge, Paper, Stack } from "@mantine/core";
import { IconPlus, IconFileDescription } from "@tabler/icons-react";
import type { EntregableTemplate, Area } from "@/types";

type Phase = { number: number; name: string; color: string };
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

interface EntregablesClientProps {
  templates: EntregableTemplate[];
  areas: Area[];
  phases: Phase[];
}

export function EntregablesClient({ templates, areas, phases: PHASES }: EntregablesClientProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterArea, setFilterArea]       = useState("");
  const [filterPhase, setFilterPhase]     = useState(0);
  const [filterSection, setFilterSection] = useState("");
  const [filterTipo, setFilterTipo]       = useState("");

  const openNew = () => setDrawerOpen(true);
  const close = () => setDrawerOpen(false);

  const clearFilters = () => { setFilterArea(""); setFilterPhase(0); setFilterSection(""); setFilterTipo(""); };
  const hasFilters = filterArea || filterPhase > 0 || filterSection || filterTipo;

  const availableSections = filterArea
    ? (areas.find((a) => a.id === filterArea)?.sections ?? [])
    : areas.flatMap((a) => a.sections);

  const areaMap = Object.fromEntries(areas.map((a) => [a.id, a]));
  const phaseMap = Object.fromEntries(PHASES.map((p) => [p.number, p]));

  const filtered = templates.filter((t) => {
    if (filterArea    && t.area    !== filterArea)    return false;
    if (filterPhase   && t.phase   !== filterPhase)   return false;
    if (filterSection && t.section !== filterSection)  return false;
    if (filterTipo    && t.tipo    !== filterTipo)     return false;
    return true;
  });

  const selectStyle: React.CSSProperties = {
    fontSize: 13, padding: "7px 10px", borderRadius: 8,
    border: "1px solid #e5e7eb", backgroundColor: "#fff",
    color: "#374151", outline: "none", cursor: "pointer",
  };

  return (
    <>
      <Box p={40} maw={1200} mx="auto">
        {/* Header */}
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
          <Group justify="space-between" align="center" mt={4}>
            <Box>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Entregables</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {templates.length} entregables maestros · {templates.filter((t) => t.is_active).length} activos
              </Text>
            </Box>
            <button
              onClick={openNew}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <IconPlus size={15} />
              Nuevo entregable
            </button>
          </Group>
        </Box>

        {/* Filtros */}
        <Group gap={10} mb={24}>
          <select value={filterPhase} onChange={(e) => setFilterPhase(parseInt(e.target.value, 10))} style={selectStyle}>
            <option value={0}>Todas las fases</option>
            {PHASES.map((p) => <option key={p.number} value={p.number}>Fase {p.number} · {p.name}</option>)}
          </select>
          <select value={filterArea} onChange={(e) => { setFilterArea(e.target.value); setFilterSection(""); }} style={selectStyle}>
            <option value="">Todas las áreas</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} style={selectStyle}>
            <option value="">Todas las secciones</option>
            {availableSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={selectStyle}>
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
              Limpiar filtros
            </button>
          )}
          <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {filtered.length} resultados
          </Text>
        </Group>

        {/* Tabla plana */}
        {filtered.length === 0 ? (
          <Paper p={40} radius="lg" withBorder style={{ borderColor: "#f3f4f6", textAlign: "center" }}>
            <IconFileDescription size={32} color="#d1d5db" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#9ca3af" }}>No hay entregables con los filtros seleccionados.</Text>
          </Paper>
        ) : (
          <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
            {/* Cabecera */}
            <Box
              px={20} py={11}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px 120px 130px 44px",
                gap: 12, alignItems: "center",
                backgroundColor: "#fafafa",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {["Entregable", "Fase", "Área", "Sección", ""].map((h) => (
                <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </Text>
              ))}
            </Box>

            <Stack gap={0}>
              {filtered.map((t, i) => {
                const areaData  = areaMap[t.area];
                const phaseData = phaseMap[t.phase];
                const sectionData = areaData?.sections.find((s) => s.id === t.section);
                const isLast = i === filtered.length - 1;

                return (
                  <Box
                    key={t.id}
                    px={20} py={13}
                    onClick={() => router.push(`/admin/entregables/${t.id}`)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 130px 120px 130px 44px",
                      gap: 12, alignItems: "center",
                      borderBottom: isLast ? "none" : "1px solid #f9fafb",
                      cursor: "pointer",
                      opacity: t.is_active ? 1 : 0.45,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    {/* Entregable */}
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

                    {/* Fase */}
                    {phaseData ? (
                      <Group gap={6}>
                        <Box style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: phaseData.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {phaseData.number}
                        </Box>
                        <Text style={{ fontSize: 12, color: "#374151" }} truncate>{phaseData.name}</Text>
                      </Group>
                    ) : (
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>Fase {t.phase}</Text>
                    )}

                    {/* Área */}
                    <Group gap={6} style={{ minWidth: 0 }}>
                      {areaData && <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: areaData.color, flexShrink: 0 }} />}
                      <Text style={{ fontSize: 12, color: "#374151" }} truncate>
                        {areaData?.name ?? t.area}
                      </Text>
                    </Group>

                    {/* Sección */}
                    <Text style={{ fontSize: 12, color: "#6b7280" }} truncate>
                      {sectionData?.name ?? t.section}
                    </Text>

                    {/* Activo */}
                    <TemplateToggle id={t.id} isActive={t.is_active} />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        )}
      </Box>

      <SlideDrawer
        open={drawerOpen}
        onClose={close}
        title="Nuevo entregable maestro"
        subtitle="Se asignará automáticamente a nuevas startups"
      >
        {drawerOpen && (
          <TemplateForm onClose={close} areas={areas} phases={PHASES} />
        )}
      </SlideDrawer>
    </>
  );
}
