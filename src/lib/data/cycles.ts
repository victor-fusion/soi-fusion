import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Cycle } from "@/types";

/** Tag de caché: las Server Actions que editan ciclos llaman a updateTag(CYCLES_TAG). */
export const CYCLES_TAG = "cycles";

// Lanza en caso de error para que un resultado vacío por fallo no quede cacheado.
const fetchCycles = unstable_cache(
  async (): Promise<Cycle[]> => {
    const { data, error } = await createPublicClient()
      .from("cycles")
      .select("number, name, start_date, end_date, is_active")
      .order("number");
    if (error) throw new Error(error.message);
    return (data ?? []) as Cycle[];
  },
  ["cycles"],
  { tags: [CYCLES_TAG], revalidate: 3600 }
);

/** Todos los ciclos, del 1 al último. */
export async function getCycles(): Promise<Cycle[]> {
  try {
    return await fetchCycles();
  } catch {
    return [];
  }
}

export { activeCycle, cycleLabel } from "@/lib/cycle-utils";
