"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateEntregableStatus(entregableId: string, status: string) {
  const supabase = await createClient();
  await supabase
    .from("entregables")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", entregableId);
  revalidatePath(`/dashboard/entregables/${entregableId}`);
  revalidatePath("/dashboard");
}

export async function toggleStep(
  entregableId: string,
  stepIndex: number,
  currentCompleted: number[]
) {
  const supabase = await createClient();
  const isCompleted = currentCompleted.includes(stepIndex);
  const newCompleted = isCompleted
    ? currentCompleted.filter((i) => i !== stepIndex)
    : [...currentCompleted, stepIndex].sort((a, b) => a - b);

  await supabase
    .from("entregables")
    .update({ completed_steps: newCompleted, updated_at: new Date().toISOString() })
    .eq("id", entregableId);
  revalidatePath(`/dashboard/entregables/${entregableId}`);
}
