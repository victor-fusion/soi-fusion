import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAreas } from "@/lib/data/areas";
import { getPhases } from "@/lib/data/phases";
import type { EntregableTemplate } from "@/types";
import { EntregablesClient } from "./_components/EntregablesClient";

export default async function EntregablesPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [areas, phases] = await Promise.all([getAreas(), getPhases()]);

  const { data } = await supabase
    .from("entregable_templates")
    .select("*")
    .order("phase")
    .order("order");

  const templates = (data ?? []) as EntregableTemplate[];

  return <EntregablesClient templates={templates} areas={areas} phases={phases} />;
}
