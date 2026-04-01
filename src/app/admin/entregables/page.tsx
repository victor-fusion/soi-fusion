import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EntregableTemplate } from "@/types";
import { EntregablesClient } from "./_components/EntregablesClient";

export default async function EntregablesPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data } = await supabase
    .from("entregable_templates")
    .select("*")
    .order("phase")
    .order("order");

  const templates = (data ?? []) as EntregableTemplate[];

  return <EntregablesClient templates={templates} />;
}
