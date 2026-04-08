"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, SimpleGrid, Text } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";
import type { Profile } from "@/types";
import { updateMiembro, deleteMiembro } from "../../actions";

interface Startup {
  id: string;
  name: string;
  batch: number;
}

interface MemberEditClientProps {
  member: Profile;
  startups: Startup[];
}

const MEMBER_TYPES = [
  { value: "cofundador",  label: "Cofundador" },
  { value: "empleado",    label: "Empleado" },
  { value: "advisor",     label: "Advisor" },
  { value: "becario",     label: "Becario" },
  { value: "contratista", label: "Contratista" },
];

const DEDICATIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "puntual",   label: "Puntual" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  fontSize: 14, color: "#374151",
  backgroundColor: "#fafafa",
  border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600,
  color: "#6b7280", marginBottom: 6, display: "block",
};

export function MemberEditClient({ member, startups }: MemberEditClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("office_schedule", JSON.stringify(member.office_schedule ?? {}));
    startTransition(async () => {
      await updateMiembro(fd);
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar completamente a ${member.full_name}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteMiembro(member.id);
      router.push("/admin/miembros");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <input type="hidden" name="member_id" value={member.id} />

        <SimpleGrid cols={2} spacing={16}>
          <Box>
            <label style={labelStyle}>Nombre completo *</label>
            <input name="full_name" required defaultValue={member.full_name} style={inputStyle} />
          </Box>
          <Box>
            <label style={labelStyle}>Cargo</label>
            <input name="role_title" defaultValue={member.role_title ?? ""} placeholder="CTO, Head of Sales…" style={inputStyle} />
          </Box>
        </SimpleGrid>

        <Box>
          <label style={labelStyle}>Startup</label>
          <select name="startup_id" defaultValue={member.startup_id ?? ""} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">Sin startup asignada</option>
            {startups.map((s) => (
              <option key={s.id} value={s.id}>{s.name} (Ciclo {s.batch})</option>
            ))}
          </select>
        </Box>

        <SimpleGrid cols={2} spacing={16}>
          <Box>
            <label style={labelStyle}>Tipo</label>
            <select name="member_type" defaultValue={member.member_type ?? ""} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Sin tipo</option>
              {MEMBER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Box>
          <Box>
            <label style={labelStyle}>Dedicación</label>
            <select name="dedication" defaultValue={member.dedication ?? ""} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Sin especificar</option>
              {DEDICATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Box>
        </SimpleGrid>

        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Contacto</Text>
          <SimpleGrid cols={2} spacing={16}>
            <Box>
              <label style={labelStyle}>Teléfono</label>
              <input type="tel" name="phone" defaultValue={member.phone ?? ""} placeholder="+34 600 000 000" style={inputStyle} />
            </Box>
            <Box>
              <label style={labelStyle}>LinkedIn</label>
              <input type="url" name="linkedin_url" defaultValue={member.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." style={inputStyle} />
            </Box>
          </SimpleGrid>
        </Box>

        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 500 }}
          >
            Eliminar miembro
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}
          >
            {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            Guardar cambios
          </button>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
