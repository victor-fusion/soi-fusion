"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Aprueba o deniega la conexión de una app (Claude, ChatGPT…) al SOI vía OAuth. */
export async function decideAuthorization(formData: FormData) {
  const authorizationId = formData.get("authorization_id") as string;
  const decision = formData.get("decision") as string;
  const supabase = await createClient();

  const { data, error } = decision === "approve"
    ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
    : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });

  if (error || !data?.redirect_url) {
    redirect(`/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}&error=1`);
  }
  redirect(data.redirect_url);
}
