-- ─────────────────────────────────────────────────────────────────────────────
-- 011 — Entregables v2
--   · 5 estados: pendiente, en_progreso, en_revision, cambios_solicitados, completado
--   · Campo tipo: archivos | formulario | link | checklist | externo
--   · file_slots: etiquetas definidas por el admin (solo tipo=archivos)
--   · reviewer_notes: nota del admin cuando pide cambios
--   · Elimina steps / completed_steps
--   · Tabla entregable_comments con soporte de hilo (parent_id)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Migrar valores de status al nuevo esquema
alter table public.entregables
  drop constraint if exists entregables_status_check;

update public.entregables set status = 'pendiente'   where status = 'pending';
update public.entregables set status = 'en_progreso'  where status = 'in_progress';
update public.entregables set status = 'completado'   where status = 'done';

alter table public.entregables
  add constraint entregables_status_check
  check (status in ('pendiente', 'en_progreso', 'en_revision', 'cambios_solicitados', 'completado'));

-- 2. Nuevas columnas
alter table public.entregables
  add column if not exists tipo           text default 'externo'
    check (tipo in ('archivos', 'formulario', 'link', 'checklist', 'externo')),
  add column if not exists file_slots     jsonb default '[]',
  add column if not exists reviewer_notes text;

-- 3. Eliminar columns de steps (ya no se usan)
alter table public.entregables
  drop column if exists steps,
  drop column if exists completed_steps;

-- 4. Tabla de comentarios
create table if not exists public.entregable_comments (
  id             uuid default uuid_generate_v4() primary key,
  entregable_id  uuid references public.entregables(id) on delete cascade not null,
  author_id      uuid references auth.users(id) on delete set null,
  parent_id      uuid references public.entregable_comments(id) on delete cascade,
  body           text not null check (char_length(body) > 0),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create trigger on_entregable_comments_updated
  before update on public.entregable_comments
  for each row execute function public.handle_updated_at();

-- 5. RLS para entregable_comments
alter table public.entregable_comments enable row level security;

-- Founders: pueden ver y escribir en sus propios entregables
create policy "founders_select_comments" on public.entregable_comments
  for select using (
    exists (
      select 1 from public.entregables e
      join public.profiles p on p.startup_id = e.startup_id
      where e.id = entregable_comments.entregable_id
        and p.id = auth.uid()
    )
  );

create policy "founders_insert_comments" on public.entregable_comments
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.entregables e
      join public.profiles p on p.startup_id = e.startup_id
      where e.id = entregable_comments.entregable_id
        and p.id = auth.uid()
    )
  );

-- Admins: acceso total
create policy "admins_all_comments" on public.entregable_comments
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Autores: pueden editar/borrar sus propios comentarios
create policy "authors_update_comments" on public.entregable_comments
  for update using (author_id = auth.uid());

create policy "authors_delete_comments" on public.entregable_comments
  for delete using (author_id = auth.uid());
