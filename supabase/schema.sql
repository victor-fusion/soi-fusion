-- ============================================================
-- SOI FUSIÓN — Esquema inicial de base de datos
-- Ejecutar en Supabase: SQL Editor > New query > pegar y ejecutar
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PERFILES DE USUARIO ─────────────────────────────────────
-- Extiende la tabla auth.users de Supabase
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text not null,
  role        text not null default 'founder' check (role in ('founder', 'admin')),
  startup_id  uuid,
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Los usuarios solo ven su propio perfil; los admins ven todos
create policy "Usuarios ven su perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Admins ven todos los perfiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Usuarios actualizan su perfil" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'founder')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── STARTUPS ────────────────────────────────────────────────
create table if not exists public.startups (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  sector          text,
  type            text default 'b2b_saas' check (type in ('b2b_saas', 'b2c_app', 'marketplace', 'producto_fisico', 'servicios')),
  status          text default 'activa' check (status in ('activa', 'en_pausa', 'en_revision', 'inactiva', 'cerrada')),
  batch           integer not null default 5,
  current_month   integer default 1 check (current_month between 1 and 6),
  north_star_metric text,
  north_star_value  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.startups enable row level security;

-- Founders ven solo su startup; admins ven todas
create policy "Founders ven su startup" on public.startups
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and startup_id = startups.id
    )
  );

create policy "Admins ven todas las startups" on public.startups
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- FK desde profiles a startups
alter table public.profiles
  add constraint fk_profiles_startup
  foreign key (startup_id) references public.startups(id) on delete set null;

-- ─── ENTREGABLES ─────────────────────────────────────────────
create table if not exists public.entregables (
  id              uuid default uuid_generate_v4() primary key,
  startup_id      uuid references public.startups(id) on delete cascade not null,
  title           text not null,
  description     text,
  area            text not null,
  section         text not null,
  month           integer not null check (month between 1 and 6),
  week            integer,
  status          text default 'pending' check (status in ('pending', 'in_progress', 'done')),
  deadline        date,
  steps           text[] default '{}',
  completed_steps integer[] default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.entregables enable row level security;

create policy "Founders ven sus entregables" on public.entregables
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and startup_id = entregables.startup_id
    )
  );

create policy "Founders actualizan sus entregables" on public.entregables
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and startup_id = entregables.startup_id
    )
  );

create policy "Admins gestionan todos los entregables" on public.entregables
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── CONTACTOS CRM ───────────────────────────────────────────
create table if not exists public.contacts (
  id              uuid default uuid_generate_v4() primary key,
  startup_id      uuid references public.startups(id) on delete cascade not null,
  full_name       text not null,
  company         text not null,
  role            text,
  email           text,
  linkedin_url    text,
  stage           text default 'contacto_inicial' check (stage in (
    'contacto_inicial', 'demo', 'propuesta', 'negociacion', 'cerrado_ganado', 'cerrado_perdido'
  )),
  deal_value      numeric(12,2),
  source          text default 'otro' check (source in (
    'linkedin', 'agente_ia', 'evento', 'referido', 'cold_email', 'otro'
  )),
  last_contact_at timestamptz,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.contacts enable row level security;

create policy "Founders ven sus contactos" on public.contacts
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and startup_id = contacts.startup_id
    )
  );

create policy "Founders gestionan sus contactos" on public.contacts
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and startup_id = contacts.startup_id
    )
  );

create policy "Admins ven todos los contactos" on public.contacts
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── TAREAS DE AGENTE SDR ─────────────────────────────────────
create table if not exists public.agent_tasks (
  id              uuid default uuid_generate_v4() primary key,
  startup_id      uuid references public.startups(id) on delete cascade not null,
  agent_type      text default 'sdr' check (agent_type in ('sdr', 'content', 'analyst')),
  status          text default 'pending_approval' check (status in (
    'pending_approval', 'approved', 'running', 'completed', 'rejected'
  )),
  input           jsonb default '{}',
  output          jsonb,
  approved_by     uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.agent_tasks enable row level security;

create policy "Admins gestionan tareas de agente" on public.agent_tasks
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Founders ven tareas de su startup" on public.agent_tasks
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and startup_id = agent_tasks.startup_id
    )
  );

-- ─── FUNCIÓN: actualizar updated_at automáticamente ──────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_startups_updated
  before update on public.startups
  for each row execute function public.handle_updated_at();

create trigger on_entregables_updated
  before update on public.entregables
  for each row execute function public.handle_updated_at();

create trigger on_contacts_updated
  before update on public.contacts
  for each row execute function public.handle_updated_at();

create trigger on_agent_tasks_updated
  before update on public.agent_tasks
  for each row execute function public.handle_updated_at();
