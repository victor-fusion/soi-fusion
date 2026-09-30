-- ─────────────────────────────────────────────────────────────────────────────
-- 014 · Registro de actividad para el MCP de SOI
--   1. Fechas y enlace en entregables + historial de cambios de estado
--   2. Historial de cambios de fase de cada startup
--   3. Responsable de Fusión por startup
--   4. Métricas mensuales por startup
--   5. Weeklies (reuniones semanales)
--   6. Actividad de usuarios (último acceso) para admins
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. ENTREGABLES ──────────────────────────────────────────────────────────

alter table public.entregables
  add column if not exists link_url      text,
  add column if not exists submitted_at  timestamptz,  -- último envío a revisión
  add column if not exists completed_at  timestamptz,  -- aprobado por Fusión
  add column if not exists reviewed_by   uuid references public.profiles(id) on delete set null;

-- Backfill aproximado (datos de prueba): la mejor fecha disponible es updated_at
update public.entregables
set submitted_at = coalesce(submitted_at, updated_at)
where status in ('en_revision', 'cambios_solicitados', 'completado');

update public.entregables
set completed_at = coalesce(completed_at, updated_at)
where status = 'completado';

create table if not exists public.entregable_events (
  id             uuid default uuid_generate_v4() primary key,
  entregable_id  uuid not null references public.entregables(id) on delete cascade,
  startup_id     uuid not null references public.startups(id) on delete cascade,
  from_status    text,
  to_status      text not null,
  actor_id       uuid references public.profiles(id) on delete set null,
  notes          text,
  created_at     timestamptz default now()
);

create index if not exists entregable_events_startup_idx    on public.entregable_events (startup_id, created_at desc);
create index if not exists entregable_events_entregable_idx on public.entregable_events (entregable_id, created_at desc);
create index if not exists entregable_events_to_status_idx  on public.entregable_events (to_status, created_at desc);

-- Fija submitted_at / completed_at / reviewed_by al cambiar de estado
create or replace function public.entregables_status_timestamps()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'en_revision' then
      new.submitted_at := now();
    end if;

    if new.status = 'completado' then
      new.completed_at := now();
      new.submitted_at := coalesce(new.submitted_at, now());
    elsif old.status = 'completado' then
      new.completed_at := null;
    end if;

    if new.status in ('completado', 'cambios_solicitados') then
      new.reviewed_by := auth.uid();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists entregables_status_timestamps on public.entregables;
create trigger entregables_status_timestamps
  before update of status on public.entregables
  for each row execute function public.entregables_status_timestamps();

-- Guarda cada cambio de estado en entregable_events
create or replace function public.log_entregable_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.entregable_events (entregable_id, startup_id, from_status, to_status, actor_id, notes)
    values (
      new.id, new.startup_id, old.status, new.status, auth.uid(),
      case when new.status = 'cambios_solicitados' then new.reviewer_notes end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists entregables_log_status on public.entregables;
create trigger entregables_log_status
  after update of status on public.entregables
  for each row execute function public.log_entregable_status_change();

alter table public.entregable_events enable row level security;

create policy "founders_select_entregable_events" on public.entregable_events
  for select using (
    startup_id = (select startup_id from public.profiles where id = auth.uid())
  );

create policy "admins_select_entregable_events" on public.entregable_events
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 2. HISTORIAL DE FASES ───────────────────────────────────────────────────

create table if not exists public.startup_phase_history (
  id          uuid default uuid_generate_v4() primary key,
  startup_id  uuid not null references public.startups(id) on delete cascade,
  from_phase  integer,
  to_phase    integer not null,
  changed_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

create index if not exists startup_phase_history_startup_idx on public.startup_phase_history (startup_id, created_at desc);

create or replace function public.log_startup_phase_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.current_phase is distinct from old.current_phase then
    insert into public.startup_phase_history (startup_id, from_phase, to_phase, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.current_phase end,
      new.current_phase,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists startups_log_phase on public.startups;
create trigger startups_log_phase
  after insert or update of current_phase on public.startups
  for each row execute function public.log_startup_phase_change();

-- Punto de partida: fase actual de cada startup a fecha de hoy
insert into public.startup_phase_history (startup_id, from_phase, to_phase)
select s.id, null, s.current_phase
from public.startups s
where not exists (select 1 from public.startup_phase_history h where h.startup_id = s.id);

alter table public.startup_phase_history enable row level security;

create policy "founders_select_phase_history" on public.startup_phase_history
  for select using (
    startup_id = (select startup_id from public.profiles where id = auth.uid())
  );

create policy "admins_select_phase_history" on public.startup_phase_history
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 3. RESPONSABLE DE FUSIÓN ────────────────────────────────────────────────

alter table public.startups
  add column if not exists fusion_owner_id uuid references public.profiles(id) on delete set null;

-- ─── 4. MÉTRICAS MENSUALES ───────────────────────────────────────────────────

create table if not exists public.startup_metrics (
  id                uuid default uuid_generate_v4() primary key,
  startup_id        uuid not null references public.startups(id) on delete cascade,
  period            date not null check (extract(day from period) = 1),  -- primer día del mes
  revenue           numeric,   -- facturación del mes (€)
  mrr               numeric,   -- ingresos recurrentes mensuales (€)
  paying_customers  integer,
  active_users      integer,
  pipeline_value    numeric,   -- valor del pipeline abierto (€)
  burn_rate         numeric,   -- gasto neto mensual (€)
  runway_months     numeric,
  notes             text,
  created_by        uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (startup_id, period)
);

create trigger startup_metrics_updated_at
  before update on public.startup_metrics
  for each row execute function public.set_updated_at();

alter table public.startup_metrics enable row level security;

create policy "founders_select_metrics" on public.startup_metrics
  for select using (
    startup_id = (select startup_id from public.profiles where id = auth.uid())
  );

create policy "founders_insert_metrics" on public.startup_metrics
  for insert with check (
    startup_id = (select startup_id from public.profiles where id = auth.uid())
  );

create policy "founders_update_metrics" on public.startup_metrics
  for update using (
    startup_id = (select startup_id from public.profiles where id = auth.uid())
  );

create policy "admins_all_metrics" on public.startup_metrics
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 5. WEEKLIES ─────────────────────────────────────────────────────────────

create table if not exists public.weeklies (
  id            uuid default uuid_generate_v4() primary key,
  startup_id    uuid not null references public.startups(id) on delete cascade,
  date          date not null,
  agenda        jsonb not null default '[]',   -- string[]
  action_items  jsonb not null default '[]',   -- ActionItem[]
  notes         text,
  created_by    uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists weeklies_startup_idx on public.weeklies (startup_id, date desc);

create trigger weeklies_updated_at
  before update on public.weeklies
  for each row execute function public.set_updated_at();

alter table public.weeklies enable row level security;

create policy "founders_select_weeklies" on public.weeklies
  for select using (
    startup_id = (select startup_id from public.profiles where id = auth.uid())
  );

create policy "admins_all_weeklies" on public.weeklies
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 6. ACTIVIDAD DE USUARIOS ────────────────────────────────────────────────
-- auth.users no es accesible vía RLS: esta función expone el último acceso
-- solo a admins.

create or replace function public.admin_user_activity()
returns table (user_id uuid, email text, last_sign_in_at timestamptz, confirmed boolean)
language sql stable security definer set search_path = public as $$
  select u.id, u.email::text, u.last_sign_in_at, u.email_confirmed_at is not null
  from auth.users u
  where exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

revoke all on function public.admin_user_activity() from public, anon;
grant execute on function public.admin_user_activity() to authenticated;
