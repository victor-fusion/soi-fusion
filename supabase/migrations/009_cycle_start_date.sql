-- ============================================================
-- Migración 009: Fecha de inicio del ciclo en startups
-- Permite calcular los deadlines de entregables por fase.
-- ============================================================

alter table public.startups
  add column if not exists cycle_start_date date;
