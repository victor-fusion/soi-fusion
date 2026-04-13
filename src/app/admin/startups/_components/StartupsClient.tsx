"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Group, Stack, Badge, Paper, Progress, Avatar, SimpleGrid } from "@mantine/core";
import { IconPencil, IconSearch, IconLoader2, IconX } from "@tabler/icons-react";
import type { Startup } from "@/types";
import { BatchFilter } from "../../_components/BatchFilter";
import { NewStartupButton } from "./NewStartupButton";
import { Pagination } from "@/components/ui/Pagination";
import { Suspense } from "react";
import { updateStartup } from "../[id]/actions";

type Phase = { number: number; name: string; color: string };

const STATUS_COLOR: Record<string, string> = {
  activa:      "#16a34a",
  en_pausa:    "#d97706",
  en_revision: "#2563eb",
  inactiva:    "#9ca3af",
  cerrada:     "#ef4444",
};

const TYPES = [
  { value: "b2b_saas",        label: "B2B SaaS" },
  { value: "b2c_app",         label: "B2C App" },
  { value: "marketplace",     label: "Marketplace" },
  { value: "producto_fisico", label: "Producto físico" },
  { value: "servicios",       label: "Servicios" },
];

const STATUSES = [
  { value: "activa",      label: "Activa" },
  { value: "en_pausa",    label: "En pausa" },
  { value: "en_revision", label: "En revisión" },
  { value: "inactiva",    label: "Inactiva" },
  { value: "cerrada",     label: "Cerrada" },
];

interface ProgressData {
  done: number;
  total: number;
  pct: number;
}

interface StartupsClientProps {
  startups: Startup[];
  phases: Phase[];
  progressMap: Record<string, ProgressData>;
  availableBatches: number[];
  selectedBatch: number;
  total: number;
  page: number;
}

// ─── Edit Drawer ─────────────────────────────────────────────────────────────

function EditDrawer({ startup, onClose }: { startup: Startup; onClose: () => void }) {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState(startup.logo_url ?? "");
  const [webUrl, setWebUrl] = useState(startup.web_url ?? "");
  const [isPending, startTransition] = useTransition();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    fontSize: 14, color: "#374151",
    backgroundColor: "#fafafa",
    border: "1px solid #e5e7eb",
    borderRadius: 8, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600,
    color: "#6b7280", marginBottom: 6, display: "block",
  };

  const fetchFavicon = (url: string) => {
    if (!url || logoPreview) return;
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      setLogoPreview(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    } catch { /* URL inválida */ }
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateStartup(fd);
      router.refresh();
      onClose();
    });
  };

  return (
    <Box
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Box
        style={{
          backgroundColor: "#fff", borderRadius: 16,
          width: "100%", maxWidth: 640,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <Box style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
        }}>
          <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Editar startup</Text>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex" }}>
            <IconX size={18} />
          </button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box style={{ padding: 24 }}>
            <input type="hidden" name="startup_id" value={startup.id} />

            <Box mb={20}>
              <label style={labelStyle}>Logo</label>
              <Group gap={16} align="flex-start">
                <Avatar src={logoPreview || undefined} radius="lg" size={64}
                  style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", flexShrink: 0, fontSize: 22, fontWeight: 700 }}>
                  {startup.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <input type="url" name="logo_url" value={logoPreview}
                    onChange={(e) => setLogoPreview(e.target.value)}
                    placeholder="https://ejemplo.com/logo.png" style={inputStyle} />
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                    Pega una URL o se rellenará automáticamente con el favicon del sitio web.
                  </Text>
                </Box>
              </Group>
            </Box>

            <Box mb={16}>
              <label style={labelStyle}>Sitio web</label>
              <input type="url" name="web_url" value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                onBlur={(e) => fetchFavicon(e.target.value)}
                placeholder="https://startup.com" style={inputStyle} />
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                Al salir del campo se buscará el favicon automáticamente si no hay logo.
              </Text>
            </Box>

            <Box mb={16}>
              <label style={labelStyle}>Nombre *</label>
              <input name="name" required defaultValue={startup.name}
                placeholder="Nombre de la startup" style={inputStyle} />
            </Box>

            <Box mb={16}>
              <label style={labelStyle}>Tagline</label>
              <input name="tagline" defaultValue={startup.tagline ?? ""}
                placeholder="Ej: La herramienta de ventas para equipos B2B en crecimiento"
                style={inputStyle} maxLength={120} />
            </Box>

            <Box mb={16}>
              <label style={labelStyle}>Sector</label>
              <input name="sector" defaultValue={startup.sector ?? ""}
                placeholder="Ej: SaaS, Retail, Salud, Educación…" style={inputStyle} />
            </Box>

            <SimpleGrid cols={3} spacing={16} mb={16}>
              <Box>
                <label style={labelStyle}>Tipo de startup</label>
                <select name="type" defaultValue={startup.type} style={{ ...inputStyle, cursor: "pointer" }}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Box>
              <Box>
                <label style={labelStyle}>Estado</label>
                <select name="status" defaultValue={startup.status} style={{ ...inputStyle, cursor: "pointer" }}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Box>
              <Box>
                <label style={labelStyle}>Ciclo</label>
                <select name="batch" defaultValue={startup.batch} style={{ ...inputStyle, cursor: "pointer" }}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Ciclo {n}</option>)}
                </select>
              </Box>
            </SimpleGrid>

            <Box mb={24}>
              <label style={labelStyle}>Fecha de inicio del ciclo</label>
              <input type="date" name="cycle_start_date"
                defaultValue={startup.cycle_start_date ?? ""} style={inputStyle} />
            </Box>

            <Group justify="flex-end" gap={8} mt={8}>
              <button type="button" onClick={onClose}
                style={{
                  padding: "9px 18px", borderRadius: 8,
                  border: "1px solid #e5e7eb", backgroundColor: "#fff",
                  color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                Cancelar
              </button>
              <button type="submit" disabled={isPending}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 20px", borderRadius: 8,
                  border: "none", backgroundColor: "#111827",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: isPending ? "wait" : "pointer",
                }}>
                {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                Guardar cambios
              </button>
            </Group>
          </Box>
        </form>
      </Box>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StartupsClient({
  startups,
  phases,
  progressMap,
  availableBatches,
  selectedBatch,
  total,
  page,
}: StartupsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);

  const term = search.trim().toLowerCase();
  const filtered = term ? startups.filter((s) => s.name.toLowerCase().includes(term)) : startups;

  return (
    <Box p={40} maw={1100} mx="auto">
      <Box mb={32}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Admin</Text>
        <Group justify="space-between" align="center" mt={4}>
          <Box>
            <Text style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>Startups</Text>
            <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {total} startup{total !== 1 ? "s" : ""}
            </Text>
          </Box>
          <NewStartupButton />
        </Group>
      </Box>

      <Group gap={10} mb={24}>
        <Suspense fallback={null}>
          <BatchFilter batches={availableBatches} activeBatch={selectedBatch} basePath="/admin/startups" />
        </Suspense>
        {selectedBatch !== 0 && (
          <Link href="/admin/startups" style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}>
            Limpiar filtros
          </Link>
        )}
        <Box style={{ position: "relative", marginLeft: "auto" }}>
          <IconSearch size={13} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar startup..."
            style={{ padding: "6px 10px 6px 30px", fontSize: 13, borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "#fafafa", color: "#374151", outline: "none", width: 200 }}
          />
        </Box>
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length} resultados</Text>
      </Group>

      <Paper p={0} radius="lg" withBorder style={{ borderColor: "#f3f4f6", overflow: "hidden" }}>
        <Box
          px={24} py={14}
          style={{
            borderBottom: "1px solid #f3f4f6",
            display: "grid",
            gridTemplateColumns: "1fr 80px 100px 140px 180px 80px 32px",
            gap: 16, alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          {["Startup", "Ciclo", "Sector", "Fase actual", "Progreso de fase", "Estado", ""].map((h) => (
            <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </Text>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box py={48} style={{ textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No hay startups con los filtros seleccionados.</Text>
          </Box>
        ) : (
          <Stack gap={0}>
            {filtered.map((startup, i) => {
              const prog = progressMap[startup.id] ?? { done: 0, total: 0, pct: 0 };
              const phase = phases.find((p) => p.number === startup.current_phase) ?? phases[0];
              const isLast = i === filtered.length - 1;

              return (
                <Box
                  key={startup.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px 140px 180px 80px 32px",
                    gap: 16, alignItems: "center", padding: "16px 24px",
                    borderBottom: isLast ? "none" : "1px solid #f9fafb",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/admin/startups/${startup.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  {/* Startup name + favicon */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, overflow: "hidden" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      border: "1px solid #f3f4f6", backgroundColor: "#f9fafb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {startup.logo_url ? (
                        <img
                          src={startup.logo_url}
                          alt={startup.name}
                          style={{ width: 26, height: 26, objectFit: "contain" }}
                        />
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>
                          {startup.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: "#111827" }} truncate>{startup.name}</Text>
                      {startup.tagline && (
                        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }} truncate>{startup.tagline}</Text>
                      )}
                    </div>
                  </div>

                  <Text style={{ fontSize: 12, color: "#6b7280" }}>Ciclo {startup.batch}</Text>

                  <Text style={{ fontSize: 12, color: "#6b7280" }} truncate>{startup.sector ?? "—"}</Text>

                  <Group gap={8}>
                    <Box style={{
                      width: 20, height: 20, borderRadius: 5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                      backgroundColor: phase?.color ?? "#9ca3af", color: "white",
                    }}>
                      {phase?.number ?? "?"}
                    </Box>
                    <Text style={{ fontSize: 12, color: "#374151" }} lineClamp={1}>{phase?.name ?? "—"}</Text>
                  </Group>

                  <Box>
                    {prog.total > 0 ? (
                      <>
                        <Group justify="space-between" mb={4}>
                          <Text style={{ fontSize: 11, color: "#9ca3af" }}>{prog.done}/{prog.total}</Text>
                          <Text style={{ fontSize: 11, fontWeight: 600, color: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706" }}>
                            {prog.pct}%
                          </Text>
                        </Group>
                        <Progress
                          value={prog.pct} size={6} radius="xl"
                          styles={{
                            root: { backgroundColor: "#f3f4f6" },
                            section: { backgroundColor: prog.pct >= 80 ? "#16a34a" : prog.pct >= 40 ? "#2563eb" : "#d97706" },
                          }}
                        />
                      </>
                    ) : (
                      <Text style={{ fontSize: 12, color: "#d1d5db" }}>Sin entregables</Text>
                    )}
                  </Box>

                  <Badge
                    size="sm" variant="dot"
                    styles={{ root: { color: STATUS_COLOR[startup.status] ?? "#9ca3af", borderColor: "transparent" } }}
                  >
                    {startup.status === "activa" ? "Activa" : startup.status === "en_pausa" ? "En pausa" : startup.status}
                  </Badge>

                  {/* Pencil: opens edit drawer, does NOT navigate */}
                  <Box
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStartup(startup);
                    }}
                  >
                    <Box style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: 7,
                      border: "1px solid #e5e7eb", backgroundColor: "#fff",
                      color: "#9ca3af", cursor: "pointer",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                    >
                      <IconPencil size={13} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Pagination total={total} page={page} perPage={15} />

      {editingStartup && (
        <EditDrawer
          startup={editingStartup}
          onClose={() => setEditingStartup(null)}
        />
      )}
    </Box>
  );
}
