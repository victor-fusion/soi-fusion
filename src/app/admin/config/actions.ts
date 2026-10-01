"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CYCLES_TAG } from "@/lib/data/cycles";

function refresh() {
  updateTag(CYCLES_TAG);
  revalidatePath("/admin", "layout");
}

/** Crea un ciclo o actualiza nombre y fechas de uno existente (por número). */
export async function saveCycle(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const number = parseInt(formData.get("number") as string, 10);
  if (!number || number < 1) return { error: "El número de ciclo no es válido." };

  const { error } = await supabase.from("cycles").upsert({
    number,
    name:       ((formData.get("name") as string) || "").trim() || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date:   (formData.get("end_date") as string) || null,
  }, { onConflict: "number" });

  if (error) return { error: error.message };
  refresh();
  return {};
}

/** Marca un ciclo como activo (y desmarca el anterior). */
export async function setActiveCycle(number: number): Promise<{ error?: string }> {
  const supabase = await createClient();

  // El índice único parcial solo admite un activo: primero se desmarca el actual
  const { error: unsetError } = await supabase.from("cycles").update({ is_active: false }).eq("is_active", true);
  if (unsetError) return { error: unsetError.message };

  const { error } = await supabase.from("cycles").update({ is_active: true }).eq("number", number);
  if (error) return { error: error.message };

  refresh();
  return {};
}

/** Borra un ciclo. Falla si alguna startup pertenece a él. */
export async function deleteCycle(number: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("cycles").delete().eq("number", number);
  if (error) {
    return {
      error: error.code === "23503"
        ? `No se puede borrar el ciclo ${number}: tiene startups asignadas.`
        : error.message,
    };
  }
  refresh();
  return {};
}
