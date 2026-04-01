import { createClient } from "@supabase/supabase-js";

// Cliente con service role — solo usar en Server Actions/Route Handlers
// Bypasa RLS y permite llamar a auth.admin (invitar usuarios, etc.)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Faltan variables de entorno: SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
