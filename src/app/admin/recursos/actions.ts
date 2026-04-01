"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRecurso(formData: FormData) {
  const supabase = await createClient();

  // Asegurar que existe la sección
  const sectionId = formData.get("section_id") as string;

  const templateFieldsRaw = (formData.get("template_fields") as string) || "[]";
  let templateFields: unknown[] = [];
  try { templateFields = JSON.parse(templateFieldsRaw); } catch { /* empty */ }

  // Obtener el order máximo de la sección
  const { data: maxRow } = await supabase
    .from("cards")
    .select("order")
    .eq("section_id", sectionId)
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = maxRow ? (maxRow.order as number) + 1 : 0;

  await supabase.from("cards").insert({
    section_id:       sectionId,
    title:            formData.get("title") as string,
    description:      (formData.get("description") as string) || null,
    type:             formData.get("type") as string,
    content:          (formData.get("content") as string) || null,
    url:              (formData.get("url") as string) || null,
    template_fields:  templateFields,
    order:            nextOrder,
    is_active:        true,
  });

  revalidatePath("/admin/recursos");
}

export async function updateRecurso(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const templateFieldsRaw = (formData.get("template_fields") as string) || "[]";
  let templateFields: unknown[] = [];
  try { templateFields = JSON.parse(templateFieldsRaw); } catch { /* empty */ }

  await supabase.from("cards").update({
    section_id:      formData.get("section_id") as string,
    title:           formData.get("title") as string,
    description:     (formData.get("description") as string) || null,
    type:            formData.get("type") as string,
    content:         (formData.get("content") as string) || null,
    url:             (formData.get("url") as string) || null,
    template_fields: templateFields,
  }).eq("id", id);

  revalidatePath("/admin/recursos");
}

export async function toggleRecursoActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  await supabase.from("cards").update({ is_active }).eq("id", id);
  revalidatePath("/admin/recursos");
}
