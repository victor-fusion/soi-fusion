"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Box, Title, Text, Stack } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  fontSize: 14, color: "#111827",
  backgroundColor: "#fafafa",
  border: "1px solid #e5e7eb",
  borderRadius: 8, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://soi.fusionstartups.com/reset-password",
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Box style={{ width: "100%", maxWidth: 400 }}>
        <Box mb={40}>
          <Text style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 12 }}>
            Fusión Startups
          </Text>
          <Title order={1} style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Recuperar contraseña</Title>
          <Text mt="xs" style={{ color: "#6b7280" }}>Te enviaremos un enlace para restablecer tu contraseña.</Text>
        </Box>

        {sent ? (
          <Stack align="center" gap={12} py={32}>
            <IconCircleCheck size={48} color="#16a34a" />
            <Text style={{ color: "#374151", fontWeight: 600 }}>Correo enviado</Text>
            <Text style={{ color: "#6b7280", fontSize: 14, textAlign: "center" }}>
              Si el email existe en el sistema recibirás un enlace de recuperación en tu bandeja de entrada.
            </Text>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Box>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8, display: "block" }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={inputStyle}
                />
              </Box>

              {error && (
                <Text style={{ fontSize: 13, color: "#ef4444" }}>{error}</Text>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", backgroundColor: "#16a34a", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}
              >
                {loading ? "Enviando…" : "Enviar enlace"}
              </button>

              <a href="/login" style={{ fontSize: 13, color: "#6b7280", textAlign: "center", display: "block", textDecoration: "none" }}>
                ← Volver al inicio de sesión
              </a>
            </Stack>
          </form>
        )}
      </Box>
    </Box>
  );
}
