"use client";

import { useTransition } from "react";
import { toggleRecursoActive } from "../actions";

interface RecursoToggleProps {
  id: string;
  isActive: boolean;
}

export function RecursoToggle({ id, isActive }: RecursoToggleProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        startTransition(async () => {
          await toggleRecursoActive(id, !isActive);
        });
      }}
      disabled={isPending}
      title={isActive ? "Desactivar" : "Activar"}
      style={{
        width: 36, height: 20, borderRadius: 10,
        backgroundColor: isPending ? "#e5e7eb" : isActive ? "#16a34a" : "#e5e7eb",
        border: "none", cursor: isPending ? "wait" : "pointer",
        position: "relative", flexShrink: 0,
        transition: "background-color 0.2s",
      }}
    >
      <span
        style={{
          position: "absolute", top: 2,
          left: isActive ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}
