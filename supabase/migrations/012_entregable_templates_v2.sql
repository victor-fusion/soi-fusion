-- ─────────────────────────────────────────────────────────────────────────────
-- 012 — Entregable Templates v2
--   · Añade tipo y file_slots a entregable_templates
--   · Añade template_id (FK nullable) a entregables
--   · Backfill template_id para instancias existentes que coincidan por título+área+fase
--   · Actualiza el trigger para copiar tipo, file_slots y template_id al crear startup
--   · Corrige el status inicial de 'pending' a 'pendiente' en el trigger
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Nuevos campos en entregable_templates
alter table public.entregable_templates
  add column if not exists tipo       text default 'externo'
    check (tipo in ('archivos', 'formulario', 'link', 'checklist', 'externo')),
  add column if not exists file_slots jsonb default '[]';

-- 2. Eliminar columna steps de templates (ya no se usa)
alter table public.entregable_templates
  drop column if exists steps;

-- 3. FK template_id en entregables (nullable — instancias custom lo tienen NULL)
alter table public.entregables
  add column if not exists template_id uuid
    references public.entregable_templates(id) on delete set null;

-- 4. Backfill template_id para instancias ya existentes (match por título + área + fase)
update public.entregables e
set template_id = t.id
from public.entregable_templates t
where e.title  = t.title
  and e.area   = t.area
  and e.phase  = t.phase
  and e.template_id is null;

-- 5. Actualizar trigger para usar nuevos campos y status correcto
create or replace function public.assign_entregables_to_startup()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.entregables (
    startup_id, template_id, title, description,
    area, section, phase, "order",
    tipo, file_slots, status
  )
  select
    new.id,
    t.id,
    t.title,
    t.description,
    t.area,
    t.section,
    t.phase,
    t."order",
    t.tipo,
    t.file_slots,
    'pendiente'
  from public.entregable_templates t
  where t.is_active = true;

  return new;
end;
$$;
