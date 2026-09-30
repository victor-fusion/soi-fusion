-- ─────────────────────────────────────────────────────────────────────────────
-- 015 · Permiso de escritura vía MCP + protección de campos sensibles
--   1. profiles.mcp_write (solo Víctor por ahora)
--   2. Perfil: rol, startup, email y permisos solo los cambia un admin
--   3. Entregables: el founder solo mueve pendiente/en_progreso/en_revision y el enlace
-- Las operaciones con service role (auth.uid() nulo) no se ven afectadas.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── 1. Permiso de escritura en el MCP ──────────────────────────────────────

alter table public.profiles
  add column if not exists mcp_write boolean not null default false;

update public.profiles set mcp_write = true where lower(email) = 'victor@fusionstartups.com';

-- ─── 2. Campos del perfil que solo puede cambiar un admin ────────────────────
-- La política "Usuarios actualizan su perfil" no limita columnas: sin esto un
-- founder podría hacerse admin, cambiarse de startup o darse permiso MCP.

create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if (new.role, new.startup_id, new.mcp_write, new.email)
     is distinct from (old.role, old.startup_id, old.mcp_write, old.email)
  then
    raise exception 'Solo un admin puede cambiar rol, startup, email o permisos.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ─── 3. Entregables: límites del founder ─────────────────────────────────────
-- El founder solo puede: mover el estado entre pendiente / en_progreso / en_revision
-- (nunca desde 'completado') y editar link_url. Aprobar o devolver es cosa de Fusión.
-- El nombre del trigger empieza por "a_" para ejecutarse antes que
-- entregables_status_timestamps (los BEFORE triggers van en orden alfabético).

create or replace function public.protect_entregable_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status and (
       old.status = 'completado'
       or new.status not in ('pendiente', 'en_progreso', 'en_revision')
     )
  then
    raise exception 'Solo el equipo de Fusión puede aprobar o devolver un entregable.'
      using errcode = '42501';
  end if;

  if (new.startup_id, new.template_id, new.title, new.description, new.area, new.section,
      new.phase, new.deadline, new.tipo, new.file_slots, new.reviewer_notes,
      new.submitted_at, new.completed_at, new.reviewed_by)
     is distinct from
     (old.startup_id, old.template_id, old.title, old.description, old.area, old.section,
      old.phase, old.deadline, old.tipo, old.file_slots, old.reviewer_notes,
      old.submitted_at, old.completed_at, old.reviewed_by)
  then
    raise exception 'Solo el equipo de Fusión puede modificar estos datos del entregable.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists a_entregables_protect_fields on public.entregables;
create trigger a_entregables_protect_fields
  before update on public.entregables
  for each row execute function public.protect_entregable_fields();
