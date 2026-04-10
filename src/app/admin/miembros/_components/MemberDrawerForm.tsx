"use client";

import { useState, useTransition, useRef } from "react";
import { Box, Text, SimpleGrid, Avatar } from "@mantine/core";
import { IconLoader2, IconCircleCheck, IconCamera } from "@tabler/icons-react";
import type { Profile, OfficeSchedule } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { inviteMiembro, updateMiembro } from "../actions";

interface Startup {
  id: string;
  name: string;
  batch: number;
}

interface MemberDrawerFormProps {
  member?: Profile;
  startups: Startup[];
  defaultStartupId?: string;
  onClose: () => void;
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

export function MemberDrawerForm({ member, startups, defaultStartupId, onClose }: MemberDrawerFormProps) {
  const isEdit = !!member;
  const [mode, setMode] = useState<"invitar" | "crear">("invitar");
  const [isPending, startTransition] = useTransition();
  const [schedule] = useState<OfficeSchedule>(member?.office_schedule ?? {});
  const [invitedCount, setInvitedCount] = useState(0);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(member?.avatar_url ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [tempMemberId] = useState(() => crypto.randomUUID());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const id = member?.id ?? tempMemberId;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${id}.${ext}`, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path);
      setAvatarUrl(urlData.publicUrl);
    }
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("office_schedule", JSON.stringify(schedule));

    if (!isEdit && mode === "invitar") {
      // Multi-email invite: send one invitation per line
      const emailsRaw = fd.get("emails") as string;
      const emails = emailsRaw
        .split(/[\n,;]/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"));

      if (emails.length === 0) return;

      setInviteError(null);
      startTransition(async () => {
        let count = 0;
        for (const email of emails) {
          const singleFd = new FormData();
          singleFd.set("email", email);
          singleFd.set("startup_id", fd.get("startup_id") as string);
          const result = await inviteMiembro(singleFd);
          if (result?.error) {
            setInviteError(`Error al invitar a ${email}: ${result.error}`);
            break;
          }
          count++;
        }
        setInvitedCount(count);
        if (count === emails.length) {
          setTimeout(onClose, 1500);
        }
      });
      return;
    }

    if (avatarUrl) fd.set("avatar_url", avatarUrl);
    startTransition(async () => {
      if (isEdit) {
        await updateMiembro(fd);
        onClose();
      } else {
        const result = await inviteMiembro(fd);
        if (result?.error) {
          setInviteError(result.error);
        } else {
          onClose();
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {isEdit && <input type="hidden" name="member_id" value={member.id} />}

        {/* Selector de modo (solo en creación) */}
        {!isEdit && (
          <Box>
            <Box style={{ display: "flex", gap: 0, borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              {(["invitar", "crear"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "9px 0",
                    fontSize: 13, fontWeight: 600,
                    border: "none", cursor: "pointer",
                    backgroundColor: mode === m ? "#111827" : "#fff",
                    color: mode === m ? "#fff" : "#6b7280",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "invitar" ? "Invitar por email" : "Crear manualmente"}
                </button>
              ))}
            </Box>
          </Box>
        )}

        {/* MODO INVITAR — forma simplificada */}
        {!isEdit && mode === "invitar" && (
          <>
            <Box>
              <label style={labelStyle}>Emails *</label>
              <textarea
                name="emails"
                required
                rows={4}
                placeholder={"maria@startup.com\npedro@empresa.io\nana@acme.co"}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                Uno por línea. Se enviará un email de invitación a cada dirección.
              </Text>
            </Box>

            <Box>
              <label style={labelStyle}>Startup (opcional)</label>
              <select
                name="startup_id"
                defaultValue={defaultStartupId ?? ""}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Sin startup asignada</option>
                {startups.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (Ciclo {s.batch})</option>
                ))}
              </select>
            </Box>

            {invitedCount > 0 && (
              <Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <IconCircleCheck size={16} color="#16a34a" />
                <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>
                  {invitedCount} {invitedCount === 1 ? "invitación enviada" : "invitaciones enviadas"}
                </Text>
              </Box>
            )}

            {inviteError && (
              <Box style={{ padding: "10px 14px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                <Text style={{ fontSize: 12, color: "#ef4444" }}>{inviteError}</Text>
              </Box>
            )}
          </>
        )}

        {/* MODO CREAR — formulario completo */}
        {!isEdit && mode === "crear" && (
          <>
            {/* Foto de perfil */}
            <Box style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Box style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={avatarUrl || undefined} size={64} radius="xl" style={{ backgroundColor: "#f3f4f6" }}>
                  {!avatarUrl && "?"}
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", border: "2px solid #fff", backgroundColor: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: isUploading ? "wait" : "pointer", padding: 0 }}
                >
                  <IconCamera size={11} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: "none" }} />
              </Box>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                {isUploading ? "Subiendo…" : "Foto de perfil (opcional)"}
              </Text>
            </Box>

            <Box>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="email" required placeholder="nombre@ejemplo.com" style={inputStyle} />
            </Box>
            <SimpleGrid cols={2} spacing={16}>
              <Box>
                <label style={labelStyle}>Nombre *</label>
                <input name="first_name" required placeholder="María" style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Apellidos</label>
                <input name="last_name" placeholder="García López" style={inputStyle} />
              </Box>
            </SimpleGrid>

            <Box>
              <label style={labelStyle}>Cargo</label>
              <input name="role_title" placeholder="CTO, Head of Sales…" style={inputStyle} />
            </Box>
            <Box>
              <label style={labelStyle}>Startup</label>
              <select name="startup_id" defaultValue={defaultStartupId ?? ""} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Sin startup asignada</option>
                {startups.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (Ciclo {s.batch})</option>
                ))}
              </select>
            </Box>
            <SimpleGrid cols={2} spacing={16}>
              <Box>
                <label style={labelStyle}>Tipo</label>
                <select name="member_type" defaultValue="cofundador" style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Sin tipo</option>
                  {MEMBER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Box>
              <Box>
                <label style={labelStyle}>Dedicación</label>
                <select name="dedication" defaultValue="full-time" style={{ ...inputStyle, cursor: "pointer" }}>
                  {DEDICATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </Box>
            </SimpleGrid>
          </>
        )}

        {/* MODO EDICIÓN — formulario completo */}
        {isEdit && (
          <>
            <SimpleGrid cols={2} spacing={16}>
              <Box>
                <label style={labelStyle}>Nombre</label>
                <input name="first_name" defaultValue={member.first_name ?? ""} placeholder="María" style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Apellidos</label>
                <input name="last_name" defaultValue={member.last_name ?? ""} placeholder="García López" style={inputStyle} />
              </Box>
            </SimpleGrid>

            <Box>
              <label style={labelStyle}>Cargo</label>
              <input name="role_title" defaultValue={member.role_title ?? ""} placeholder="CTO, Head of Sales…" style={inputStyle} />
            </Box>

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
                <select name="dedication" defaultValue={member.dedication ?? "full-time"} style={{ ...inputStyle, cursor: "pointer" }}>
                  {DEDICATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </Box>
            </SimpleGrid>

            <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                Contacto
              </Text>
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
          </>
        )}

        {/* Botones */}
        <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}>
            {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {isEdit ? "Guardar cambios" : mode === "invitar" ? "Enviar invitación" : "Crear miembro"}
          </button>
        </Box>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
