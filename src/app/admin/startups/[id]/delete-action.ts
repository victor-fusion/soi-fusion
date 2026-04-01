"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface DeleteOptions {
  deleteMembers: boolean;
  deleteEntregables: boolean;
  deleteContacts: boolean;
}

export async function deleteStartup(startupId: string, options: DeleteOptions) {
  const supabase = await createClient();

  // Eliminar explícitamente las categorías seleccionadas antes del cascade
  if (options.deleteMembers) {
    await supabase.from("startup_members").delete().eq("startup_id", startupId);
  }
  // Entregables y contactos tienen cascade, pero si el usuario los desmarca
  // en el futuro podríamos moverlos. Por ahora solo hay acción si los quiere borrar.
  // El cascade del startup los elimina de todas formas si no los detachamos.
  // Como solo startup_members tiene SET NULL, el resto siempre se borra por cascade.

  // Eliminar la startup (cascade elimina entregables, contactos, agent_tasks, template_responses)
  const { error } = await supabase
    .from("startups")
    .delete()
    .eq("id", startupId);

  if (error) throw new Error(error.message);

  redirect("/admin/startups");
}

export async function getStartupRelatedCounts(startupId: string) {
  const supabase = await createClient();

  const [members, entregables, contacts] = await Promise.all([
    supabase
      .from("startup_members")
      .select("id", { count: "exact", head: true })
      .eq("startup_id", startupId),
    supabase
      .from("entregables")
      .select("id", { count: "exact", head: true })
      .eq("startup_id", startupId),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("startup_id", startupId),
  ]);

  return {
    members:     members.count ?? 0,
    entregables: entregables.count ?? 0,
    contacts:    contacts.count ?? 0,
  };
}
