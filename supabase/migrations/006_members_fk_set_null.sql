-- ============================================================
-- Migración 006: startup_members.startup_id → ON DELETE SET NULL
-- Permite conservar miembros al eliminar una startup
-- Ejecutar en Supabase: SQL Editor > New query
-- ============================================================

-- Hacer startup_id nullable (era NOT NULL)
alter table public.startup_members
  alter column startup_id drop not null;

-- Reemplazar el FK con ON DELETE SET NULL
alter table public.startup_members
  drop constraint startup_members_startup_id_fkey;

alter table public.startup_members
  add constraint startup_members_startup_id_fkey
  foreign key (startup_id)
  references public.startups(id)
  on delete set null;
