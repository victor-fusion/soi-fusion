"use client";

import Link from "next/link";
import { Box, Text, Group, Stack, Badge, Paper, Progress } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { Startup } from "@/types";
import { BatchFilter } from "../../_components/BatchFilter";
import { NewStartupButton } from "./NewStartupButton";
import { Pagination } from "@/components/ui/Pagination";
import { Suspense } from "react";

type Phase = { number: number; name: string; color: string };

const TYPE_LABELS: Record<string, string> = {
  b2b_saas:        "B2B SaaS",
  b2c_app:         "B2C App",
  marketplace:     "Marketplace",
  producto_fisico: "Producto físico",
  servicios:       "Servicios",
};

const STATUS_COLOR: Record<string, string> = {
  activa:      "#16a34a",
  en_pausa:    "#d97706",
  en_revision: "#2563eb",
  inactiva:    "#9ca3af",
  cerrada:     "#ef4444",
};

interface ProgressData {
  done: number;
  total: number;
  pct: number;
}

interface StartupsClientProps {
  startups: Startup[];
  phases: Phase[];
  progressMap: Record<string, ProgressData>;
  availableBatches: number[];
  selectedBatch: number;
  total: number;
  page: number;
}

export function StartupsClient({
  startups,
  phases,
  progressMap,
  availableBatches,
  selectedBatch,
  total,
  page,
}: StartupsClientProps) {
  return (
    <Box p={40} maw={1100} mx="auto">
      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Group justify="space-between" align="center" mt={4}>
          <Box>
            <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Startups</Text>
            <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {total} startup{total !== 1 ? "s" : ""}
            </Text>
          </Box>
          <NewStartupButton />
        </Group>
      </Box>

      <Group gap={10} mb={24}>
        <Suspense fallback={null}>
          <BatchFilter batches={availableBatches} activeBatch={selectedBatch} basePath="/admin/startups" />
        </Suspense>
        {selectedBatch !== 0 && (
          <Link href="/admin/startups" style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}>
            Limpiar filtros
          </Link>
        )}
        <Text style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>{total} resultados</Text>
      </Group>

      <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
        <Box
          px={24} py={14}
          style={{
            borderBottom: "1px solid #f3f4f6",
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px 140px 180px 80px 32px",
            gap: 16, alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          {["Startup", "Ciclo", "Tipo", "Fase actual", "Progreso de fase", "Estado", ""].map((h) => (
            <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </Text>
          ))}
        </Box>

        {startups.length === 0 ? (
          <Box py={48} style={{ textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No hay startups con los filtros seleccionados.</Text>
          </Box>
        ) : (
          <Stack gap={0}>
            {startups.map((startup, i) => {
              const prog = progressMap[startup.id] ?? { done: 0, total: 0, pct: 0 };
              const phase = phases.find((p) => p.number === startup.current_phase) ?? phases[0];
              const isLast = i === startups.length - 1;

              return (
                <Link
                  key={startup.id}
                  href={`/admin/startups/${startup.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 80px 140px 180px 80px 32px",
                    gap: 16, alignItems: "center", padding: "16px 24px",
                    borderBottom: isLast ? "none" : "1px solid #f9fafb",
                    textDecoration: "none", color: "inherit", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <Box style={{ minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }} truncate>{startup.name}</Text>
                    {startup.tagline && (
                      <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }} truncate>{startup.tagline}</Text>
                    )}
                  </Box>

                  <Text style={{ fontSize: 12, color: "#6b7280" }}>Ciclo {startup.batch}</Text>

                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{TYPE_LABELS[startup.type] ?? startup.type}</Text>

                  <Group gap={8}>
                    <Box style={{
                      width: 20, height: 20, borderRadius: 5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                      backgroundColor: phase?.color ?? "#9ca3af", color: "white",
                    }}>
                      {phase?.number ?? "?"}
                    </Box>
                    <Text style={{ fontSize: 12, color: "#374151" }} lineClamp={1}>{phase?.name ?? "—"}</Text>
                  </Group>

                  <Box>
                    {prog.total > 0 ? (
                      <>
                        <Group justify="space-between" mb={4}>
                          <Text style={{ fontSize: 11, color: "#9ca3af" }}>{prog.done}/{prog.total}</Text>
                          <Text style={{ fontSize: 11, fontWeight: 600, color: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706" }}>
                            {prog.pct}%
                          </Text>
                        </Group>
                        <Progress
                          value={prog.pct} size={6} radius="xl"
                          styles={{
                            root: { backgroundColor: "#f3f4f6" },
                            section: { backgroundColor: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706" },
                          }}
                        />
                      </>
                    ) : (
                      <Text style={{ fontSize: 12, color: "#d1d5db" }}>Sin entregables</Text>
                    )}
                  </Box>

                  <Badge
                    size="sm" variant="dot"
                    styles={{ root: { color: STATUS_COLOR[startup.status] ?? "#9ca3af", borderColor: "transparent" } }}
                  >
                    {startup.status === "activa" ? "Activa" : startup.status === "en_pausa" ? "En pausa" : startup.status}
                  </Badge>

                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db" }}>
                    <IconPencil size={14} />
                  </Box>
                </Link>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Pagination total={total} page={page} perPage={15} />
    </Box>
  );
}
