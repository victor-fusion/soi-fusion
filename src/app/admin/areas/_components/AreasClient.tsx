"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Group, Paper, Stack, Badge } from "@mantine/core";
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
import { AreaForm } from "./AreaForm";
import { reorderAreas } from "../actions";

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

function SortableAreaRow({ area, isLast, onClick }: { area: AreaRecord; isLast: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: area.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "grid", gridTemplateColumns: "28px 1fr 100px 32px",
    gap: 12, alignItems: "center", padding: "14px 20px",
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
      <Group gap={10}>
        <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: area.color, flexShrink: 0 }} />
        <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{area.name}</Text>
      </Group>
      <Badge size="xs" variant="light" color="gray">{area.sections.length} secciones</Badge>
      <Box style={{ display: "flex", justifyContent: "center", color: "#d1d5db" }}>
        <IconPencil size={13} />
      </Box>
    </Box>
  );
}

interface AreasClientProps {
  areas: AreaRecord[];
}

export function AreasClient({ areas: initialAreas }: AreasClientProps) {
  const router = useRouter();
  const [areas, setAreas] = useState(initialAreas);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const openNew = () => setDrawerOpen(true);
  const close = () => setDrawerOpen(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = areas.findIndex((a) => a.id === active.id);
    const newIndex = areas.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(areas, oldIndex, newIndex);
    setAreas(reordered);
    startTransition(() => reorderAreas(reordered.map((a) => a.id)));
  };

  return (
    <>
      <Box p={40} maw={900} mx="auto">
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
              onClick={openNew}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <IconPlus size={15} />
              Nueva área
            </button>
          </Group>
        </Box>

        <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
          <Box px={20} py={11} style={{ display: "grid", gridTemplateColumns: "28px 1fr 100px 32px", gap: 12, alignItems: "center", backgroundColor: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}></Text>
            {["Área", "Secciones", ""].map((h) => (
              <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</Text>
            ))}
          </Box>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={areas.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <Stack gap={0}>
                {areas.map((area, i) => (
                  <SortableAreaRow
                    key={area.id}
                    area={area}
                    isLast={i === areas.length - 1}
                    onClick={() => router.push(`/admin/areas/${area.id}`)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </Paper>
      </Box>

      <SlideDrawer open={drawerOpen} onClose={close} title="Nueva área">
        {drawerOpen && <AreaForm onClose={close} />}
      </SlideDrawer>
    </>
  );
}
