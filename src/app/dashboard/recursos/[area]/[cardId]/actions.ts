"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveTemplateResponse(
  cardId: string,
  responses: Record<string, string>,
) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("startup_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.startup_id) throw new Error("Sin startup asignada");

  const { error } = await supabase
    .from("template_responses")
    .upsert(
      {
        card_id: cardId,
        startup_id: profile.startup_id,
        user_id: session.user.id,
        responses,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "card_id,startup_id" },
    );

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/recursos`);
}
