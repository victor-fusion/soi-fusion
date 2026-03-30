"use client";

import { useActionState } from "react";
import { login } from "./actions";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Box,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Box style={{ width: "100%", maxWidth: 400 }}>

        {/* Wordmark */}
        <Box mb={48}>
          <Text
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#16a34a",
              marginBottom: "12px",
            }}
          >
            Fusión Startups
          </Text>
          <Title order={1} style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
            Bienvenido al SOI
          </Title>
          <Text mt="xs" style={{ color: "#6b7280", fontSize: "1rem" }}>
            Tu sistema operativo inteligente
          </Text>
        </Box>

        {/* Form */}
        <form action={action}>
          <Stack gap="lg">
            <TextInput
              label="Email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              size="md"
              styles={{
                input: {
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#fafafa",
                  "&:focus": { borderColor: "#16a34a", backgroundColor: "#fff" },
                },
              }}
            />

            <PasswordInput
              label="Contraseña"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              size="md"
              styles={{
                input: {
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#fafafa",
                },
              }}
            />

            {state?.error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                radius="md"
                variant="light"
              >
                {state.error}
              </Alert>
            )}

            <Button
              type="submit"
              loading={isPending}
              color="green"
              size="md"
              fullWidth
              mt="xs"
              style={{ fontWeight: 600 }}
            >
              Entrar →
            </Button>
          </Stack>
        </form>

        <Text
          mt={32}
          style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center" }}
        >
          ¿Problemas para acceder? Contacta con el equipo de Fusión.
        </Text>
      </Box>
    </Box>
  );
}
