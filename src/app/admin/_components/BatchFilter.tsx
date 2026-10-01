"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface BatchFilterProps {
  batches: number[];
  activeBatch: number;
  basePath?: string;
}

export function BatchFilter({ batches, activeBatch, basePath = "/admin" }: BatchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Conserva el resto de filtros (búsqueda, etc.) y vuelve a la página 1.
  // batch=0 ("todos") se mantiene explícito: en /admin la ausencia significa "último ciclo".
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("batch", e.target.value);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <select
      value={activeBatch}
      onChange={handleChange}
      style={{
        fontSize: 13,
        color: "#374151",
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "6px 28px 6px 12px",
        outline: "none",
        cursor: "pointer",
        appearance: "auto",
        fontFamily: "inherit",
      }}
    >
      <option value={0}>Todos los ciclos</option>
      {batches.map((b) => (
        <option key={b} value={b}>Ciclo {b}</option>
      ))}
    </select>
  );
}
