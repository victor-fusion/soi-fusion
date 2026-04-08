import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeccionesClient } from "./_components/SeccionesClient";

export default async function SeccionesPage() {
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
    .order("area_id")
    .order("sort_order");

  const areas = (areasData ?? []) as { id: string; name: string; color: string; sort_order: number }[];
  const sections = (sectionsData ?? []) as { id: string; area_id: string; name: string; sort_order: number }[];

  return <SeccionesClient areas={areas} sections={sections} />;
}
