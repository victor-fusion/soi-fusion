-- ============================================================
-- Migración 008: Backfill entregables para startups existentes
-- Ejecutar solo si ya se ejecutó la migración 007 previamente.
-- ============================================================

-- ─── COLUMNA order en entregables (si no existe) ─────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'entregables' and column_name = 'order'
  ) then
    alter table public.entregables add column "order" integer default 0;
  end if;
end;
$$;

-- ─── BACKFILL: asignar entregables a startups ya existentes ──
-- Solo inserta para startups que todavía no tienen ningún entregable
insert into public.entregables (
  startup_id, title, description, area, section, phase, "order", steps, status
)
select
  s.id,
  t.title,
  t.description,
  t.area,
  t.section,
  t.phase,
  t."order",
  t.steps,
  'pending'
from public.startups s
cross join public.entregable_templates t
where t.is_active = true
  and not exists (
    select 1 from public.entregables e
    where e.startup_id = s.id
  );
