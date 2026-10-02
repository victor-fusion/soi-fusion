import type { Metadata } from "next";
import { AdminShell } from "./_components/AdminShell";
import "../demo/demo.css";

export const metadata: Metadata = {
  title: "SOI · Prototipo Fusión",
  description: "Prototipo navegable de la vista de Fusión en SOI (datos ficticios)",
  robots: { index: false, follow: false },
};

export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="demo-root">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
