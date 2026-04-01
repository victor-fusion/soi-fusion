-- ============================================================
-- Migración 005: Campos adicionales en startups
-- Ejecutar en Supabase: SQL Editor > New query
-- ============================================================

alter table public.startups
  add column if not exists logo_url text,
  add column if not exists tagline  text;   -- One-liner: "La herramienta X para Y"
