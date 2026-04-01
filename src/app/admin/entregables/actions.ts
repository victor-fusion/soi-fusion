"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTemplate(formData: FormData) {
  const supabase = await createClient();
  const fileSlotsRaw = (formData.get("file_slots") as string) || "[]";
  let fileSlots: unknown[] = [];
  try { fileSlots = JSON.parse(fileSlotsRaw); } catch { /* empty */ }

  await supabase.from("entregable_templates").insert({
    title:       formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    area:        formData.get("area") as string,
    section:     formData.get("section") as string,
    phase:       parseInt(formData.get("phase") as string, 10),
    order:       parseInt((formData.get("order") as string) || "0", 10),
    tipo:        (formData.get("tipo") as string) || "externo",
    file_slots:  fileSlots,
    is_active:   true,
  });

  revalidatePath("/admin/entregables");
}

export async function updateTemplate(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const fileSlotsRaw = (formData.get("file_slots") as string) || "[]";
  let fileSlots: unknown[] = [];
  try { fileSlots = JSON.parse(fileSlotsRaw); } catch { /* empty */ }

  await supabase.from("entregable_templates").update({
    title:       formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    area:        formData.get("area") as string,
    section:     formData.get("section") as string,
    phase:       parseInt(formData.get("phase") as string, 10),
    order:       parseInt((formData.get("order") as string) || "0", 10),
    tipo:        (formData.get("tipo") as string) || "externo",
    file_slots:  fileSlots,
  }).eq("id", id);

  revalidatePath("/admin/entregables");
}

export async function toggleTemplateActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  await supabase.from("entregable_templates").update({ is_active }).eq("id", id);
  revalidatePath("/admin/entregables");
}
