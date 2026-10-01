import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/session";
import { activeCycle, getCycles } from "@/lib/data/cycles";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const cycle = activeCycle(await getCycles()); // cacheado: sin viaje a la BD

  const [profile, { count }] = await Promise.all([
    getCurrentProfile(),
    supabase
      .from("startups")
      .select("*", { count: "exact", head: true })
      .eq("batch", cycle?.number ?? 0),
  ]);

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <AdminSidebar profile={profile} startupCount={count ?? 0} cycleNumber={cycle?.number ?? null} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
