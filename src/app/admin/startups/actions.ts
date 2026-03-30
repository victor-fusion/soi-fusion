"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStartup(formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim();
  const type = formData.get("type") as string;

  if (!name || !type) return;

  await supabase.from("startups").insert({
    name,
    sector: sector || null,
    type,
    status: "activa",
    current_phase: 1,
    progress: 0,
    batch: 5,
  });

  revalidatePath("/admin/startups");
  revalidatePath("/admin");
}
