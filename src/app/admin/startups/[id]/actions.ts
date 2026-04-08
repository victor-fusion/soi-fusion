"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateStartup(formData: FormData) {
  const supabase = await createClient();
  const startupId = formData.get("startup_id") as string;
  const cycleStartDate = (formData.get("cycle_start_date") as string) || null;

  const { error } = await supabase.from("startups").update({
    name:             formData.get("name") as string,
    logo_url:         (formData.get("logo_url") as string) || null,
    tagline:          (formData.get("tagline") as string) || null,
    sector:           (formData.get("sector") as string) || null,
    type:             formData.get("type") as string,
    status:           formData.get("status") as string,
    batch:            parseInt(formData.get("batch") as string, 10),
    cycle_start_date: cycleStartDate,
  }).eq("id", startupId);

  if (error) throw new Error(error.message);

  // Recalcular deadlines de entregables si hay fecha de inicio
  if (cycleStartDate) {
    for (let phase = 1; phase <= 6; phase++) {
      const deadline = new Date(cycleStartDate);
      deadline.setDate(deadline.getDate() + phase * 30);
      await supabase
        .from("entregables")
        .update({ deadline: deadline.toISOString().split("T")[0] })
        .eq("startup_id", startupId)
        .eq("phase", phase);
    }
  }

  revalidatePath(`/admin/startups/${startupId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/startups");
}

export async function changePhase(startupId: string, phase: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("startups")
    .update({ current_phase: phase })
    .eq("id", startupId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
  revalidatePath("/admin");
}

export async function changeEntregableStatus(
  entregableId: string,
  status: string,
  startupId: string,
  reviewerNotes?: string
) {
  const supabase = await createClient();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (reviewerNotes !== undefined) update.reviewer_notes = reviewerNotes;
  const { error } = await supabase
    .from("entregables")
    .update(update)
    .eq("id", entregableId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
  revalidatePath(`/dashboard/entregables/${entregableId}`);
  revalidatePath("/dashboard");
}

export async function addEntregable(formData: FormData) {
  const supabase = await createClient();
  const startupId = formData.get("startup_id") as string;
  const title = formData.get("title") as string;
  const area = formData.get("area") as string;
  const phase = parseInt(formData.get("phase") as string, 10);

  if (!title?.trim() || !area || !phase) return;

  const tipo = (formData.get("tipo") as string) || "externo";
  const fileSlotsRaw = (formData.get("file_slots") as string) || "[]";
  let fileSlots: unknown[] = [];
  try { fileSlots = JSON.parse(fileSlotsRaw); } catch { /* empty */ }

  const { error } = await supabase.from("entregables").insert({
    startup_id: startupId,
    title: title.trim(),
    area,
    phase,
    section: area,
    status: "pendiente",
    tipo,
    file_slots: fileSlots,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function deleteEntregable(entregableId: string, startupId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("entregables").delete().eq("id", entregableId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}
