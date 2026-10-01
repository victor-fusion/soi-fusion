import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Startup } from "@/types";

export type CurrentProfile = Profile & { startups: Startup | null };

/**
 * Perfil del usuario conectado con su startup. Memoizado por petición (React cache):
 * layout y página lo comparten y solo se consulta una vez.
 * Devuelve null si no hay sesión o no existe el perfil.
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*, startups!fk_profiles_startup(*)")
    .eq("id", session.user.id)
    .single();

  return (data as CurrentProfile | null) ?? null;
});
