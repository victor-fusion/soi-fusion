import { redirect } from "next/navigation";
import { getAreas } from "@/lib/data/areas";
import { getCurrentProfile } from "@/lib/data/session";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, areas] = await Promise.all([getCurrentProfile(), getAreas()]);
  if (!profile) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar profile={profile} startup={profile.startups} areas={areas} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
