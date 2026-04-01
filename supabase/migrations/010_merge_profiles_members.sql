-- ============================================================
-- Migración 010: Fusionar startup_members en profiles
-- Todos los miembros de startups son ahora usuarios SOI (profiles)
-- ============================================================

-- 1. Añadir campos de startup_members a profiles
alter table public.profiles
  add column if not exists role_title      text,
  add column if not exists member_type     text check (member_type in ('cofundador', 'empleado', 'advisor', 'becario', 'contratista')),
  add column if not exists dedication      text check (dedication in ('full-time', 'part-time', 'puntual')),
  add column if not exists office_schedule jsonb not null default '{}',
  add column if not exists joined_at       date,
  add column if not exists phone           text,
  add column if not exists linkedin_url    text,
  add column if not exists calendar_url    text,
  add column if not exists display_order   integer not null default 0;

-- 2. Migrar datos de startup_members a profiles
--    Solo los registros que tengan email y ese email exista en auth.users
update public.profiles p
set
  startup_id      = coalesce(p.startup_id, sm.startup_id),
  role_title      = coalesce(p.role_title, sm.role_title),
  member_type     = coalesce(p.member_type, sm.member_type),
  dedication      = coalesce(p.dedication, sm.dedication),
  office_schedule = case when p.office_schedule = '{}' then sm.office_schedule else p.office_schedule end,
  joined_at       = coalesce(p.joined_at, sm.joined_at),
  phone           = coalesce(p.phone, sm.phone),
  linkedin_url    = coalesce(p.linkedin_url, sm.linkedin_url),
  calendar_url    = coalesce(p.calendar_url, sm.calendar_url),
  display_order   = sm."order"
from public.startup_members sm
join auth.users u on lower(u.email) = lower(sm.email)
where p.id = u.id
  and sm.email is not null;

-- 3. RLS: admins pueden actualizar cualquier perfil
create policy "Admins actualizan todos los perfiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. RLS: admins pueden insertar perfiles (por si se necesita)
create policy "Admins insertan perfiles" on public.profiles
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. Eliminar la tabla startup_members
drop table if exists public.startup_members;
