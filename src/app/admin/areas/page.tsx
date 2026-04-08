import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AreasClient } from "./_components/AreasClient";

export default async function AreasPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: areasData } = await supabase
    .from("areas")
    .select("id, name, color, sort_order")
    .order("sort_order");

  const { data: sectionsData } = await supabase
    .from("area_sections")
    .select("id, area_id, name, sort_order")
    .order("sort_order");

  const areas = (areasData ?? []).map((a) => ({
    ...a,
    sections: (sectionsData ?? []).filter((s) => s.area_id === a.id),
  }));

  return <AreasClient areas={areas} />;
}
