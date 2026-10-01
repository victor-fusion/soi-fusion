-- ─────────────────────────────────────────────────────────────────────────────
-- 016 · Gestión de contactos vía MCP
--   1. profiles.mcp_contacts: permiso para crear/editar/borrar contactos y
--      miembros desde el MCP (solo Víctor por ahora). Lo protege el trigger
--      protect_profile_fields de la migración 015 (ampliado aquí).
--   2. fusion_contacts: CRM propio de Fusión (inversores, partners, mentores…)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Permiso de contactos ─────────────────────────────────────────────────

alter table public.profiles
  add column if not exists mcp_contacts boolean not null default false;

update public.profiles set mcp_contacts = true where lower(email) = 'victor@fusionstartups.com';

create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if (new.role, new.startup_id, new.mcp_write, new.mcp_contacts, new.email)
     is distinct from (old.role, old.startup_id, old.mcp_write, old.mcp_contacts, old.email)
  then
    raise exception 'Solo un admin puede cambiar rol, startup, email o permisos.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- ─── 2. CRM de Fusión ────────────────────────────────────────────────────────

create table if not exists public.fusion_contacts (
  id               uuid default uuid_generate_v4() primary key,
  full_name        text not null,
  company          text,
  role             text,
  category         text not null default 'otro' check (category in (
                     'inversor', 'partner', 'mentor', 'cliente', 'proveedor',
                     'institucion', 'candidato', 'startup_candidata', 'prensa', 'otro'
                   )),
  status           text not null default 'activo' check (status in (
                     'nuevo', 'activo', 'en_conversacion', 'colaborando', 'inactivo', 'descartado'
                   )),
  email            text,
  phone            text,
  linkedin_url     text,
  tags             text[] not null default '{}',
  notes            text,
  last_contact_at  date,
  owner_id         uuid references public.profiles(id) on delete set null,
  created_by       uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists fusion_contacts_category_idx on public.fusion_contacts (category);
create index if not exists fusion_contacts_name_idx on public.fusion_contacts (lower(full_name));

create trigger fusion_contacts_updated_at
  before update on public.fusion_contacts
  for each row execute function public.set_updated_at();

alter table public.fusion_contacts enable row level security;

create policy "admins_all_fusion_contacts" on public.fusion_contacts
  for all using (public.is_admin());
