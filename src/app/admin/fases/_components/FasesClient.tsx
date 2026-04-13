"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Group, Paper, Stack } from "@mantine/core";
import { IconPlus, IconGripVertical } from "@tabler/icons-react";
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
import { FaseForm } from "./FaseForm";
import { reorderFases } from "../actions";

interface Phase {
  id: number;
  number: number;
  name: string;
  color: string;
  description?: string;
}

function SortablePhaseRow({ phase, isLast, onClick }: { phase: Phase; isLast: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: phase.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "grid",
    gridTemplateColumns: "28px 60px 1fr 2fr 100px",
    gap: 16, alignItems: "center",
    padding: "16px 24px",
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
      <Box style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: phase.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
        {phase.number}
      </Box>
      <Text style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{phase.name}</Text>
      <Text style={{ fontSize: 12, color: "#6b7280" }} lineClamp={2}>{phase.description ?? <span style={{ color: "#d1d5db" }}>Sin descripción</span>}</Text>
      <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Box style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: phase.color }} />
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>{phase.color}</Text>
      </Box>
    </Box>
  );
}

interface FasesClientProps {
  phases: Phase[];
}

export function FasesClient({ phases: initialPhases }: FasesClientProps) {
  const router = useRouter();
  const [phases, setPhases] = useState(initialPhases);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setPhases(initialPhases); }, [initialPhases]);
  const [editing, setEditing] = useState<Phase | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const openNew  = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (p: Phase) => { setEditing(p); setDrawerOpen(true); };
  const close    = () => { setDrawerOpen(false); setEditing(null); router.refresh(); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = phases.findIndex((p) => p.id === active.id);
    const newIndex = phases.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(phases, oldIndex, newIndex).map((p, i) => ({ ...p, number: i + 1 }));
    setPhases(reordered);
    startTransition(() => reorderFases(reordered.map((p) => p.id)));
  };

  return (
    <>
      <Box p={40} maw={900} mx="auto">
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
          <Group justify="space-between" align="center" mt={4}>
            <Box>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Fases</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{phases.length} fases del ciclo</Text>
            </Box>
            <button
              onClick={openNew}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <IconPlus size={15} />
              Nueva fase
            </button>
          </Group>
        </Box>

        <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
          <Box px={24} py={14} style={{ borderBottom: "1px solid #f3f4f6", display: "grid", gridTemplateColumns: "28px 60px 1fr 2fr 100px", gap: 16, alignItems: "center", backgroundColor: "#fafafa" }}>
            <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af" }}></Text>
            {["Nº", "Nombre", "Descripción", "Color"].map((h) => (
              <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</Text>
            ))}
          </Box>

          {phases.length === 0 ? (
            <Box py={48} style={{ textAlign: "center" }}><Text style={{ color: "#9ca3af" }}>No hay fases.</Text></Box>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <Stack gap={0}>
                  {phases.map((phase, i) => (
                    <SortablePhaseRow
                      key={phase.id}
                      phase={phase}
                      isLast={i === phases.length - 1}
                      onClick={() => openEdit(phase)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Paper>
      </Box>

      <SlideDrawer open={drawerOpen} onClose={close} title={editing ? "Editar fase" : "Nueva fase"} subtitle={editing ? editing.name : "Añadir fase al ciclo"}>
        {drawerOpen && <FaseForm fase={editing ?? undefined} onClose={close} />}
      </SlideDrawer>
    </>
  );
}
