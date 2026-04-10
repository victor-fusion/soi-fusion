"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OfficeSchedule } from "@/types";

/** Invita por email vía Edge Function (generateLink → Resend, sin Auth Hook) */
export async function inviteMiembro(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const email      = formData.get("email") as string;
  const fullName   = formData.get("full_name") as string;
  const startupId  = (formData.get("startup_id") as string) || null;
  const memberType = formData.get("member_type") as string;
  const dedication = formData.get("dedication") as string;

  const scheduleRaw = formData.get("office_schedule") as string;
  let office_schedule: OfficeSchedule = {};
  try { office_schedule = JSON.parse(scheduleRaw || "{}"); } catch { /* empty */ }

  // Invocamos la Edge Function que usa generateLink internamente.
  // Esto NO dispara el Auth Hook de Supabase, evitando los rate limits.
  const { data: fnData, error: fnError } = await supabase.functions.invoke("invite-member", {
    body: { email, full_name: fullName },
  });

  if (fnError) {
    const msg = fnError.message ?? String(fnError);
    if (msg.includes("already been invited") || msg.includes("already registered")) {
      return { error: "Este email ya tiene una invitación pendiente o ya está registrado." };
    }
    return { error: msg };
  }

  const userId = (fnData as { user_id?: string })?.user_id;
  if (!userId) return { error: "No se pudo obtener el ID del usuario invitado." };

  const avatarUrl = (formData.get("avatar_url") as string) || null;

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      full_name:      fullName,
      startup_id:     startupId,
      role_title:     (formData.get("role_title") as string) || null,
      member_type:    memberType || null,
      dedication:     dedication || null,
      office_schedule,
      joined_at:      (formData.get("joined_at") as string) || null,
      phone:          (formData.get("phone") as string) || null,
      linkedin_url:   (formData.get("linkedin_url") as string) || null,
      calendar_url:   (formData.get("calendar_url") as string) || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin/miembros");
  return {};
}

/** Actualiza datos de un perfil existente */
export async function updateMiembro(formData: FormData) {
  const supabase = await createClient();
  const memberId  = formData.get("member_id") as string;
  const startupId = (formData.get("startup_id") as string) || null;

  const scheduleRaw = formData.get("office_schedule") as string;
  let office_schedule: OfficeSchedule = {};
  try { office_schedule = JSON.parse(scheduleRaw || "{}"); } catch { /* empty */ }

  const avatarUrl = (formData.get("avatar_url") as string) || null;

  const updateData: Record<string, unknown> = {
    full_name:      formData.get("full_name") as string,
    startup_id:     startupId,
    role_title:     (formData.get("role_title") as string) || null,
    member_type:    (formData.get("member_type") as string) || null,
    dedication:     (formData.get("dedication") as string) || null,
    office_schedule,
    joined_at:      (formData.get("joined_at") as string) || null,
    phone:          (formData.get("phone") as string) || null,
    linkedin_url:   (formData.get("linkedin_url") as string) || null,
    calendar_url:   (formData.get("calendar_url") as string) || null,
  };
  if (avatarUrl !== null) updateData.avatar_url = avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/miembros");
  revalidatePath(`/admin/miembros/${memberId}`);
}

/** Elimina completamente un perfil (el auth.user permanece) */
export async function deleteMiembro(memberId: string) {
  const adminSupabase = createAdminClient();

  // Eliminar auth user (cascade borra el profile por el trigger)
  const { error } = await adminSupabase.auth.admin.deleteUser(memberId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/miembros");
}
