"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, Paper, Stack } from "@mantine/core";
import { IconPlus, IconPencil, IconGripVertical } from "@tabler/icons-react";
import {
  DndContext, closestCenter, DragEndEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { SeccionForm } from "./SeccionForm";
import { reorderSections } from "../../areas/actions";

type Area = { id: string; name: string; color: string; sort_order: number };
type Section = { id: string; area_id: string; name: string; sort_order: number };

interface SeccionesClientProps {
  areas: Area[];
  sections: Section[];
}

function SortableSectionRow({
  section, area, isLast, onClick,
}: { section: Section; area?: Area; isLast: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `${section.id}-${section.area_id}` });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "grid", gridTemplateColumns: "28px 1fr 160px 150px 32px",
    gap: 12, alignItems: "center", padding: "13px 20px",
    borderBottom: isLast ? "none" : "1px solid #f9fafb",
    cursor: "pointer",
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "#f9fafb" : "",
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = "#fafafa"; }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = ""; }}
    >
      <Box
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#d1d5db", cursor: "grab", display: "flex", alignItems: "center" }}
      >
        <IconGripVertical size={14} />
      </Box>
      <Text style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{section.name}</Text>
      <Group gap={6}>
        {area && <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />}
        <Text style={{ fontSize: 12, color: "#374151" }}>{area?.name ?? section.area_id}</Text>
      </Group>
      <Text style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{section.id}</Text>
      <Box style={{ display: "flex", justifyContent: "center", color: "#d1d5db" }}>
        <IconPencil size={13} />
      </Box>
    </Box>
  );
}

export function SeccionesClient({ areas, sections: initialSections }: SeccionesClientProps) {
  const [sections, setSections] = useState(initialSections);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [filterArea, setFilterArea] = useState("");
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const openNew = () => { setEditingSection(null); setDrawerOpen(true); };
  const openEdit = (section: Section) => { setEditingSection(section); setDrawerOpen(true); };
  const close = () => { setDrawerOpen(false); setEditingSection(null); };

  const filtered = filterArea ? sections.filter((s) => s.area_id === filterArea) : sections;
  const areaMap = Object.fromEntries(areas.map((a) => [a.id, a]));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeKey = active.id as string;
    const overKey = over.id as string;
    const allIds = filtered.map((s) => `${s.id}-${s.area_id}`);
    const oldIndex = allIds.indexOf(activeKey);
    const newIndex = allIds.indexOf(overKey);
    if (oldIndex === -1 || newIndex === -1) return;
    const reorderedFiltered = arrayMove(filtered, oldIndex, newIndex);
    // Merge back into full list
    const filteredIds = new Set(filtered.map((s) => `${s.id}-${s.area_id}`));
    const rest = sections.filter((s) => !filteredIds.has(`${s.id}-${s.area_id}`));
    const reordered = [...reorderedFiltered, ...rest];
    setSections(reordered);
    startTransition(() =>
      reorderSections(reorderedFiltered.map(({ id, area_id }) => ({ id, area_id })))
    );
  };

  const selectStyle: React.CSSProperties = {
    fontSize: 13, padding: "7px 10px", borderRadius: 8,
    border: "1px solid #e5e7eb", backgroundColor: "#fff",
    color: "#374151", outline: "none", cursor: "pointer",
  };

  return (
    <>
      <Box p={40} maw={1100} mx="auto">
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
          <Group justify="space-between" align="center" mt={4}>
            <Box>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Secciones</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {sections.length} secciones en {areas.length} áreas
              </Text>
            </Box>
            <button
              onClick={openNew}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <IconPlus size={15} />
              Nueva sección
            </button>
          </Group>
        </Box>

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
          <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>{filtered.length} secciones</Text>
        </Group>

        <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
          <Box px={20} py={11} style={{ display: "grid", gridTemplateColumns: "28px 1fr 160px 150px 32px", gap: 12, alignItems: "center", backgroundColor: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}></Text>
            {["Sección", "Área", "ID", ""].map((h) => (
              <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</Text>
            ))}
          </Box>

          {filtered.length === 0 ? (
            <Box px={20} py={32} style={{ textAlign: "center" }}>
              <Text style={{ fontSize: 13, color: "#d1d5db" }}>No hay secciones</Text>
            </Box>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((s) => `${s.id}-${s.area_id}`)} strategy={verticalListSortingStrategy}>
                <Stack gap={0}>
                  {filtered.map((s, i) => (
                    <SortableSectionRow
                      key={`${s.id}-${s.area_id}`}
                      section={s}
                      area={areaMap[s.area_id]}
                      isLast={i === filtered.length - 1}
                      onClick={() => openEdit(s)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Paper>
      </Box>

      <SlideDrawer
        open={drawerOpen}
        onClose={close}
        title={editingSection ? "Editar sección" : "Nueva sección"}
        subtitle={editingSection ? editingSection.name : undefined}
      >
        {drawerOpen && (
          <SeccionForm
            section={editingSection ?? undefined}
            areaId={editingSection?.area_id ?? ""}
            areaName={editingSection ? (areaMap[editingSection.area_id]?.name ?? "") : ""}
            areas={areas}
            onClose={close}
          />
        )}
      </SlideDrawer>
    </>
  );
}
