import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { DemoShell } from "./_components/DemoShell";
import "./demo.css";

// Tipografía editorial solo para el prototipo (titulares y cifras)
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "SOI · Prototipo",
  description: "Prototipo navegable del SOI para startups (datos ficticios)",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`demo-root ${fraunces.variable}`}>
      <DemoShell>{children}</DemoShell>
    </div>
  );
}
