"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Box, Title, Text, Stack } from "@mantine/core";
import { IconCircleCheck, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  fontSize: 14, color: "#111827",
  backgroundColor: "#fafafa",
  border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600,
  color: "#6b7280", marginBottom: 6, display: "block",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Flujo PKCE: intercambiar código por sesión
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) { setError("El enlace de recuperación es inválido o ha expirado."); }
          else { setSessionReady(true); }
          setLoading(false);
        });
    } else {
      // Fallback: flujo implícito (tokens en hash)
      const hash = window.location.hash.slice(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) { setError("El enlace de recuperación es inválido o ha expirado."); }
            else { setSessionReady(true); }
            setLoading(false);
          });
      } else {
        setError("Enlace inválido. Solicita uno nuevo desde la página de inicio de sesión.");
        setLoading(false);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm_password") as string;

    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.replace("/dashboard"), 2000);
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
      <Box style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack align="center" gap={12}>
          <IconCircleCheck size={48} color="#16a34a" />
          <Title order={3}>Contraseña actualizada</Title>
          <Text style={{ color: "#6b7280", fontSize: 14 }}>Redirigiendo…</Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Box style={{ width: "100%", maxWidth: 400 }}>
        <Box mb={40}>
          <Text style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 12 }}>
            Fusión Startups
          </Text>
          <Title order={1} style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Nueva contraseña</Title>
        </Box>

        {!sessionReady ? (
          <Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <IconAlertCircle size={16} color="#ef4444" />
            <Text style={{ fontSize: 13, color: "#ef4444" }}>{error}</Text>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap={16}>
              <Box>
                <label style={labelStyle}>Nueva contraseña *</label>
                <input type="password" name="password" required minLength={8} placeholder="Mínimo 8 caracteres" style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Confirmar contraseña *</label>
                <input type="password" name="confirm_password" required minLength={8} placeholder="Repite la contraseña" style={inputStyle} />
              </Box>

              {error && (
                <Box style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                  <IconAlertCircle size={15} color="#ef4444" />
                  <Text style={{ fontSize: 13, color: "#ef4444" }}>{error}</Text>
                </Box>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", backgroundColor: "#16a34a", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}
              >
                Guardar contraseña
              </button>
            </Stack>
          </form>
        )}
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}
