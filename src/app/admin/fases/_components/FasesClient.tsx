"use client";

import { useState } from "react";
import { Box, Text, Group, Paper, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { FaseForm } from "./FaseForm";

interface Phase {
  id: number;
  number: number;
  name: string;
  color: string;
}

interface FasesClientProps {
  phases: Phase[];
}

export function FasesClient({ phases }: FasesClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Phase | null>(null);

  const openNew  = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (p: Phase) => { setEditing(p); setDrawerOpen(true); };
  const close    = () => { setDrawerOpen(false); setEditing(null); };

  return (
    <>
      <Box p={40} maw={900} mx="auto">
        {/* Header */}
        <Box mb={32}>
          <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
          <Group justify="space-between" align="center" mt={4}>
            <Box>
              <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Fases</Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {phases.length} fases del ciclo
              </Text>
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

        {/* Lista */}
        <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
          <Box
            px={24} py={14}
            style={{
              borderBottom: "1px solid #f3f4f6",
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px",
              gap: 16, alignItems: "center",
              backgroundColor: "#fafafa",
            }}
          >
            {["Nº", "Nombre", "Color"].map((h) => (
              <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </Text>
            ))}
          </Box>

          {phases.length === 0 ? (
            <Box py={48} style={{ textAlign: "center" }}>
              <Text style={{ color: "#9ca3af" }}>No hay fases. Crea la primera.</Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {phases.map((phase, i) => (
                <Box
                  key={phase.id}
                  px={24} py={16}
                  onClick={() => openEdit(phase)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 100px",
                    gap: 16, alignItems: "center",
                    borderBottom: i === phases.length - 1 ? "none" : "1px solid #f9fafb",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <Box
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      backgroundColor: phase.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}
                  >
                    {phase.number}
                  </Box>
                  <Text style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                    {phase.name}
                  </Text>
                  <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Box style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: phase.color }} />
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>{phase.color}</Text>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      <SlideDrawer
        open={drawerOpen}
        onClose={close}
        title={editing ? "Editar fase" : "Nueva fase"}
        subtitle={editing ? editing.name : "Añadir fase al ciclo"}
      >
        {drawerOpen && <FaseForm fase={editing ?? undefined} onClose={close} />}
      </SlideDrawer>
    </>
  );
}
