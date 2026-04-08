"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── ÁREAS ───────────────────────────────────────────────────────────────────

export async function createArea(formData: FormData) {
  const supabase = await createClient();
  const id   = (formData.get("id") as string).toLowerCase().trim().replace(/\s+/g, "_");
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;

  const { data: maxOrder } = await supabase
    .from("areas")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase
    .from("areas")
    .insert({ id, name, color, sort_order: (maxOrder?.sort_order ?? 0) + 1 });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/areas");
}

export async function updateArea(formData: FormData) {
  const supabase = await createClient();
  const id    = formData.get("id") as string;
  const name  = formData.get("name") as string;
  const color = formData.get("color") as string;

  const { error } = await supabase
    .from("areas")
    .update({ name, color })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/areas");
}

export async function deleteArea(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("areas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/areas");
}

// ─── SECCIONES ───────────────────────────────────────────────────────────────

export async function createSection(formData: FormData) {
  const supabase = await createClient();
  const area_id = formData.get("area_id") as string;
  const id      = (formData.get("id") as string).toLowerCase().trim().replace(/\s+/g, "_");
  const name    = formData.get("name") as string;

  const { data: maxOrder } = await supabase
    .from("area_sections")
    .select("sort_order")
    .eq("area_id", area_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase
    .from("area_sections")
    .insert({ id, area_id, name, sort_order: (maxOrder?.sort_order ?? 0) + 1 });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/areas");
}

export async function updateSection(formData: FormData) {
  const supabase = await createClient();
  const id      = formData.get("id") as string;
  const area_id = formData.get("area_id") as string;
  const name    = formData.get("name") as string;

  const { error } = await supabase
    .from("area_sections")
    .update({ name })
    .eq("id", id)
    .eq("area_id", area_id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/areas");
}

export async function deleteSection(id: string, area_id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("area_sections")
    .delete()
    .eq("id", id)
    .eq("area_id", area_id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/areas");
}

// ─── REORDENACIÓN ────────────────────────────────────────────────────────────

export async function reorderAreas(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("areas").update({ sort_order: index + 1 }).eq("id", id)
    )
  );
  revalidatePath("/admin/areas");
  revalidatePath("/admin/secciones");
}

export async function reorderSections(orderedIds: Array<{ id: string; area_id: string }>) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map(({ id, area_id }, index) =>
      supabase.from("area_sections").update({ sort_order: index + 1 }).eq("id", id).eq("area_id", area_id)
    )
  );
  revalidatePath("/admin/areas");
  revalidatePath("/admin/secciones");
}
