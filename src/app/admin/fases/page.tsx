import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FasesClient } from "./_components/FasesClient";

export default async function FasesPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data } = await supabase
    .from("phases")
    .select("id, number, name, color")
    .order("number");

  return <FasesClient phases={data ?? []} />;
}
