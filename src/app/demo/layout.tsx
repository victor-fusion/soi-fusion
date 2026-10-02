import type { Metadata } from "next";
import { DemoShell } from "./_components/DemoShell";
import "./demo.css";

export const metadata: Metadata = {
  title: "SOI · Prototipo",
  description: "Prototipo navegable del SOI para startups (datos ficticios)",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="demo-root">
      <DemoShell>{children}</DemoShell>
    </div>
  );
}
