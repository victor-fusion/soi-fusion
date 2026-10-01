-- ─────────────────────────────────────────────────────────────────────────────
-- 017 · Tabla de ciclos
-- Hasta ahora el ciclo era solo un número en startups.batch (1-5 fijos en el
-- código). Aquí pasa a ser una entidad con fechas y un ciclo activo.
-- Fechas iniciales aproximadas (2 ciclos/año, abril y octubre, ciclo 5 = abril
-- 2026): revisarlas en Admin → Configuración.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.cycles (
  number      integer primary key check (number > 0),
  name        text,
  start_date  date,
  end_date    date,
  is_active   boolean not null default false,
  created_at  timestamptz default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- Solo un ciclo activo a la vez
create unique index if not exists cycles_one_active on public.cycles (is_active) where is_active;

insert into public.cycles (number, start_date, end_date, is_active) values
  (1, '2024-04-01', '2024-09-30', false),
  (2, '2024-10-01', '2025-03-31', false),
  (3, '2025-04-01', '2025-09-30', false),
  (4, '2025-10-01', '2026-03-31', false),
  (5, '2026-04-01', '2026-09-30', false),
  (6, '2026-10-01', '2027-03-31', true)
on conflict (number) do nothing;

-- Cualquier ciclo que ya usen las startups y no esté arriba
insert into public.cycles (number)
select distinct batch from public.startups
on conflict (number) do nothing;

-- Integridad: una startup solo puede estar en un ciclo existente
alter table public.startups
  drop constraint if exists startups_batch_fkey;
alter table public.startups
  add constraint startups_batch_fkey foreign key (batch)
  references public.cycles(number) on update cascade;

alter table public.startups alter column batch drop default;

alter table public.cycles enable row level security;

create policy "cycles: todos pueden leer" on public.cycles
  for select using (true);

create policy "cycles: solo admins escriben" on public.cycles
  for all using (public.is_admin());
