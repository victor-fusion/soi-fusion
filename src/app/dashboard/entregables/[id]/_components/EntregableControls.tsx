"use client";

import { useTransition } from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconCircleCheck, IconClock, IconCircle } from "@tabler/icons-react";
import { updateEntregableStatus, toggleStep } from "../actions";

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pendiente",   icon: IconCircle,      color: "#9ca3af", bg: "#f9fafb" },
  { value: "in_progress", label: "En progreso", icon: IconClock,       color: "#2563eb", bg: "#eff6ff" },
  { value: "done",        label: "Completado",  icon: IconCircleCheck, color: "#16a34a", bg: "#f0fdf4" },
];

interface EntregableControlsProps {
  entregableId: string;
  currentStatus: string;
  steps?: string[];
  completedSteps?: number[];
}

export function EntregableControls({
  entregableId,
  currentStatus,
  steps = [],
  completedSteps = [],
}: EntregableControlsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (value: string) => {
    if (value === currentStatus) return;
    startTransition(async () => {
      await updateEntregableStatus(entregableId, value);
    });
  };

  const handleToggleStep = (index: number) => {
    startTransition(async () => {
      await toggleStep(entregableId, index, completedSteps);
    });
  };

  return (
    <Box style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}>

      {/* Selector de estado */}
      <Box mb={steps.length > 0 ? 32 : 0}>
        <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Estado
        </Text>
        <Group gap={8}>
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleStatus(opt.value)}
                disabled={isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: isActive ? `1.5px solid ${opt.color}` : "1.5px solid #f3f4f6",
                  backgroundColor: isActive ? opt.bg : "#fff",
                  color: isActive ? opt.color : "#9ca3af",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: isPending ? "wait" : isActive ? "default" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </Group>
      </Box>

      {/* Pasos */}
      {steps.length > 0 && (
        <Box>
          <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Pasos
          </Text>
          <Box
            style={{
              borderRadius: 12,
              border: "1px solid #f3f4f6",
              overflow: "hidden",
            }}
          >
            {steps.map((step, i) => {
              const done = completedSteps.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleToggleStep(i)}
                  disabled={isPending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "12px 16px",
                    background: done ? "#f0fdf4" : "#fff",
                    border: "none",
                    borderBottom: i < steps.length - 1 ? "1px solid #f3f4f6" : "none",
                    cursor: isPending ? "wait" : "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                >
                  {done
                    ? <IconCircleCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                    : <IconCircle size={16} color="#d1d5db" style={{ flexShrink: 0 }} />
                  }
                  <Text
                    style={{
                      fontSize: 14,
                      color: done ? "#6b7280" : "#374151",
                      textDecoration: done ? "line-through" : "none",
                      flex: 1,
                      textAlign: "left",
                    }}
                  >
                    {step}
                  </Text>
                </button>
              );
            })}
          </Box>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
            {completedSteps.length}/{steps.length} pasos completados
          </Text>
        </Box>
      )}
    </Box>
  );
}
