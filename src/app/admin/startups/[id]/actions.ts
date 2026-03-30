"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function changePhase(startupId: string, phase: number) {
  const supabase = await createClient();
  await supabase
    .from("startups")
    .update({ current_phase: phase })
    .eq("id", startupId);
  revalidatePath(`/admin/startups/${startupId}`);
  revalidatePath("/admin");
}

export async function changeEntregableStatus(
  entregableId: string,
  status: string,
  startupId: string
) {
  const supabase = await createClient();
  await supabase
    .from("entregables")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", entregableId);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function addEntregable(formData: FormData) {
  const supabase = await createClient();
  const startupId = formData.get("startup_id") as string;
  const title = formData.get("title") as string;
  const area = formData.get("area") as string;
  const phase = parseInt(formData.get("phase") as string, 10);

  if (!title?.trim() || !area || !phase) return;

  await supabase.from("entregables").insert({
    startup_id: startupId,
    title: title.trim(),
    area,
    phase,
    section: area,
    status: "pending",
  });

  revalidatePath(`/admin/startups/${startupId}`);
}

export async function deleteEntregable(entregableId: string, startupId: string) {
  const supabase = await createClient();
  await supabase.from("entregables").delete().eq("id", entregableId);
  revalidatePath(`/admin/startups/${startupId}`);
}
