"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OfficeSchedule } from "@/types";

/** Invita por email y vincula a una startup opcional */
export async function inviteMiembro(formData: FormData) {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();

  const email      = formData.get("email") as string;
  const fullName   = formData.get("full_name") as string;
  const startupId  = (formData.get("startup_id") as string) || null;
  const memberType = formData.get("member_type") as string;
  const dedication = formData.get("dedication") as string;

  const scheduleRaw = formData.get("office_schedule") as string;
  let office_schedule: OfficeSchedule = {};
  try { office_schedule = JSON.parse(scheduleRaw || "{}"); } catch { /* empty */ }

  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName, role: "founder" },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    }
  );

  if (inviteError) {
    if (inviteError.message.includes("rate limit") || inviteError.status === 429) {
      throw new Error("Demasiados intentos de invitación. Espera unos minutos antes de volver a intentarlo.");
    }
    if (inviteError.message.includes("already been invited") || inviteError.message.includes("already registered")) {
      throw new Error("Este email ya tiene una invitación pendiente o ya está registrado.");
    }
    throw new Error(inviteError.message);
  }

  const avatarUrl = (formData.get("avatar_url") as string) || null;

  const { error } = await supabase
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
    .eq("id", inviteData.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/miembros");
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
