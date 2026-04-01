-- ============================================================
-- Migración 003: Template fields en cards + tabla de respuestas
-- Ejecutar en Supabase: SQL Editor > New query
-- ============================================================

-- ─── Añadir template_fields a cards ──────────────────────────
alter table public.cards
  add column if not exists template_fields jsonb;

-- ─── TABLA TEMPLATE_RESPONSES ────────────────────────────────
-- Una fila por (tarjeta × startup). Upsert al guardar.
create table if not exists public.template_responses (
  id          uuid default uuid_generate_v4() primary key,
  card_id     uuid not null references public.cards(id) on delete cascade,
  startup_id  uuid not null references public.startups(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  responses   jsonb not null default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (card_id, startup_id)
);

alter table public.template_responses enable row level security;

-- Founders solo ven/editan sus propias respuestas
create policy "Founders ven sus respuestas" on public.template_responses
  for select using (
    startup_id = (
      select startup_id from public.profiles where id = auth.uid()
    )
  );

create policy "Founders upsert sus respuestas" on public.template_responses
  for insert with check (
    startup_id = (
      select startup_id from public.profiles where id = auth.uid()
    )
  );

create policy "Founders actualizan sus respuestas" on public.template_responses
  for update using (
    startup_id = (
      select startup_id from public.profiles where id = auth.uid()
    )
  );

-- Admins pueden leer todo
create policy "Admins leen respuestas" on public.template_responses
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger template_responses_updated_at
  before update on public.template_responses
  for each row execute function public.set_updated_at();
