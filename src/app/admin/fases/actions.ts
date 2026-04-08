"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFase(formData: FormData) {
  const supabase = await createClient();
  const number = parseInt(formData.get("number") as string, 10);
  const name   = formData.get("name") as string;
  const color  = formData.get("color") as string;

  const { error } = await supabase
    .from("phases")
    .insert({ number, name, color });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/fases");
}

export async function updateFase(formData: FormData) {
  const supabase = await createClient();
  const id    = parseInt(formData.get("id") as string, 10);
  const name  = formData.get("name") as string;
  const color = formData.get("color") as string;

  const { error } = await supabase
    .from("phases")
    .update({ name, color })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/fases");
}

export async function deleteFase(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("phases")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/fases");
}

export async function reorderFases(orderedIds: number[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("phases").update({ sort_order: index + 1 }).eq("id", id)
    )
  );
  revalidatePath("/admin/fases");
}
