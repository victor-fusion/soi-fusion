import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/types";
import { getAreas } from "@/lib/data/areas";
import { RecursosClient } from "./_components/RecursosClient";

export default async function RecursosAdminPage() {
  const supabase = await createClient();
  const areas = await getAreas();

  // Mapa section_id → area_id
  const SECTION_TO_AREA: Record<string, string> = {};
  for (const area of areas) {
    for (const section of area.sections) {
      SECTION_TO_AREA[section.id] = area.id;
    }
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Admin puede ver todas las tarjetas (activas e inactivas)
  const { data } = await supabase
    .from("cards")
    .select("*")
    .order("section_id")
    .order("order");

  const cards = ((data ?? []) as Card[]).map((c) => ({
    ...c,
    area_id: SECTION_TO_AREA[c.section_id] ?? "",
  }));

  return <RecursosClient cards={cards} areas={areas} />;
}
