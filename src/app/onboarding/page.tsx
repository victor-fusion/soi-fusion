"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Text,
  Stack,
  Title,
  SimpleGrid,
  Avatar,
} from "@mantine/core";
import {
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle,
  IconCamera,
} from "@tabler/icons-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
  color: "#111827",
  backgroundColor: "#fafafa",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  marginBottom: 6,
  display: "block",
};

const DEDICATIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "puntual", label: "Puntual" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Procesa el token de invitación que Supabase pone en el hash de la URL
  // (ej: /onboarding#access_token=...&type=invite)
  // Usamos setSession() directamente con el token del hash para garantizar
  // que la sesión del invitado reemplaza cualquier sesión previa (ej: admin).
  useEffect(() => {
    const supabase = createClient();

    const hash = window.location.hash.slice(1); // quita el "#"
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      // Forzar la sesión del invitado, ignorando cualquier sesión previa
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error || !data.session) {
            setError(error?.message ?? "Token de invitación inválido o expirado.");
            setLoading(false);
            return;
          }
          setUserId(data.session.user.id);
          setLoading(false);
        });
    } else {
      // Acceso directo sin hash — verificar sesión normal
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) {
          router.replace("/login");
          return;
        }
        setUserId(data.user.id);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setIsUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${userId}.${ext}`, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path);
      setAvatarUrl(urlData.publicUrl);
    }
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const password = fd.get("password") as string;
    const confirmPassword = fd.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const supabase = createClient();

      // 1. Establecer contraseña definitiva
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) {
        setError(pwError.message);
        return;
      }

      // 2. Actualizar perfil con los datos del formulario
      const updates: Record<string, unknown> = {
        full_name:    fd.get("full_name") as string,
        role_title:   (fd.get("role_title") as string) || null,
        phone:        (fd.get("phone") as string) || null,
        linkedin_url: (fd.get("linkedin_url") as string) || null,
        dedication:   (fd.get("dedication") as string) || null,
      };
      if (avatarUrl) updates.avatar_url = avatarUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId!);

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 1500);
    });
  };

  if (loading) {
    return (
      <Box style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconLoader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#16a34a" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Box>
    );
  }

  if (done) {
    return (
      <Box style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
        <Stack align="center" gap={12}>
          <IconCircleCheck size={48} color="#16a34a" />
          <Title order={3} style={{ color: "#111827" }}>¡Todo listo!</Title>
          <Text style={{ color: "#6b7280", fontSize: 14 }}>Redirigiendo al panel…</Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Box style={{ width: "100%", maxWidth: 520, backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>

        {/* Header */}
        <Box style={{ backgroundColor: "#16a34a", padding: "32px 40px", textAlign: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: 600, color: "#bbf7d0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Fusión Startups
          </Text>
          <Title order={2} style={{ color: "#fff", fontWeight: 700, fontSize: 24 }}>
            Bienvenido/a al SOI
          </Title>
          <Text style={{ color: "#dcfce7", fontSize: 14, marginTop: 8 }}>
            Completa tu perfil para empezar
          </Text>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Box style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Avatar */}
            <Box style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Box style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={avatarUrl || undefined} size={72} radius="xl" style={{ backgroundColor: "#f3f4f6" }}>
                  {!avatarUrl && "?"}
                </Avatar>
                <label
                  style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", border: "2px solid #fff", backgroundColor: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: isUploading ? "wait" : "pointer" }}
                >
                  <IconCamera size={12} />
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
              </Box>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                {isUploading ? "Subiendo foto…" : "Añade una foto de perfil (opcional)"}
              </Text>
            </Box>

            {/* Datos personales */}
            <SimpleGrid cols={2} spacing={16}>
              <Box>
                <label style={labelStyle}>Nombre completo *</label>
                <input name="full_name" required placeholder="María García" style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Cargo en la startup</label>
                <input name="role_title" placeholder="CTO, Head of Sales…" style={inputStyle} />
              </Box>
            </SimpleGrid>

            <SimpleGrid cols={2} spacing={16}>
              <Box>
                <label style={labelStyle}>Teléfono</label>
                <input type="tel" name="phone" placeholder="+34 600 000 000" style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Dedicación</label>
                <select name="dedication" defaultValue="full-time" style={{ ...inputStyle, cursor: "pointer" }}>
                  {DEDICATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </Box>
            </SimpleGrid>

            <Box>
              <label style={labelStyle}>LinkedIn</label>
              <input type="url" name="linkedin_url" placeholder="https://linkedin.com/in/tu-perfil" style={inputStyle} />
            </Box>

            {/* Contraseña */}
            <Box style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                Establece tu contraseña
              </Text>
              <Stack gap={12}>
                <Box>
                  <label style={labelStyle}>Contraseña *</label>
                  <input type="password" name="password" required minLength={8} placeholder="Mínimo 8 caracteres" style={inputStyle} />
                </Box>
                <Box>
                  <label style={labelStyle}>Confirmar contraseña *</label>
                  <input type="password" name="confirm_password" required minLength={8} placeholder="Repite la contraseña" style={inputStyle} />
                </Box>
              </Stack>
            </Box>

            {error && (
              <Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                <IconAlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                <Text style={{ fontSize: 13, color: "#ef4444" }}>{error}</Text>
              </Box>
            )}

            <button
              type="submit"
              disabled={isPending || isUploading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 0", borderRadius: 8, border: "none", backgroundColor: "#16a34a", color: "#fff", fontSize: 15, fontWeight: 600, cursor: isPending ? "wait" : "pointer" }}
            >
              {isPending && <IconLoader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              Activar mi cuenta
            </button>
          </Box>
        </form>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}
