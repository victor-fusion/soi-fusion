import { createClient } from "@/lib/supabase/server";
import { PHASES } from "@/constants/areas";

type Phase = { number: number; name: string; color: string };

/**
 * Devuelve las fases desde la BD (migración 013).
 * Si la tabla no existe o está vacía, usa los constants como fallback.
 */
export async function getPhases(): Promise<Phase[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("phases")
      .select("number, name, color")
      .order("number");

    if (error || !data || data.length === 0) return PHASES;

    return data.map((p) => ({ number: p.number, name: p.name, color: p.color }));
  } catch {
    return PHASES;
  }
}
