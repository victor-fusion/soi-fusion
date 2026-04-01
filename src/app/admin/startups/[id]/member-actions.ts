"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OfficeSchedule } from "@/types";

export async function inviteMember(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const startupId  = formData.get("startup_id") as string;
  const email      = formData.get("email") as string;
  const fullName   = formData.get("full_name") as string;
  const memberType = formData.get("member_type") as string;
  const dedication = formData.get("dedication") as string;

  const scheduleRaw = formData.get("office_schedule") as string;
  let office_schedule: OfficeSchedule = {};
  try { office_schedule = JSON.parse(scheduleRaw || "{}"); } catch { /* empty */ }

  // 1. Enviar invitación — crea auth.user y dispara trigger handle_new_user (crea profile)
  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName, role: "founder" },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    }
  );

  if (inviteError) throw new Error(inviteError.message);
  const userId = inviteData.user.id;

  // 2. Actualizar el profile con los datos del equipo
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name:      fullName,
      startup_id:     startupId,
      role_title:     formData.get("role_title") as string || null,
      member_type:    memberType,
      dedication:     dedication,
      office_schedule,
      joined_at:      formData.get("joined_at") as string || null,
      phone:          formData.get("phone") as string || null,
      linkedin_url:   formData.get("linkedin_url") as string || null,
      calendar_url:   formData.get("calendar_url") as string || null,
    })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function updateMember(formData: FormData) {
  const supabase = await createClient();
  const memberId  = formData.get("member_id") as string;
  const startupId = formData.get("startup_id") as string;

  const scheduleRaw = formData.get("office_schedule") as string;
  let office_schedule: OfficeSchedule = {};
  try { office_schedule = JSON.parse(scheduleRaw || "{}"); } catch { /* empty */ }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name:      formData.get("full_name") as string,
      role_title:     formData.get("role_title") as string || null,
      member_type:    formData.get("member_type") as string,
      dedication:     formData.get("dedication") as string,
      office_schedule,
      joined_at:      formData.get("joined_at") as string || null,
      phone:          formData.get("phone") as string || null,
      linkedin_url:   formData.get("linkedin_url") as string || null,
      calendar_url:   formData.get("calendar_url") as string || null,
    })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}

export async function removeMemberFromStartup(memberId: string, startupId: string) {
  const supabase = await createClient();
  // No eliminamos el usuario — solo lo desvinculamos de la startup
  const { error } = await supabase
    .from("profiles")
    .update({ startup_id: null, member_type: null, dedication: null, role_title: null })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/startups/${startupId}`);
}
