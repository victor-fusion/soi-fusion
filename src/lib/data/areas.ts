import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { AREAS } from "@/constants/areas";
import type { Area } from "@/types";

/** Tag de caché: las Server Actions que editan áreas o secciones llaman a updateTag(AREAS_TAG). */
export const AREAS_TAG = "areas";

// Lanza en caso de error para que el fallback nunca quede cacheado.
const fetchAreas = unstable_cache(
  async (): Promise<Area[]> => {
    const supabase = createPublicClient();
    const [areasRes, sectionsRes] = await Promise.all([
      supabase.from("areas").select("id, name, color, sort_order").order("sort_order"),
      supabase.from("area_sections").select("id, area_id, name, sort_order").order("sort_order"),
    ]);
    if (areasRes.error) throw new Error(areasRes.error.message);

    return (areasRes.data ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      color: a.color,
      sections: (sectionsRes.data ?? [])
        .filter((s) => s.area_id === a.id)
        .map((s) => ({
          id: s.id,
          area_id: s.area_id,
          name: s.name,
          order: s.sort_order,
          cards: [],
        })),
    }));
  },
  ["areas"],
  { tags: [AREAS_TAG], revalidate: 3600 }
);

/**
 * Devuelve las áreas desde la BD (migración 013), cacheadas entre peticiones.
 * Si la tabla no existe o está vacía, usa los constants como fallback.
 */
export async function getAreas(): Promise<Area[]> {
  try {
    const areas = await fetchAreas();
    return areas.length > 0 ? areas : AREAS;
  } catch {
    return AREAS;
  }
}

/** Devuelve un mapa id → Area para lookups rápidos */
export async function getAreaMap(): Promise<Record<string, Area>> {
  const areas = await getAreas();
  return Object.fromEntries(areas.map((a) => [a.id, a]));
}
