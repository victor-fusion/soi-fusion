import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PHASES } from "@/constants/areas";

type Phase = { number: number; name: string; color: string };

/** Tag de caché: las Server Actions que editan fases llaman a updateTag(PHASES_TAG). */
export const PHASES_TAG = "phases";

// Lanza en caso de error para que el fallback nunca quede cacheado.
const fetchPhases = unstable_cache(
  async (): Promise<Phase[]> => {
    const { data, error } = await createPublicClient()
      .from("phases")
      .select("number, name, color")
      .order("number");

    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({ number: p.number, name: p.name, color: p.color }));
  },
  ["phases"],
  { tags: [PHASES_TAG], revalidate: 3600 }
);

/**
 * Devuelve las fases desde la BD (migración 013), cacheadas entre peticiones.
 * Si la tabla no existe o está vacía, usa los constants como fallback.
 */
export async function getPhases(): Promise<Phase[]> {
  try {
    const phases = await fetchPhases();
    return phases.length > 0 ? phases : PHASES;
  } catch {
    return PHASES;
  }
}
