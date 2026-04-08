import { createClient } from "@/lib/supabase/server";
import { AREAS } from "@/constants/areas";
import type { Area } from "@/types";

/**
 * Devuelve las áreas desde la BD (migración 013).
 * Si la tabla no existe o está vacía, usa los constants como fallback.
 */
export async function getAreas(): Promise<Area[]> {
  try {
    const supabase = await createClient();

    const { data: areasData, error } = await supabase
      .from("areas")
      .select("id, name, color, sort_order")
      .order("sort_order");

    if (error || !areasData || areasData.length === 0) return AREAS;

    const { data: sectionsData } = await supabase
      .from("area_sections")
      .select("id, area_id, name, sort_order")
      .order("sort_order");

    return areasData.map((a) => ({
      id: a.id,
      name: a.name,
      color: a.color,
      sections: (sectionsData ?? [])
        .filter((s) => s.area_id === a.id)
        .map((s) => ({
          id: s.id,
          area_id: s.area_id,
          name: s.name,
          order: s.sort_order,
          cards: [],
        })),
    }));
  } catch {
    return AREAS;
  }
}

/** Devuelve un mapa id → Area para lookups rápidos */
export async function getAreaMap(): Promise<Record<string, Area>> {
  const areas = await getAreas();
  return Object.fromEntries(areas.map((a) => [a.id, a]));
}
