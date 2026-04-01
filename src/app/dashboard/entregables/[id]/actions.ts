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
  revalidatePath("/dashboard/roadmap");
}

export async function addComment(entregableId: string, body: string, parentId?: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from("entregable_comments").insert({
    entregable_id: entregableId,
    author_id: session.user.id,
    parent_id: parentId ?? null,
    body: body.trim(),
  });

  revalidatePath(`/dashboard/entregables/${entregableId}`);
}

export async function deleteComment(commentId: string, entregableId: string) {
  const supabase = await createClient();
  await supabase.from("entregable_comments").delete().eq("id", commentId);
  revalidatePath(`/dashboard/entregables/${entregableId}`);
}
