"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, SimpleGrid, Avatar } from "@mantine/core";
import { IconX, IconLoader2, IconPencil } from "@tabler/icons-react";
import type { Startup } from "@/types";
import { updateStartup } from "../actions";

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

interface StartupEditFormProps {
  startup: Startup;
}

export function StartupEditForm({ startup }: StartupEditFormProps) {
  const [open, setOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(startup.logo_url ?? "");
  const [webUrl, setWebUrl] = useState(startup.web_url ?? "");
  const [isPending, startTransition] = useTransition();

  const fetchFavicon = (url: string) => {
    if (!url || logoPreview) return; // no sobreescribir si ya hay logo
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      setLogoPreview(faviconUrl);
    } catch {
      // URL inválida, ignorar
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateStartup(fd);
      setOpen(false);
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    fontSize: 14, color: "#374151",
    backgroundColor: "#fafafa",
    border: "1px solid #e5e7eb",
    borderRadius: 8, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600,
    color: "#6b7280", marginBottom: 6, display: "block",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar startup"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 34, height: 34, borderRadius: 8,
          border: "1px solid #e5e7eb", backgroundColor: "#fff",
          color: "#6b7280", cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        <IconPencil size={16} />
      </button>

      {open && (
        <Box
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <Box
            style={{
              backgroundColor: "#fff", borderRadius: 16,
              width: "100%", maxWidth: 640,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header */}
            <Box style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
            }}>
              <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                Editar startup
              </Text>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex" }}
              >
                <IconX size={18} />
              </button>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box style={{ padding: 24 }}>
                <input type="hidden" name="startup_id" value={startup.id} />

                {/* Logo + Nombre */}
                <Box mb={20}>
                  <label style={labelStyle}>Logo</label>
                  <Group gap={16} align="flex-start">
                    <Avatar
                      src={logoPreview || undefined}
                      radius="lg"
                      size={64}
                      style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", flexShrink: 0, fontSize: 22, fontWeight: 700 }}
                    >
                      {startup.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <input
                        type="url"
                        name="logo_url"
                        value={logoPreview}
                        onChange={(e) => setLogoPreview(e.target.value)}
                        placeholder="https://ejemplo.com/logo.png"
                        style={inputStyle}
                      />
                      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                        Pega una URL o se rellenará automáticamente con el favicon del sitio web.
                      </Text>
                    </Box>
                  </Group>
                </Box>

                {/* Web */}
                <Box mb={16}>
                  <label style={labelStyle}>Sitio web</label>
                  <input
                    type="url"
                    name="web_url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    onBlur={(e) => fetchFavicon(e.target.value)}
                    placeholder="https://startup.com"
                    style={inputStyle}
                  />
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                    Al salir del campo se buscará el favicon automáticamente si no hay logo.
                  </Text>
                </Box>

                {/* Nombre */}
                <Box mb={16}>
                  <label style={labelStyle}>Nombre *</label>
                  <input
                    name="name"
                    required
                    defaultValue={startup.name}
                    placeholder="Nombre de la startup"
                    style={inputStyle}
                  />
                </Box>

                {/* Tagline */}
                <Box mb={16}>
                  <label style={labelStyle}>Tagline</label>
                  <input
                    name="tagline"
                    defaultValue={startup.tagline ?? ""}
                    placeholder="Ej: La herramienta de ventas para equipos B2B en crecimiento"
                    style={inputStyle}
                    maxLength={120}
                  />
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                    Máximo 120 caracteres. Una frase que explique qué hacéis.
                  </Text>
                </Box>

                {/* Sector */}
                <Box mb={16}>
                  <label style={labelStyle}>Sector</label>
                  <input
                    name="sector"
                    defaultValue={startup.sector ?? ""}
                    placeholder="Ej: SaaS, Retail, Salud, Educación…"
                    style={inputStyle}
                  />
                </Box>

                {/* Tipo + Estado + Ciclo */}
                <SimpleGrid cols={3} spacing={16} mb={16}>
                  <Box>
                    <label style={labelStyle}>Tipo de startup</label>
                    <select name="type" defaultValue={startup.type} style={{ ...inputStyle, cursor: "pointer" }}>
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <label style={labelStyle}>Estado</label>
                    <select name="status" defaultValue={startup.status} style={{ ...inputStyle, cursor: "pointer" }}>
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <label style={labelStyle}>Ciclo</label>
                    <select name="batch" defaultValue={startup.batch} style={{ ...inputStyle, cursor: "pointer" }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>Ciclo {n}</option>
                      ))}
                    </select>
                  </Box>
                </SimpleGrid>

                {/* Fecha de inicio del ciclo */}
                <Box mb={24}>
                  <label style={labelStyle}>Fecha de inicio del ciclo</label>
                  <input
                    type="date"
                    name="cycle_start_date"
                    defaultValue={startup.cycle_start_date ?? ""}
                    style={inputStyle}
                  />
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                    Marca los deadlines automáticamente: fase 1 +30 días, fase 2 +60 días, etc.
                  </Text>
                </Box>

                {/* Footer */}
                <Group justify="flex-end" gap={8} mt={8}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "9px 18px", borderRadius: 8,
                      border: "1px solid #e5e7eb", backgroundColor: "#fff",
                      color: "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 20px", borderRadius: 8,
                      border: "none", backgroundColor: "#111827",
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: isPending ? "wait" : "pointer",
                    }}
                  >
                    {isPending && <IconLoader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                    Guardar cambios
                  </button>
                </Group>
              </Box>
            </form>
          </Box>
        </Box>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
