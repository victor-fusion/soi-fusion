"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OfficeSchedule } from "@/types";

/** Invita por email vía Edge Function (generateLink → Resend, sin Auth Hook) */
export async function inviteMiembro(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const email     = formData.get("email") as string;
  const startupId = (formData.get("startup_id") as string) || null;

  // Invocamos la Edge Function que usa generateLink internamente.
  // Esto NO dispara el Auth Hook de Supabase, evitando los rate limits.
  const { data: fnData, error: fnError } = await supabase.functions.invoke("invite-member", {
    body: { email },
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

  // Solo asignamos startup — el miembro rellena el resto en el onboarding
  if (startupId) {
    const { error } = await adminSupabase
      .from("profiles")
      .update({ startup_id: startupId })
      .eq("id", userId);
    if (error) return { error: error.message };
  }

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
    first_name:     (formData.get("first_name") as string) || null,
    last_name:      (formData.get("last_name") as string) || null,
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

/** Envía enlace de recuperación de contraseña al miembro */
export async function sendPasswordReset(memberId: string): Promise<void> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Obtener email del usuario
  const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(memberId);
  if (userError || !userData.user?.email) throw new Error("No se pudo obtener el email del usuario.");

  // resetPasswordForEmail dispara el hook send-auth-email → Resend
  const { error } = await supabase.auth.resetPasswordForEmail(userData.user.email, {
    redirectTo: "https://soi.fusionstartups.com/reset-password",
  });

  if (error) throw new Error(error.message);
}
