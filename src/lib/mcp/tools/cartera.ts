import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { ok, safe } from "../context";
import {
  AT_RISK_THRESHOLD, assertOk, countBy, entregablesLite, peopleById,
  personName, phaseNames, progressFor, resolveStartup, today, type StartupRow,
} from "../data";
import { ENT_STATUSES, READ_ONLY, STARTUP_STATUSES, STARTUP_TYPES } from "./shared";


export function registerCarteraTools(server: McpServer) {
  // ─── catalogo ──────────────────────────────────────────────────────────────
  server.registerTool(
    "catalogo",
    {
      title: "Catálogo del SOI",
      description:
        "Estructura del programa de Fusión Startups: las fases del ciclo (número, nombre, objetivo), " +
        "las áreas y secciones, los entregables tipo de cada fase y los ciclos existentes. " +
        "Úsala para traducir nombres que dé el usuario (p. ej. 'fase Vender', 'Funnel de ventas') a los valores exactos que aceptan las demás herramientas.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    safe(async (_args, { db }) => {
      const [phases, areas, sections, templates, batches] = await Promise.all([
        db.from("phases").select("number, name, description").order("number"),
        db.from("areas").select("id, name").order("sort_order"),
        db.from("area_sections").select("id, area_id, name").order("sort_order"),
        db.from("entregable_templates").select("phase, area, section, title, description").eq("is_active", true).order("phase").order("order"),
        db.from("startups").select("batch"),
      ]);
      const secs = assertOk(sections) as { id: string; area_id: string; name: string }[];
      return ok({
        fases: assertOk(phases),
        areas: (assertOk(areas) as { id: string; name: string }[]).map((a) => ({
          ...a,
          secciones: secs.filter((s) => s.area_id === a.id).map(({ id, name }) => ({ id, name })),
        })),
        entregables_tipo: assertOk(templates),
        ciclos: [...new Set((assertOk(batches) as { batch: number }[]).map((b) => b.batch))].sort(),
        estados_startup: STARTUP_STATUSES,
        tipos_startup: STARTUP_TYPES,
        estados_entregable: ENT_STATUSES,
        criterio_en_riesgo: `startup activa con menos del ${AT_RISK_THRESHOLD}% de entregables completados en su fase actual`,
        hoy: today(),
      });
    })
  );

  // ─── resumen_cartera ───────────────────────────────────────────────────────
  server.registerTool(
    "resumen_cartera",
    {
      title: "Resumen de la cartera",
      description:
        "Visión global de las startups de Fusión: cuántas hay por estado, tipo y fase; progreso medio; " +
        "startups en riesgo; datos incompletos (sin fecha de inicio o sin responsable) y comparativa por ciclo. " +
        "Sin 'ciclo' resume todos los ciclos.",
      inputSchema: z.object({
        ciclo: z.number().int().optional().describe("Número de ciclo (batch). Omitir para todos."),
      }),
      annotations: READ_ONLY,
    },
    safe(async ({ ciclo }, { db }) => {
      let q = db.from("startups").select("*").order("name");
      if (ciclo !== undefined) q = q.eq("batch", ciclo);
      const startups = assertOk(await q) as StartupRow[];
      const [ents, phases, people] = await Promise.all([
        entregablesLite(db, startups.map((s) => s.id)),
        phaseNames(db),
        peopleById(db),
      ]);

      const withProgress = startups.map((s) => ({ s, p: progressFor(s, ents) }));
      const activas = withProgress.filter(({ s }) => s.status === "activa");
      const avg = (rows: typeof withProgress) =>
        rows.length ? Math.round(rows.reduce((a, r) => a + r.p.fase_actual_pct, 0) / rows.length) : 0;

      const porCiclo = Object.entries(countBy(startups, (s) => s.batch)).map(([batch]) => {
        const rows = withProgress.filter(({ s }) => String(s.batch) === batch);
        const act = rows.filter(({ s }) => s.status === "activa");
        return {
          ciclo: Number(batch),
          startups: rows.length,
          activas: act.length,
          progreso_medio_fase_actual_activas: avg(act),
          por_fase_activas: countBy(act, ({ s }) => phases[s.current_phase] ?? s.current_phase),
        };
      });

      return ok({
        ciclo: ciclo ?? "todos",
        total_startups: startups.length,
        por_estado: countBy(startups, (s) => s.status),
        por_tipo: countBy(startups, (s) => s.type),
        activas_por_fase: countBy(activas, ({ s }) => `${s.current_phase} · ${phases[s.current_phase] ?? "?"}`),
        progreso_medio_fase_actual_activas: avg(activas),
        en_riesgo: activas
          .filter(({ p }) => p.fase_actual_pct < AT_RISK_THRESHOLD)
          .map(({ s, p }) => ({
            startup: s.name, ciclo: s.batch, fase: phases[s.current_phase],
            progreso_fase_pct: p.fase_actual_pct, vencidos: p.vencidos,
            responsable: personName(people[s.fusion_owner_id ?? ""]),
          })),
        entregables_en_revision: activas.reduce((a, r) => a + r.p.en_revision, 0),
        sin_fecha_inicio_ciclo: startups.filter((s) => !s.cycle_start_date).map((s) => s.name),
        sin_responsable_fusion: startups.filter((s) => !s.fusion_owner_id && s.status === "activa").map((s) => s.name),
        por_ciclo: ciclo === undefined ? porCiclo : undefined,
      });
    })
  );

  // ─── buscar_startups ───────────────────────────────────────────────────────
  server.registerTool(
    "buscar_startups",
    {
      title: "Buscar startups",
      description:
        "Lista startups con filtros (ciclo, fase, estado, tipo, nombre, responsable de Fusión, en riesgo) " +
        "e indica para cada una su progreso en la fase actual, entregables vencidos y en revisión. Devuelve también el total.",
      inputSchema: z.object({
        ciclo: z.number().int().optional(),
        fase: z.number().int().min(1).max(6).optional().describe("Número de fase actual (1-6). Ver 'catalogo' para los nombres."),
        estado: z.array(z.enum(STARTUP_STATUSES)).optional(),
        tipo: z.array(z.enum(STARTUP_TYPES)).optional(),
        texto: z.string().optional().describe("Busca en nombre, tagline o sector."),
        responsable: z.string().optional().describe("Nombre o email del responsable de Fusión, o 'yo' para el usuario actual."),
        solo_en_riesgo: z.boolean().optional(),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      let q = db.from("startups").select("*").order("batch", { ascending: false }).order("name");
      if (args.ciclo !== undefined) q = q.eq("batch", args.ciclo);
      if (args.fase !== undefined) q = q.eq("current_phase", args.fase);
      if (args.estado?.length) q = q.in("status", args.estado);
      if (args.tipo?.length) q = q.in("type", args.tipo);
      if (args.texto) {
        const t = args.texto.replace(/[,()]/g, " ").trim();
        q = q.or(`name.ilike.%${t}%,tagline.ilike.%${t}%,sector.ilike.%${t}%`);
      }
      let startups = assertOk(await q) as StartupRow[];

      const [ents, phases, people] = await Promise.all([
        entregablesLite(db, startups.map((s) => s.id)),
        phaseNames(db),
        peopleById(db),
      ]);

      if (args.responsable) {
        const r = args.responsable.toLowerCase();
        startups = startups.filter((s) => {
          if (!s.fusion_owner_id) return false;
          if (r === "yo") return s.fusion_owner_id === userId;
          const p = people[s.fusion_owner_id];
          return `${personName(p)} ${p?.email}`.toLowerCase().includes(r);
        });
      }

      let rows = startups.map((s) => {
        const p = progressFor(s, ents);
        return {
          id: s.id,
          startup: s.name,
          ciclo: s.batch,
          fase: `${s.current_phase} · ${phases[s.current_phase] ?? "?"}`,
          estado: s.status,
          tipo: s.type,
          sector: s.sector,
          responsable: personName(people[s.fusion_owner_id ?? ""]),
          inicio_ciclo: s.cycle_start_date,
          progreso_fase_pct: p.fase_actual_pct,
          en_riesgo: s.status === "activa" && p.fase_actual_pct < AT_RISK_THRESHOLD,
          vencidos: p.vencidos,
          en_revision: p.en_revision,
        };
      });
      if (args.solo_en_riesgo) rows = rows.filter((r) => r.en_riesgo);

      return ok({ total: rows.length, startups: rows });
    })
  );

  // ─── ficha_startup ─────────────────────────────────────────────────────────
  server.registerTool(
    "ficha_startup",
    {
      title: "Ficha de una startup",
      description:
        "Todo sobre una startup concreta: datos, responsable de Fusión, equipo, progreso por fase, " +
        "entregables pendientes y vencidos de la fase actual, últimas métricas, última weekly, historial de fases " +
        "y últimos movimientos de entregables. Acepta nombre (o parte) o id.",
      inputSchema: z.object({
        startup: z.string().describe("Nombre o id de la startup."),
      }),
      annotations: READ_ONLY,
    },
    safe(async ({ startup: ref }, { db }) => {
      const s = await resolveStartup(db, ref);
      const t = today();

      const [entsRes, teamRes, metricsRes, weeklyRes, phaseHistRes, eventsRes, phases, people] = await Promise.all([
        db.from("entregables")
          .select("id, title, area, phase, status, deadline, link_url, submitted_at, completed_at, reviewer_notes")
          .eq("startup_id", s.id).order("phase").order("order"),
        db.from("profiles")
          .select("id, email, full_name, first_name, last_name, role_title, member_type, dedication, phone, linkedin_url")
          .eq("startup_id", s.id).order("display_order"),
        db.from("startup_metrics").select("*").eq("startup_id", s.id).order("period", { ascending: false }).limit(3),
        db.from("weeklies").select("date, agenda, action_items, notes").eq("startup_id", s.id).order("date", { ascending: false }).limit(1),
        db.from("startup_phase_history").select("from_phase, to_phase, created_at").eq("startup_id", s.id).order("created_at"),
        db.from("entregable_events")
          .select("to_status, from_status, notes, created_at, entregables(title)")
          .eq("startup_id", s.id).order("created_at", { ascending: false }).limit(10),
        phaseNames(db),
        peopleById(db),
      ]);

      type Ent = { id: string; title: string; area: string; phase: number; status: string; deadline: string | null; link_url: string | null; submitted_at: string | null; completed_at: string | null; reviewer_notes: string | null };
      const ents = assertOk(entsRes) as Ent[];
      const progress = progressFor(s, ents.map((e) => ({ ...e, startup_id: s.id })));

      const porFase = Object.entries(phases).map(([n, name]) => {
        const f = ents.filter((e) => e.phase === Number(n));
        return { fase: `${n} · ${name}`, total: f.length, por_estado: countBy(f, (e) => e.status) };
      });

      const pendientesFaseActual = ents
        .filter((e) => e.phase === s.current_phase && e.status !== "completado")
        .map(({ id, title, area, status, deadline, link_url, reviewer_notes }) => ({ id, title, area, status, deadline, link_url, reviewer_notes }));

      return ok({
        startup: {
          id: s.id, nombre: s.name, tagline: s.tagline, sector: s.sector, tipo: s.type, estado: s.status,
          ciclo: s.batch, fase_actual: `${s.current_phase} · ${phases[s.current_phase] ?? "?"}`,
          inicio_ciclo: s.cycle_start_date, web: s.web_url,
          metrica_norte: s.north_star_metric ? { metrica: s.north_star_metric, valor: s.north_star_value } : null,
          responsable_fusion: personName(people[s.fusion_owner_id ?? ""]),
        },
        progreso: { ...progress, en_riesgo: s.status === "activa" && progress.fase_actual_pct < AT_RISK_THRESHOLD },
        equipo: (assertOk(teamRes) as Record<string, unknown>[]).map((m) => ({
          nombre: personName(m as never), email: m.email, cargo: m.role_title,
          tipo: m.member_type, dedicacion: m.dedication, telefono: m.phone, linkedin: m.linkedin_url,
        })),
        entregables_por_fase: porFase,
        pendientes_fase_actual: pendientesFaseActual,
        vencidos: ents
          .filter((e) => e.deadline && e.deadline < t && e.status !== "completado")
          .map(({ title, phase, status, deadline }) => ({ title, fase: phase, status, deadline })),
        ultimas_metricas: assertOk(metricsRes),
        ultima_weekly: (assertOk(weeklyRes) as unknown[])[0] ?? null,
        historial_fases: (assertOk(phaseHistRes) as { from_phase: number | null; to_phase: number; created_at: string }[])
          .map((h) => ({ de: h.from_phase ? phases[h.from_phase] : null, a: phases[h.to_phase], fecha: h.created_at })),
        ultimos_movimientos: assertOk(eventsRes),
      });
    })
  );
}
