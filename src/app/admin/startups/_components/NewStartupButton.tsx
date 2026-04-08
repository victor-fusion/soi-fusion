"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { StartupForm } from "./StartupForm";

export function NewStartupButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 8,
          border: "none", backgroundColor: "#111827",
          color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <IconPlus size={15} />
        Nueva startup
      </button>
      <SlideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva startup"
        subtitle="Se asignarán automáticamente todos los entregables del ciclo"
      >
        {open && <StartupForm onClose={() => setOpen(false)} />}
      </SlideDrawer>
    </>
  );
}
