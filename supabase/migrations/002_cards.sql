-- ============================================================
-- Migración 002: Tabla de tarjetas de contenido (Recursos)
-- Ejecutar en Supabase: SQL Editor > New query
-- ============================================================

-- ─── TABLA CARDS ─────────────────────────────────────────────
create table if not exists public.cards (
  id          uuid default uuid_generate_v4() primary key,
  section_id  text not null,  -- referencia al id de sección en areas.ts
  title       text not null,
  description text,
  type        text not null default 'resource' check (type in (
    'playbook', 'template', 'tool', 'ai_tool',
    'checklist', 'resource', 'external_link', 'agent'
  )),
  content     text,           -- contenido en texto plano / markdown
  url         text,           -- para tarjetas externas
  "order"     integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table public.cards enable row level security;

-- Todos los usuarios autenticados pueden leer las tarjetas activas
create policy "Usuarios ven tarjetas activas" on public.cards
  for select using (auth.role() = 'authenticated' and is_active = true);

-- Solo admins pueden gestionar tarjetas
create policy "Admins gestionan tarjetas" on public.cards
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── RENAME month → phase en entregables (si no se hizo ya) ──
-- Ejecutar solo si la columna todavía se llama "month":
-- alter table public.entregables rename column month to phase;

-- ─── RENAME current_month → current_phase en startups ────────
-- Ejecutar solo si la columna todavía se llama "current_month":
-- alter table public.startups rename column current_month to current_phase;
-- alter table public.startups rename constraint startups_current_month_check to startups_current_phase_check;
