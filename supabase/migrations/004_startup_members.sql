-- ============================================================
-- Migración 004: Tabla de miembros de startup
-- Ejecutar en Supabase: SQL Editor > New query
-- ============================================================

create table if not exists public.startup_members (
  id                uuid default uuid_generate_v4() primary key,
  startup_id        uuid not null references public.startups(id) on delete cascade,
  full_name         text not null,
  avatar_url        text,
  role_title        text,                        -- Ej: "CTO", "Head of Sales"
  member_type       text not null default 'cofundador' check (member_type in (
                      'cofundador', 'empleado', 'advisor', 'becario', 'contratista'
                    )),
  dedication        text not null default 'full-time' check (dedication in (
                      'full-time', 'part-time', 'puntual'
                    )),
  -- Franjas horarias por día: {"monday": [{"start":"09:00","end":"14:00"}], ...}
  office_schedule   jsonb default '{}'::jsonb,
  joined_at         date,
  email             text,
  phone             text,
  linkedin_url      text,
  calendar_url      text,
  "order"           integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.startup_members enable row level security;

-- Founders ven los miembros de su propia startup
create policy "Founders ven su equipo" on public.startup_members
  for select using (
    startup_id = (
      select startup_id from public.profiles where id = auth.uid()
    )
  );

-- Admins ven y gestionan todo
create policy "Admins gestionan miembros" on public.startup_members
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trigger updated_at
create trigger startup_members_updated_at
  before update on public.startup_members
  for each row execute function public.set_updated_at();
