import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/types";
import { AREAS } from "@/constants/areas";
import { RecursosClient } from "./_components/RecursosClient";

// Mapa section_id → area_id derivado de areas.ts
const SECTION_TO_AREA: Record<string, string> = {};
for (const area of AREAS) {
  for (const section of area.sections) {
    SECTION_TO_AREA[section.id] = area.id;
  }
}

export default async function RecursosAdminPage() {
  const supabase = await createClient();

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

  return <RecursosClient cards={cards} />;
}
