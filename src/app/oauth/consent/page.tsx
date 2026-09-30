import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Box, Title, Text, Stack, Group, Alert } from "@mantine/core";
import { IconPlugConnected, IconAlertCircle } from "@tabler/icons-react";
import { decideAuthorization } from "./actions";

const buttonStyle: React.CSSProperties = {
  flex: 1, padding: "10px 16px", borderRadius: 8,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
};

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string; error?: string }>;
}) {
  const { authorization_id: authorizationId, error: decisionError } = await searchParams;
  if (!authorizationId) redirect("/");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`);
  }

  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  // Consentimiento ya dado anteriormente: volver directamente a la app
  if (data && !("client" in data)) redirect(data.redirect_url);
  const details = !error && data && "client" in data ? data : null;

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Box style={{ width: "100%", maxWidth: 420 }}>
        <Text style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 12 }}>
          Fusión Startups
        </Text>

        {!details ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md" variant="light">
            Esta solicitud de conexión no es válida o ha caducado. Vuelve a conectar desde la aplicación.
          </Alert>
        ) : (
          <Stack gap="lg">
            <Group gap={12}>
              <IconPlugConnected size={28} color="#16a34a" />
              <Title order={1} style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>
                Conectar {details.client.name || "una aplicación"} con SOI
              </Title>
            </Group>

            <Text style={{ color: "#374151", fontSize: 15 }}>
              <strong>{details.client.name || "Esta aplicación"}</strong> podrá consultar la información del SOI
              en tu nombre, con los mismos permisos que tienes en la plataforma ({user.email}).
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>
              Podrá leer datos de startups, entregables, métricas y equipo y, si tu cuenta tiene permiso de escritura,
              registrar cambios en tu nombre. Puedes revocar el acceso cuando quieras.
            </Text>

            {decisionError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md" variant="light">
                No se pudo completar la autorización. Inténtalo de nuevo.
              </Alert>
            )}

            <form action={decideAuthorization}>
              <input type="hidden" name="authorization_id" value={details.authorization_id} />
              <Group gap={8}>
                <button
                  type="submit" name="decision" value="deny"
                  style={{ ...buttonStyle, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#6b7280" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit" name="decision" value="approve"
                  style={{ ...buttonStyle, border: "none", backgroundColor: "#16a34a", color: "#fff" }}
                >
                  Permitir acceso
                </button>
              </Group>
            </form>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
