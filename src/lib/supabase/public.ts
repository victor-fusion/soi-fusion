import { createClient } from "@supabase/supabase-js";

/**
 * Cliente sin sesión (rol anon) para datos de lectura pública, como fases y áreas.
 * No usa cookies, así que se puede usar dentro de funciones cacheadas entre peticiones.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
