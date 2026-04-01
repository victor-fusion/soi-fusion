"use client";

import { useRouter } from "next/navigation";

interface StartupFilterProps {
  startups: { id: string; name: string }[];
  activeStartup: string;
  activeBatch: number;
  activeType: string;
}

export function StartupFilter({ startups, activeStartup, activeBatch, activeType }: StartupFilterProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    if (activeBatch) params.set("batch", String(activeBatch));
    if (e.target.value) params.set("startup", e.target.value);
    if (activeType) params.set("type", activeType);
    router.push(`/admin/miembros?${params.toString()}`);
  };

  const selectStyle: React.CSSProperties = {
    fontSize: 13, color: "#374151", backgroundColor: "#fff",
    border: "1px solid #e5e7eb", borderRadius: 8,
    padding: "6px 28px 6px 12px", outline: "none", cursor: "pointer",
    appearance: "auto", fontFamily: "inherit",
  };

  return (
    <select value={activeStartup} onChange={handleChange} style={selectStyle}>
      <option value="">Todas las startups</option>
      {startups.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}

interface TypeFilterProps {
  activeType: string;
  activeBatch: number;
  activeStartup: string;
}

export function TypeFilter({ activeType, activeBatch, activeStartup }: TypeFilterProps) {
  const router = useRouter();

  const TYPES = [
    { value: "cofundador",  label: "Cofundadores" },
    { value: "empleado",    label: "Empleados" },
    { value: "advisor",     label: "Advisors" },
    { value: "becario",     label: "Becarios" },
    { value: "contratista", label: "Contratistas" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    if (activeBatch) params.set("batch", String(activeBatch));
    if (activeStartup) params.set("startup", activeStartup);
    if (e.target.value) params.set("type", e.target.value);
    router.push(`/admin/miembros?${params.toString()}`);
  };

  const selectStyle: React.CSSProperties = {
    fontSize: 13, color: "#374151", backgroundColor: "#fff",
    border: "1px solid #e5e7eb", borderRadius: 8,
    padding: "6px 28px 6px 12px", outline: "none", cursor: "pointer",
    appearance: "auto", fontFamily: "inherit",
  };

  return (
    <select value={activeType} onChange={handleChange} style={selectStyle}>
      <option value="">Todos los tipos</option>
      {TYPES.map((t) => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  );
}
