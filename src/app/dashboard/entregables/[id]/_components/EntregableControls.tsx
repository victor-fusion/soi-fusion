"use client";

import { useTransition } from "react";
import { Box, Text, Group } from "@mantine/core";
import {
  IconCircle, IconClock, IconEye, IconAlertCircle, IconCircleCheck,
} from "@tabler/icons-react";
import { updateEntregableStatus } from "../actions";

// El founder solo puede mover entre: pendiente → en_progreso → en_revision
// (admin mueve a cambios_solicitados y completado)
const FOUNDER_STATUSES = [
  { value: "pendiente",   label: "Pendiente",   icon: IconCircle,       color: "#9ca3af", bg: "#f9fafb" },
  { value: "en_progreso", label: "En progreso", icon: IconClock,        color: "#2563eb", bg: "#eff6ff" },
  { value: "en_revision", label: "Enviar a revisión", icon: IconEye,   color: "#ca8a04", bg: "#fef9c3" },
] as const;

const ALL_STATUS_CONFIG: Record<string, { label: string; icon: typeof IconCircle; color: string; bg: string }> = {
  pendiente:           { label: "Pendiente",         icon: IconCircle,       color: "#9ca3af", bg: "#f9fafb" },
  en_progreso:         { label: "En progreso",       icon: IconClock,        color: "#2563eb", bg: "#eff6ff" },
  en_revision:         { label: "En revisión",       icon: IconEye,          color: "#ca8a04", bg: "#fef9c3" },
  cambios_solicitados: { label: "Cambios solicitados", icon: IconAlertCircle, color: "#e11d48", bg: "#fff1f2" },
  completado:          { label: "Completado",        icon: IconCircleCheck,  color: "#16a34a", bg: "#f0fdf4" },
};

interface EntregableControlsProps {
  entregableId: string;
  currentStatus: string;
  reviewerNotes?: string;
}

export function EntregableControls({
  entregableId,
  currentStatus,
  reviewerNotes,
}: EntregableControlsProps) {
  const [isPending, startTransition] = useTransition();

  const isLocked = currentStatus === "completado";
  const hasPendingChanges = currentStatus === "cambios_solicitados";

  const handleStatus = (value: string) => {
    if (value === currentStatus || isLocked) return;
    startTransition(async () => {
      await updateEntregableStatus(entregableId, value);
    });
  };

  const cfg = ALL_STATUS_CONFIG[currentStatus] ?? ALL_STATUS_CONFIG.pendiente;
  const StatusIcon = cfg.icon;

  return (
    <Box style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}>

      {/* Banner: cambios solicitados */}
      {hasPendingChanges && (
        <Box
          mb={20}
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            backgroundColor: "#fff1f2",
            border: "1px solid #fecdd3",
            display: "flex", gap: 10, alignItems: "flex-start",
          }}
        >
          <IconAlertCircle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: 1 }} />
          <Box>
            <Text style={{ fontSize: 13, fontWeight: 600, color: "#be123c" }}>
              El equipo Fusión ha solicitado cambios
            </Text>
            {reviewerNotes && (
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {reviewerNotes}
              </Text>
            )}
          </Box>
        </Box>
      )}

      {/* Banner: completado */}
      {isLocked && (
        <Box
          mb={20}
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            display: "flex", gap: 10, alignItems: "center",
          }}
        >
          <IconCircleCheck size={16} color="#16a34a" />
          <Text style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
            Entregable completado y aprobado por Fusión
          </Text>
        </Box>
      )}

      {/* Estado actual */}
      <Box mb={isLocked ? 0 : 20}>
        <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Estado actual
        </Text>
        <Box
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 14px", borderRadius: 8,
            backgroundColor: cfg.bg,
            border: `1.5px solid ${cfg.color}`,
            color: cfg.color, fontSize: 13, fontWeight: 600,
          }}
        >
          <StatusIcon size={14} />
          {cfg.label}
        </Box>
      </Box>

      {/* Botones de transición (solo si no está completado) */}
      {!isLocked && (
        <Box>
          <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Cambiar estado
          </Text>
          <Group gap={8}>
            {FOUNDER_STATUSES.map((opt) => {
              const Icon = opt.icon;
              const isActive = currentStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatus(opt.value)}
                  disabled={isPending || isActive}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 8,
                    border: isActive ? `1.5px solid ${opt.color}` : "1.5px solid #f3f4f6",
                    backgroundColor: isActive ? opt.bg : "#fff",
                    color: isActive ? opt.color : "#9ca3af",
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    cursor: isPending || isActive ? "default" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </Group>
          {currentStatus === "cambios_solicitados" && (
            <button
              onClick={() => handleStatus("en_revision")}
              disabled={isPending}
              style={{
                marginTop: 12,
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8,
                border: "none", backgroundColor: "#ca8a04",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: isPending ? "wait" : "pointer",
              }}
            >
              <IconEye size={14} />
              Reenviar a revisión
            </button>
          )}
        </Box>
      )}
    </Box>
  );
}
