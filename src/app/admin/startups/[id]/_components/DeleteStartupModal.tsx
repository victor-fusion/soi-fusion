"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group } from "@mantine/core";
import {
  IconTrash, IconX, IconLoader2, IconAlertTriangle,
  IconUsers, IconChecklist, IconAddressBook,
} from "@tabler/icons-react";
import { deleteStartup } from "../delete-action";

interface Counts {
  members: number;
  entregables: number;
  contacts: number;
}

interface DeleteStartupModalProps {
  startupId: string;
  startupName: string;
  counts: Counts;
}

export function DeleteStartupModal({ startupId, startupName, counts }: DeleteStartupModalProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [keepMembers, setKeepMembers] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteStartup(startupId, {
        deleteMembers: !keepMembers,
        deleteEntregables: true,
        deleteContacts: true,
      });
    });
  };

  const canConfirm = confirm.trim().toLowerCase() === startupName.trim().toLowerCase();

  const CATEGORIES = [
    {
      key: "entregables",
      icon: IconChecklist,
      label: "Entregables",
      count: counts.entregables,
      alwaysDeleted: true,
      note: "Se eliminan siempre al borrar la startup.",
    },
    {
      key: "contacts",
      icon: IconAddressBook,
      label: "Contactos CRM",
      count: counts.contacts,
      alwaysDeleted: true,
      note: "Se eliminan siempre al borrar la startup.",
    },
    {
      key: "members",
      icon: IconUsers,
      label: "Miembros del equipo",
      count: counts.members,
      alwaysDeleted: false,
      note: keepMembers
        ? "Los miembros quedarán sin startup asignada."
        : "Se eliminarán permanentemente.",
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Eliminar startup"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 34, height: 34, borderRadius: 8,
          border: "1px solid #fecaca", backgroundColor: "#fff",
          color: "#ef4444", cursor: "pointer",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <IconTrash size={16} />
      </button>

      {open && (
        <Box
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !isPending) setOpen(false); }}
        >
          <Box
            style={{
              backgroundColor: "#fff", borderRadius: 16,
              width: "100%", maxWidth: 520,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header */}
            <Box style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
            }}>
              <Group gap={10}>
                <Box style={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: "#fef2f2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconAlertTriangle size={16} color="#ef4444" />
                </Box>
                <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                  Eliminar startup
                </Text>
              </Group>
              {!isPending && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex" }}
                >
                  <IconX size={18} />
                </button>
              )}
            </Box>

            <Box style={{ padding: 24 }}>
              <Text style={{ fontSize: 14, color: "#374151", marginBottom: 20, lineHeight: 1.6 }}>
                Vas a eliminar <strong>{startupName}</strong>. Esta acción no se puede deshacer.
              </Text>

              {/* Qué se borrará */}
              <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Qué ocurre con cada elemento
              </Text>
              <Box
                style={{
                  borderRadius: 10, border: "1px solid #f3f4f6",
                  overflow: "hidden", marginBottom: 20,
                }}
              >
                {CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon;
                  const isLast = i === CATEGORIES.length - 1;
                  const willDelete = cat.alwaysDeleted || (cat.key === "members" && !keepMembers);

                  return (
                    <Box
                      key={cat.key}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px",
                        borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                        backgroundColor: willDelete ? "#fef9f9" : "#f9fffe",
                      }}
                    >
                      <Icon size={16} color={willDelete ? "#ef4444" : "#16a34a"} style={{ flexShrink: 0 }} />
                      <Box style={{ flex: 1 }}>
                        <Group gap={8}>
                          <Text style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                            {cat.label}
                          </Text>
                          {cat.count > 0 && (
                            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                              {cat.count} {cat.count === 1 ? "registro" : "registros"}
                            </Text>
                          )}
                        </Group>
                        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                          {cat.note}
                        </Text>
                      </Box>

                      {/* Solo miembros es configurable */}
                      {cat.key === "members" && cat.count > 0 && (
                        <button
                          type="button"
                          onClick={() => setKeepMembers(!keepMembers)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${keepMembers ? "#16a34a" : "#ef4444"}`,
                            backgroundColor: keepMembers ? "#f0fdf4" : "#fef2f2",
                            color: keepMembers ? "#16a34a" : "#ef4444",
                            fontSize: 12, fontWeight: 600,
                            transition: "all 0.15s", flexShrink: 0,
                          }}
                        >
                          {keepMembers ? "Conservar" : "Eliminar"}
                        </button>
                      )}

                      {cat.alwaysDeleted && (
                        <Text style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, flexShrink: 0 }}>
                          Se elimina
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Confirmación */}
              <Box mb={20}>
                <Text style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Escribe <strong>{startupName}</strong> para confirmar:
                </Text>
                <input
                  type="text"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={startupName}
                  style={{
                    width: "100%", padding: "9px 12px",
                    fontSize: 14, color: "#374151",
                    border: `1px solid ${canConfirm ? "#16a34a" : "#e5e7eb"}`,
                    borderRadius: 8, outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                    transition: "border-color 0.15s",
                    backgroundColor: canConfirm ? "#f0fdf4" : "#fff",
                  }}
                  disabled={isPending}
                />
              </Box>

              {/* Botones */}
              <Group justify="flex-end" gap={8}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  style={{
                    padding: "9px 18px", borderRadius: 8,
                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                    color: "#6b7280", fontSize: 13, fontWeight: 500,
                    cursor: isPending ? "default" : "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canConfirm || isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 20px", borderRadius: 8, border: "none",
                    backgroundColor: canConfirm && !isPending ? "#ef4444" : "#f3f4f6",
                    color: canConfirm && !isPending ? "#fff" : "#9ca3af",
                    fontSize: 13, fontWeight: 600,
                    cursor: canConfirm && !isPending ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}
                >
                  {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  {isPending ? "Eliminando…" : "Eliminar definitivamente"}
                </button>
              </Group>
            </Box>
          </Box>
        </Box>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
