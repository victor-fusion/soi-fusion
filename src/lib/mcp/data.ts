import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Utilidades de fecha (zona horaria de Fusión) ────────────────────────────

/** Fecha de hoy en Madrid, formato YYYY-MM-DD. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

export function daysBetween(from: string | Date, to: string | Date): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
}

// ─── Consultas ───────────────────────────────────────────────────────────────

type Query = { range: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }> };

/** Recorre todas las páginas de una consulta (PostgREST limita a 1000 filas por petición). */
export async function fetchAll<T>(build: () => Query): Promise<T[]> {
  const PAGE = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build().range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE) return rows;
  }
}

export function assertOk<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data;
}

export const UUID_RE =/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface StartupRow {
  id: string;
  name: string;
  tagline: string | null;
  sector: string | null;
  type: string;
  status: string;
  batch: number;
  current_phase: number;
  cycle_start_date: string | null;
  north_star_metric: string | null;
  north_star_value: string | null;
  web_url: string | null;
  fusion_owner_id: string | null;
  created_at: string;
}

export async function allStartups(db: SupabaseClient): Promise<StartupRow[]> {
  return fetchAll<StartupRow>(() => db.from("startups").select("*").order("id"));
}

/** Busca una startup por id o por nombre. Lanza error si no hay coincidencia única. */
export async function resolveStartup(db: SupabaseClient, ref: string): Promise<StartupRow> {
  const query = db.from("startups").select("*");
  const rows = assertOk(
    UUID_RE.test(ref) ? await query.eq("id", ref) : await query.ilike("name", `%${ref.trim()}%`)
  ) as StartupRow[];

  if (rows.length === 0) throw new Error(`No encuentro ninguna startup que coincida con "${ref}".`);
  if (rows.length > 1) {
    const exact = rows.find((r) => r.name.toLowerCase() === ref.trim().toLowerCase());
    if (exact) return exact;
    throw new Error(
      `"${ref}" coincide con varias startups: ${rows.map((r) => `${r.name} (ciclo ${r.batch})`).join(", ")}. Especifica cuál.`
    );
  }
  return rows[0];
}

// ─── Catálogos ───────────────────────────────────────────────────────────────

export async function phaseNames(db: SupabaseClient): Promise<Record<number, string>> {
  const rows = assertOk(await db.from("phases").select("number, name")) as { number: number; name: string }[];
  return Object.fromEntries(rows.map((p) => [p.number, p.name]));
}

export interface PersonRow {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  startup_id: string | null;
}

export function personName(p?: Pick<PersonRow, "full_name" | "first_name" | "last_name" | "email"> | null): string | null {
  if (!p) return null;
  const composed = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return composed || p.full_name || p.email;
}

export async function peopleById(db: SupabaseClient): Promise<Record<string, PersonRow>> {
  const rows = await fetchAll<PersonRow>(() =>
    db.from("profiles").select("id, email, full_name, first_name, last_name, role, startup_id")
  );
  return Object.fromEntries(rows.map((p) => [p.id, p]));
}

// ─── Progreso (mismo criterio que el Centro de Control) ──────────────────────

export const AT_RISK_THRESHOLD = 30;

export interface EntregableLite {
  startup_id: string;
  phase: number;
  status: string;
  deadline: string | null;
}

export interface Progress {
  fase_actual_completados: number;
  fase_actual_total: number;
  fase_actual_pct: number;
  total_completados: number;
  total: number;
  vencidos: number;
  en_revision: number;
}

export function progressFor(startup: Pick<StartupRow, "id" | "current_phase">, entregables: EntregableLite[]): Progress {
  const mine = entregables.filter((e) => e.startup_id === startup.id);
  const phase = mine.filter((e) => e.phase === startup.current_phase);
  const phaseDone = phase.filter((e) => e.status === "completado").length;
  const t = today();
  return {
    fase_actual_completados: phaseDone,
    fase_actual_total: phase.length,
    fase_actual_pct: phase.length ? Math.round((phaseDone / phase.length) * 100) : 0,
    total_completados: mine.filter((e) => e.status === "completado").length,
    total: mine.length,
    vencidos: mine.filter((e) => e.deadline && e.deadline < t && e.status !== "completado").length,
    en_revision: mine.filter((e) => e.status === "en_revision").length,
  };
}

export async function entregablesLite(db: SupabaseClient, startupIds: string[]): Promise<EntregableLite[]> {
  if (startupIds.length === 0) return [];
  return fetchAll<EntregableLite>(() =>
    db.from("entregables").select("startup_id, phase, status, deadline").in("startup_id", startupIds).order("id")
  );
}

/** Cuenta ocurrencias por clave. */
export function countBy<T>(rows: T[], key: (r: T) => string | number | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = String(key(r) ?? "sin_valor");
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
