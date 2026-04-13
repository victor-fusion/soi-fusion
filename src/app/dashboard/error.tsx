"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40 }}>
      <h2>Error en el dashboard</h2>
      <pre style={{ background: "#fee", padding: 16, borderRadius: 8, fontSize: 12, whiteSpace: "pre-wrap" }}>
        {error.message}
        {"\n\nDigest: "}
        {error.digest}
      </pre>
      <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px" }}>
        Reintentar
      </button>
    </div>
  );
}
