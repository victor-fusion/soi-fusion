import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Recalcula las fechas límite de los entregables de una startup a partir del
 * inicio de su ciclo: fase N = inicio + N × 30 días.
 */
export async function recomputeDeadlines(db: SupabaseClient, startupId: string, cycleStart: string) {
  for (let phase = 1; phase <= 6; phase++) {
    const deadline = new Date(cycleStart);
    deadline.setDate(deadline.getDate() + phase * 30);
    const { error } = await db
      .from("entregables")
      .update({ deadline: deadline.toISOString().split("T")[0] })
      .eq("startup_id", startupId)
      .eq("phase", phase);
    if (error) throw new Error(error.message);
  }
}
