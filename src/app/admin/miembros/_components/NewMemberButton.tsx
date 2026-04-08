"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { MemberDrawerForm } from "./MemberDrawerForm";

interface Startup {
  id: string;
  name: string;
  batch: number;
}

interface NewMemberButtonProps {
  startups: Startup[];
}

export function NewMemberButton({ startups }: NewMemberButtonProps) {
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
        Nuevo miembro
      </button>

      <SlideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo miembro"
        subtitle="Invitar o crear un miembro del equipo"
      >
        {open && (
          <MemberDrawerForm
            startups={startups}
            onClose={() => setOpen(false)}
          />
        )}
      </SlideDrawer>
    </>
  );
}
