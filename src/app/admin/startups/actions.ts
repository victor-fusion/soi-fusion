"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createStartup(formData: FormData) {
  const adminSupabase = createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const type = formData.get("type") as string;

  if (!name || !type) return;

  const batch = parseInt((formData.get("batch") as string) || "5", 10);

  const { error } = await adminSupabase.from("startups").insert({
    name,
    sector: sector || null,
    tagline: tagline || null,
    type,
    status: "activa",
    current_phase: 1,
    batch,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/startups");
  revalidatePath("/admin");
}
