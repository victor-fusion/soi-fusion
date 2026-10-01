"use server";

import { createClient } from "@/lib/supabase/server";
import { getCycles } from "@/lib/data/cycles";
import { recomputeDeadlines } from "@/lib/data/deadlines";
import { revalidatePath } from "next/cache";

export async function createStartup(formData: FormData) {
  // Sesión del usuario (no service role): RLS solo deja crear startups a admins.
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const type = formData.get("type") as string;
  const batch = parseInt(formData.get("batch") as string, 10);

  if (!name || !type || !batch) return;

  // Sin fecha propia, la startup arranca con la fecha de inicio de su ciclo
  const cycle = (await getCycles()).find((c) => c.number === batch);
  const cycleStartDate = (formData.get("cycle_start_date") as string) || cycle?.start_date || null;

  const { data, error } = await supabase.from("startups").insert({
    name,
    sector: sector || null,
    tagline: tagline || null,
    type,
    status: "activa",
    current_phase: 1,
    batch,
    cycle_start_date: cycleStartDate,
  }).select("id").single();

  if (error) throw new Error(error.message);

  // El trigger ya ha creado los entregables: fijar sus fechas límite
  if (cycleStartDate) await recomputeDeadlines(supabase, data.id, cycleStartDate);

  revalidatePath("/admin/startups");
  revalidatePath("/admin");
}
