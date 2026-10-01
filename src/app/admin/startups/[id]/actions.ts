"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recomputeDeadlines } from "@/lib/data/deadlines";

export async function updateStartup(formData: FormData) {
  const supabase = await createClient();
  const startupId = formData.get("startup_id") as string;
  const cycleStartDate = (formData.get("cycle_start_date") as string) || null;

  const update: Record<string, unknown> = {
    name:             formData.get("name") as string,
    logo_url:         (formData.get("logo_url") as string) || null,
    web_url:          (formData.get("web_url") as string) || null,
    tagline:          (formData.get("tagline") as string) || null,
    sector:           (formData.get("sector") as string) || null,
    type:             formData.get("type") as string,
    status:           formData.get("status") as string,
    batch:            parseInt(formData.get("batch") as string, 10),
    cycle_start_date: cycleStartDate,
  };
  // Solo el formulario de la ficha tiene responsable: el drawer del listado no debe borrarlo
  if (formData.has("fusion_owner_id")) {
    update.fusion_owner_id = (formData.get("fusion_owner_id") as string) || null;
  }

  const { error } = await supabase.from("startups").update(update).eq("id", startupId);
  if (error) throw new Error(error.message);

  // Recalcular deadlines de entregables si hay fecha de inicio
  if (cycleStartDate) await recomputeDeadlines(supabase, startupId, cycleStartDate);

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

// ─── Métricas mensuales ──────────────────────────────────────────────────────

const METRIC_FIELDS = [
  "revenue", "mrr", "paying_customers", "active_users",
  "pipeline_value", "burn_rate", "runway_months",
] as const;

/** Crea o actualiza las métricas de un mes (una fila por startup y mes). */
export async function saveMetrics(formData: FormData) {
  const supabase = await createClient();
  const startupId = formData.get("startup_id") as string;
  const month = formData.get("period") as string; // YYYY-MM

  const row: Record<string, unknown> = {
    startup_id: startupId,
    period: `${month}-01`,
    notes: (formData.get("notes") as string) || null,
  };
  for (const f of METRIC_FIELDS) {
    const v = formData.get(f) as string;
    row[f] = v === "" || v === null ? null : Number(v);
  }

  const { error } = await supabase
    .from("startup_metrics")
    .upsert(row, { onConflict: "startup_id,period" });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function deleteMetrics(metricId: string, startupId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("startup_metrics").delete().eq("id", metricId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

// ─── Weeklies ────────────────────────────────────────────────────────────────

export async function createWeekly(formData: FormData) {
  const supabase = await createClient();
  const startupId = formData.get("startup_id") as string;

  const agenda = ((formData.get("agenda") as string) || "")
    .split("\n").map((l) => l.trim()).filter(Boolean);

  let actionItems: unknown[] = [];
  try { actionItems = JSON.parse((formData.get("action_items") as string) || "[]"); } catch { /* empty */ }

  const { error } = await supabase.from("weeklies").insert({
    startup_id: startupId,
    date: formData.get("date") as string,
    agenda,
    action_items: actionItems,
    notes: (formData.get("notes") as string) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function toggleActionItem(weeklyId: string, itemId: string, startupId: string) {
  const supabase = await createClient();
  const { data, error: readError } = await supabase
    .from("weeklies").select("action_items").eq("id", weeklyId).single();
  if (readError) throw new Error(readError.message);

  const items = ((data?.action_items ?? []) as { id: string; done: boolean }[])
    .map((i) => (i.id === itemId ? { ...i, done: !i.done } : i));

  const { error } = await supabase.from("weeklies").update({ action_items: items }).eq("id", weeklyId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function deleteWeekly(weeklyId: string, startupId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("weeklies").delete().eq("id", weeklyId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}
