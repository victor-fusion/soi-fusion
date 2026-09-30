import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { ok, safe } from "../context";
import { countBy, daysBetween, fetchAll, peopleById, personName, phaseNames, today } from "../data";
import { DATE, ENT_STATUSES, READ_ONLY, endOfDay, filterStartups, startupFilter } from "./shared";

const TRACKING_NOTE =
  "Las fechas de envío y aprobación se registran de forma exacta desde la migración 014; " +
  "antes de eso son aproximadas (fecha de la última modificación).";

export function registerEntregablesTools(server: McpServer) {
  // ─── buscar_entregables ────────────────────────────────────────────────────
  server.registerTool(
    "buscar_entregables",
    {
      title: "Buscar entregables",
      description:
        "Busca y cuenta entregables de las startups con filtros por startup, ciclo, título, área, fase, estado, " +
        "vencidos y rangos de fecha (límite, envío a revisión, aprobación). Con 'agrupar_por' devuelve recuentos. " +
        "Ejemplos: entregables pendientes de revisión; cuántos 'Funnel de ventas documentado' se han aprobado en los últimos 3 meses; " +
        "qué área acumula más vencidos. Si el título es ambiguo, consulta antes 'catalogo'. " + TRACKING_NOTE,
      inputSchema: z.object({
        ...startupFilter,
        titulo: z.string().optional().describe("Texto contenido en el título del entregable."),
        area: z.string().optional().describe("Id del área: estrategia, producto, growth, finanzas, legal, operaciones, equipo."),
        fase: z.number().int().min(1).max(6).optional(),
        estado: z.array(z.enum(ENT_STATUSES)).optional(),
        solo_vencidos: z.boolean().optional().describe("Fecha límite pasada y no completado."),
        solo_fase_actual: z.boolean().optional().describe("Solo entregables de la fase en la que está cada startup."),
        limite_desde: DATE.optional(), limite_hasta: DATE.optional(),
        enviado_desde: DATE.optional(), enviado_hasta: DATE.optional(),
        aprobado_desde: DATE.optional(), aprobado_hasta: DATE.optional(),
        agrupar_por: z.array(z.enum(["startup", "ciclo", "area", "fase", "estado", "titulo"])).optional()
          .describe("Devuelve recuentos agrupados por cada criterio indicado."),
        limite: z.number().int().min(0).max(500).optional().describe("Máximo de entregables listados (por defecto 50). 0 = solo recuentos."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      const { all, ids } = await filterStartups(db, userId, args);
      if (ids && ids.length === 0) return ok({ total: 0, entregables: [] });

      type Row = {
        id: string; startup_id: string; title: string; area: string; phase: number; status: string;
        deadline: string | null; link_url: string | null; submitted_at: string | null;
        completed_at: string | null; reviewer_notes: string | null;
      };
      let rows = await fetchAll<Row>(() => {
        let q = db.from("entregables")
          .select("id, startup_id, title, area, phase, status, deadline, link_url, submitted_at, completed_at, reviewer_notes")
          .order("deadline", { ascending: true, nullsFirst: false }).order("id");
        if (ids) q = q.in("startup_id", ids);
        if (args.titulo) q = q.ilike("title", `%${args.titulo}%`);
        if (args.area) q = q.eq("area", args.area);
        if (args.fase) q = q.eq("phase", args.fase);
        if (args.estado?.length) q = q.in("status", args.estado);
        if (args.solo_vencidos) q = q.lt("deadline", today()).neq("status", "completado");
        if (args.limite_desde) q = q.gte("deadline", args.limite_desde);
        if (args.limite_hasta) q = q.lte("deadline", args.limite_hasta);
        if (args.enviado_desde) q = q.gte("submitted_at", args.enviado_desde);
        if (args.enviado_hasta) q = q.lte("submitted_at", endOfDay(args.enviado_hasta)!);
        if (args.aprobado_desde) q = q.gte("completed_at", args.aprobado_desde);
        if (args.aprobado_hasta) q = q.lte("completed_at", endOfDay(args.aprobado_hasta)!);
        return q;
      });
      if (args.solo_fase_actual) rows = rows.filter((r) => all[r.startup_id]?.current_phase === r.phase);

      const keyFns: Record<string, (r: Row) => string | number> = {
        startup: (r) => all[r.startup_id]?.name ?? r.startup_id,
        ciclo: (r) => all[r.startup_id]?.batch ?? "?",
        area: (r) => r.area,
        fase: (r) => r.phase,
        estado: (r) => r.status,
        titulo: (r) => r.title,
      };
      const agrupado = args.agrupar_por?.length
        ? Object.fromEntries(args.agrupar_por.map((g) => [g, countBy(rows, keyFns[g])]))
        : undefined;

      const limite = args.limite ?? 50;
      return ok({
        total: rows.length,
        agrupado,
        entregables: rows.slice(0, limite).map((r) => ({
          ...r,
          startup: all[r.startup_id]?.name,
          ciclo: all[r.startup_id]?.batch,
          startup_id: undefined,
        })),
        truncado: rows.length > limite ? `Mostrando ${limite} de ${rows.length}` : undefined,
        nota: args.enviado_desde || args.aprobado_desde || args.enviado_hasta || args.aprobado_hasta ? TRACKING_NOTE : undefined,
      });
    })
  );

  // ─── historial ─────────────────────────────────────────────────────────────
  server.registerTool(
    "historial",
    {
      title: "Historial y tiempos",
      description:
        "Historial de cambios y tiempos medios. tipo='entregables': cambios de estado (envíos a revisión, aprobaciones, " +
        "cambios solicitados), tiempo medio de revisión de Fusión, tasa de devolución y quién revisa. " +
        "tipo='fases': cambios de fase de las startups y días medios que pasan en cada fase. " +
        "El historial existe desde la migración 014; lo anterior no está registrado.",
      inputSchema: z.object({
        tipo: z.enum(["entregables", "fases"]),
        ...startupFilter,
        desde: DATE.optional(),
        hasta: DATE.optional(),
        titulo: z.string().optional().describe("Solo tipo='entregables': texto del título."),
        a_estado: z.array(z.enum(ENT_STATUSES)).optional().describe("Solo tipo='entregables': estado de destino del cambio."),
        limite: z.number().int().min(0).max(500).optional().describe("Máximo de eventos listados (por defecto 30)."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      const { all, ids } = await filterStartups(db, userId, args);
      if (ids && ids.length === 0) return ok({ total: 0, eventos: [] });
      const limite = args.limite ?? 30;
      const hasta = endOfDay(args.hasta);

      if (args.tipo === "fases") {
        const phases = await phaseNames(db);
        type H = { startup_id: string; from_phase: number | null; to_phase: number; created_at: string };
        // Se lee el historial completo de las startups para poder calcular duraciones.
        const hist = await fetchAll<H>(() => {
          let q = db.from("startup_phase_history").select("startup_id, from_phase, to_phase, created_at").order("created_at").order("id");
          if (ids) q = q.in("startup_id", ids);
          return q;
        });

        const durations: Record<number, number[]> = {};
        const byStartup: Record<string, H[]> = {};
        for (const h of hist) (byStartup[h.startup_id] ??= []).push(h);
        for (const list of Object.values(byStartup)) {
          list.forEach((h, i) => {
            const next = list[i + 1];
            if (next) (durations[h.to_phase] ??= []).push(daysBetween(h.created_at, next.created_at));
          });
        }

        const inRange = hist.filter((h) => (!args.desde || h.created_at >= args.desde) && (!hasta || h.created_at <= hasta));
        return ok({
          total_cambios: inRange.length,
          dias_medios_por_fase: Object.fromEntries(
            Object.entries(phases).map(([n, name]) => {
              const d = durations[Number(n)] ?? [];
              return [`${n} · ${name}`, d.length ? { media_dias: Math.round(d.reduce((a, b) => a + b, 0) / d.length), muestras: d.length } : null];
            })
          ),
          eventos: inRange.slice(-limite).reverse().map((h) => ({
            startup: all[h.startup_id]?.name,
            de: h.from_phase ? phases[h.from_phase] : "(inicio del registro)",
            a: phases[h.to_phase],
            fecha: h.created_at,
          })),
          nota: "El registro de fases empezó con la migración 014; los tiempos solo cuentan cambios posteriores.",
        });
      }

      type E = {
        entregable_id: string; startup_id: string; from_status: string | null; to_status: string;
        actor_id: string | null; notes: string | null; created_at: string;
        entregables: { title: string; phase: number; area: string } | null;
      };
      const events = await fetchAll<E>(() => {
        let q = db.from("entregable_events")
          .select("entregable_id, startup_id, from_status, to_status, actor_id, notes, created_at, entregables!inner(title, phase, area)")
          .order("created_at").order("id");
        if (ids) q = q.in("startup_id", ids);
        if (args.titulo) q = q.ilike("entregables.title", `%${args.titulo}%`);
        if (args.desde) q = q.gte("created_at", args.desde);
        if (hasta) q = q.lte("created_at", hasta);
        return q;
      });
      const people = await peopleById(db);

      // Tiempo de revisión: de 'en_revision' al siguiente veredicto de Fusión sobre el mismo entregable
      const reviewDays: number[] = [];
      const lastSubmit: Record<string, string> = {};
      for (const e of events) {
        if (e.to_status === "en_revision") lastSubmit[e.entregable_id] = e.created_at;
        else if ((e.to_status === "completado" || e.to_status === "cambios_solicitados") && lastSubmit[e.entregable_id]) {
          reviewDays.push(daysBetween(lastSubmit[e.entregable_id], e.created_at));
          delete lastSubmit[e.entregable_id];
        }
      }
      const verdicts = events.filter((e) => e.to_status === "completado" || e.to_status === "cambios_solicitados");
      const filtered = args.a_estado?.length ? events.filter((e) => (args.a_estado as string[]).includes(e.to_status)) : events;

      return ok({
        total_eventos: filtered.length,
        por_estado_destino: countBy(filtered, (e) => e.to_status),
        revision: {
          veredictos: verdicts.length,
          aprobados: verdicts.filter((e) => e.to_status === "completado").length,
          devueltos_con_cambios: verdicts.filter((e) => e.to_status === "cambios_solicitados").length,
          tasa_devolucion_pct: verdicts.length
            ? Math.round((verdicts.filter((e) => e.to_status === "cambios_solicitados").length / verdicts.length) * 100)
            : null,
          dias_medios_revision: reviewDays.length ? +(reviewDays.reduce((a, b) => a + b, 0) / reviewDays.length).toFixed(1) : null,
          esperando_revision_ahora: Object.keys(lastSubmit).length,
          por_revisor: countBy(verdicts, (e) => personName(people[e.actor_id ?? ""]) ?? "desconocido"),
        },
        eventos: filtered.slice(-limite).reverse().map((e) => ({
          startup: all[e.startup_id]?.name,
          entregable: e.entregables?.title,
          fase: e.entregables?.phase,
          de: e.from_status,
          a: e.to_status,
          por: personName(people[e.actor_id ?? ""]),
          notas: e.notes,
          fecha: e.created_at,
        })),
      });
    })
  );
}
