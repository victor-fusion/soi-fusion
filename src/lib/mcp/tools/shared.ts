import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { allStartups, resolveStartup, type StartupRow } from "../data";

export const STARTUP_STATUSES = ["activa", "en_pausa", "en_revision", "inactiva", "cerrada"] as const;
export const STARTUP_TYPES = ["b2b_saas", "b2c_app", "marketplace", "producto_fisico", "servicios"] as const;
export const ENT_STATUSES = ["pendiente", "en_progreso", "en_revision", "cambios_solicitados", "completado"] as const;

export const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;
export const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD");

/** Fin del día para comparar con columnas timestamptz. */
export const endOfDay = (d?: string) => (d ? `${d}T23:59:59` : undefined);

/** Filtro común de startups. */
export const startupFilter = {
  startup: z.string().optional().describe("Nombre o id de una startup concreta."),
  ciclo: z.number().int().optional(),
  estado_startup: z.array(z.enum(STARTUP_STATUSES)).optional()
    .describe("Filtra por estado de la startup, p. ej. ['activa'] para ignorar cerradas."),
  solo_mis_startups: z.boolean().optional()
    .describe("Solo startups cuyo responsable de Fusión es el usuario actual."),
};

export interface StartupFilterArgs {
  startup?: string;
  ciclo?: number;
  estado_startup?: string[];
  solo_mis_startups?: boolean;
}

/** Startups que cumplen el filtro. ids = null significa sin filtro (todas). */
export async function filterStartups(
  db: SupabaseClient, userId: string, args: StartupFilterArgs
): Promise<{ all: Record<string, StartupRow>; ids: string[] | null }> {
  const list = await allStartups(db);
  const all = Object.fromEntries(list.map((s) => [s.id, s]));

  if (args.startup) {
    const s = await resolveStartup(db, args.startup);
    return { all, ids: [s.id] };
  }
  if (args.ciclo === undefined && !args.estado_startup?.length && !args.solo_mis_startups) {
    return { all, ids: null };
  }
  const ids = list
    .filter((s) => args.ciclo === undefined || s.batch === args.ciclo)
    .filter((s) => !args.estado_startup?.length || args.estado_startup.includes(s.status))
    .filter((s) => !args.solo_mis_startups || s.fusion_owner_id === userId)
    .map((s) => s.id);
  return { all, ids };
}
