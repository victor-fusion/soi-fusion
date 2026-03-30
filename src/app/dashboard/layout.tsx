import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import type { Profile, Startup } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");

  let startup: Startup | null = null;
  if (profile.startup_id) {
    const { data } = await supabase
      .from("startups")
      .select("*")
      .eq("id", profile.startup_id)
      .single();
    startup = data;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar profile={profile as Profile} startup={startup} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
