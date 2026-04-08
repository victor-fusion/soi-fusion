import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAreas } from "@/lib/data/areas";
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

  const [profileResult, areas] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", session.user.id).single(),
    getAreas(),
  ]);

  const profile = profileResult.data;
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar profile={profile as Profile} startup={startup} areas={areas} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
