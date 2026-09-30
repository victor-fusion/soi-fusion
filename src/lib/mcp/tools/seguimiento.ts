import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { ok, safe } from "../context";
import { assertOk, countBy, daysBetween, fetchAll, personName, today, type PersonRow } from "../data";
import { DATE, READ_ONLY, endOfDay, filterStartups, startupFilter } from "./shared";

const DAYS: Record<string, string> = {
  lunes: "monday", martes: "tuesday", miercoles: "wednesday", jueves: "thursday",
  viernes: "friday", sabado: "saturday", domingo: "sunday",
};

export function registerSeguimientoTools(server: McpServer) {
  // ─── metricas ──────────────────────────────────────────────────────────────
  server.registerTool(
    "metricas",
    {
      title: "Métricas de negocio",
      description:
        "Métricas mensuales registradas por startup: facturación, MRR, clientes de pago, usuarios activos, pipeline, " +
        "burn rate y runway. Sirve para preguntas como '¿cuántas startups facturan ya?' o 'evolución del MRR de X'.",
      inputSchema: z.object({
        ...startupFilter,
        desde: DATE.optional().describe("Primer mes incluido (YYYY-MM-01)."),
        hasta: DATE.optional(),
        solo_ultimo_mes: z.boolean().optional().describe("Solo el registro más reciente de cada startup."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      const { all, ids } = await filterStartups(db, userId, args);
      if (ids && ids.length === 0) return ok({ total: 0, metricas: [] });

      type M = { startup_id: string; period: string; revenue: number | null; mrr: number | null; paying_customers: number | null; active_users: number | null; pipeline_value: number | null; burn_rate: number | null; runway_months: number | null; notes: string | null };
      let rows = await fetchAll<M>(() => {
        let q = db.from("startup_metrics").select("*").order("period", { ascending: false }).order("id");
        if (ids) q = q.in("startup_id", ids);
        if (args.desde) q = q.gte("period", args.desde);
        if (args.hasta) q = q.lte("period", args.hasta);
        return q;
      });
      if (args.solo_ultimo_mes) {
        const seen = new Set<string>();
        rows = rows.filter((r) => !seen.has(r.startup_id) && seen.add(r.startup_id));
      }

      const facturan = new Set(rows.filter((r) => (r.revenue ?? 0) > 0 || (r.mrr ?? 0) > 0).map((r) => r.startup_id));
      return ok({
        total_registros: rows.length,
        startups_con_registros: new Set(rows.map((r) => r.startup_id)).size,
        startups_que_facturan: [...facturan].map((id) => all[id]?.name),
        metricas: rows.map(({ startup_id, ...r }) => ({ startup: all[startup_id]?.name, ciclo: all[startup_id]?.batch, ...r })),
      });
    })
  );

  // ─── weeklies ──────────────────────────────────────────────────────────────
  server.registerTool(
    "weeklies",
    {
      title: "Weeklies",
      description:
        "Reuniones semanales con las startups: agenda, notas y tareas acordadas (con responsable, fecha y si están hechas). " +
        "Con 'solo_tareas_abiertas' lista las tareas pendientes de todas las weeklies filtradas.",
      inputSchema: z.object({
        ...startupFilter,
        desde: DATE.optional(),
        hasta: DATE.optional(),
        solo_tareas_abiertas: z.boolean().optional(),
        limite: z.number().int().min(1).max(100).optional().describe("Máximo de weeklies (por defecto 5)."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      const { all, ids } = await filterStartups(db, userId, args);
      if (ids && ids.length === 0) return ok({ total: 0, weeklies: [] });

      type W = { startup_id: string; date: string; agenda: string[]; action_items: { text: string; owner: string; due_date?: string; done: boolean }[]; notes: string | null };
      let q = db.from("weeklies").select("startup_id, date, agenda, action_items, notes").order("date", { ascending: false });
      if (ids) q = q.in("startup_id", ids);
      if (args.desde) q = q.gte("date", args.desde);
      if (args.hasta) q = q.lte("date", args.hasta);
      const rows = assertOk(await q.limit(args.solo_tareas_abiertas ? 500 : args.limite ?? 5)) as W[];

      if (args.solo_tareas_abiertas) {
        const t = today();
        const tareas = rows.flatMap((w) =>
          (w.action_items ?? []).filter((a) => !a.done).map((a) => ({
            startup: all[w.startup_id]?.name, weekly: w.date, tarea: a.text, responsable: a.owner,
            fecha: a.due_date, vencida: !!a.due_date && a.due_date < t,
          }))
        );
        return ok({ total_tareas_abiertas: tareas.length, tareas });
      }
      return ok({
        total: rows.length,
        weeklies: rows.map(({ startup_id, ...w }) => ({ startup: all[startup_id]?.name, ...w })),
      });
    })
  );

  // ─── personas ──────────────────────────────────────────────────────────────
  server.registerTool(
    "personas",
    {
      title: "Personas y adopción",
      description:
        "Personas del SOI (founders y equipo de Fusión): startup, cargo, tipo, dedicación, horario de oficina, " +
        "último acceso al SOI y startups a cargo de cada responsable de Fusión. Incluye las startups activas sin ningún " +
        "usuario dado de alta. El último acceso solo lo ven los admins.",
      inputSchema: z.object({
        ...startupFilter,
        rol: z.enum(["founder", "admin"]).optional(),
        dia_oficina: z.enum(Object.keys(DAYS) as [string, ...string[]]).optional()
          .describe("Solo personas con horario de oficina ese día (sin tildes)."),
        sin_acceso_dias: z.number().int().min(1).optional()
          .describe("Solo personas que no han entrado en los últimos N días (o nunca)."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      const { all, ids } = await filterStartups(db, userId, args);

      type P = PersonRow & { role_title: string | null; member_type: string | null; dedication: string | null; office_schedule: Record<string, { start: string; end: string }[]> };
      let people = await fetchAll<P>(() => {
        let q = db.from("profiles")
          .select("id, email, full_name, first_name, last_name, role, startup_id, role_title, member_type, dedication, office_schedule")
          .order("id");
        if (args.rol) q = q.eq("role", args.rol);
        return q;
      });
      if (ids) people = people.filter((p) => p.startup_id && ids.includes(p.startup_id));

      const { data: activity } = await db.rpc("admin_user_activity");
      const lastSeen = Object.fromEntries(
        ((activity ?? []) as { user_id: string; last_sign_in_at: string | null }[]).map((a) => [a.user_id, a.last_sign_in_at])
      );
      const canSeeActivity = (activity ?? []).length > 0;

      const day = args.dia_oficina ? DAYS[args.dia_oficina] : undefined;
      if (day) people = people.filter((p) => (p.office_schedule?.[day] ?? []).length > 0);
      if (args.sin_acceso_dias && canSeeActivity) {
        people = people.filter((p) => {
          const seen = lastSeen[p.id];
          return !seen || daysBetween(seen, new Date()) >= args.sin_acceso_dias!;
        });
      }

      const startupsList = Object.values(all);
      const withUsers = new Set(people.map((p) => p.startup_id));
      return ok({
        total: people.length,
        personas: people.map((p) => ({
          nombre: personName(p), email: p.email, rol: p.role,
          startup: p.startup_id ? all[p.startup_id]?.name : null,
          cargo: p.role_title, tipo: p.member_type, dedicacion: p.dedication,
          horario_dia: day ? p.office_schedule?.[day] : undefined,
          ultimo_acceso: canSeeActivity ? lastSeen[p.id] ?? "nunca" : undefined,
          startups_a_cargo: p.role === "admin"
            ? startupsList.filter((s) => s.fusion_owner_id === p.id).map((s) => s.name)
            : undefined,
        })),
        startups_activas_sin_usuarios: args.rol || day || args.sin_acceso_dias || args.startup
          ? undefined
          : startupsList.filter((s) => s.status === "activa" && (!ids || ids.includes(s.id)) && !withUsers.has(s.id)).map((s) => s.name),
        nota: canSeeActivity ? undefined : "Último acceso no disponible: requiere rol admin.",
      });
    })
  );

  // ─── arsenal ───────────────────────────────────────────────────────────────
  server.registerTool(
    "arsenal",
    {
      title: "Arsenal de recursos",
      description:
        "Biblioteca de contenido del SOI (playbooks, plantillas, herramientas, checklists…) por área y sección, " +
        "secciones que aún no tienen contenido y qué startups han rellenado cada plantilla.",
      inputSchema: z.object({
        area: z.string().optional().describe("Id del área (ver 'catalogo')."),
        seccion: z.string().optional().describe("Id de la sección (ver 'catalogo')."),
        tipo: z.enum(["playbook", "template", "tool", "ai_tool", "checklist", "resource", "external_link", "agent"]).optional(),
        texto: z.string().optional().describe("Busca en título y descripción."),
        incluir_contenido: z.boolean().optional().describe("Incluye el texto completo de cada tarjeta."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db }) => {
      const [cardsRes, sectionsRes, responsesRes, startupsRes] = await Promise.all([
        db.from("cards").select("id, section_id, title, description, type, url, content, template_fields").order("order"),
        db.from("area_sections").select("id, area_id, name"),
        db.from("template_responses").select("card_id, startup_id, updated_at"),
        db.from("startups").select("id, name"),
      ]);
      type Card = { id: string; section_id: string; title: string; description: string | null; type: string; url: string | null; content: string | null; template_fields: unknown[] | null };
      const sections = assertOk(sectionsRes) as { id: string; area_id: string; name: string }[];
      const responses = assertOk(responsesRes) as { card_id: string; startup_id: string; updated_at: string }[];
      const names = Object.fromEntries((assertOk(startupsRes) as { id: string; name: string }[]).map((s) => [s.id, s.name]));
      const sectionOf = Object.fromEntries(sections.map((s) => [s.id, s]));

      let cards = assertOk(cardsRes) as Card[];
      if (args.area) cards = cards.filter((c) => sectionOf[c.section_id]?.area_id === args.area);
      if (args.seccion) cards = cards.filter((c) => c.section_id === args.seccion);
      if (args.tipo) cards = cards.filter((c) => c.type === args.tipo);
      if (args.texto) {
        const t = args.texto.toLowerCase();
        cards = cards.filter((c) => `${c.title} ${c.description ?? ""}`.toLowerCase().includes(t));
      }

      const allCards = assertOk(cardsRes) as Card[];
      const withContent = new Set(allCards.map((c) => c.section_id));
      return ok({
        total: cards.length,
        tarjetas: cards.map((c) => {
          const rs = responses.filter((r) => r.card_id === c.id);
          return {
            titulo: c.title, tipo: c.type, descripcion: c.description, url: c.url,
            area: sectionOf[c.section_id]?.area_id, seccion: sectionOf[c.section_id]?.name ?? c.section_id,
            contenido: args.incluir_contenido ? c.content : undefined,
            startups_que_la_han_rellenado: c.template_fields ? rs.map((r) => names[r.startup_id]) : undefined,
          };
        }),
        secciones_sin_contenido: sections
          .filter((s) => !withContent.has(s.id) && (!args.area || s.area_id === args.area))
          .map((s) => `${s.area_id} › ${s.name}`),
        resumen_por_tipo: countBy(cards, (c) => c.type),
      });
    })
  );

  // ─── crm_y_agentes ─────────────────────────────────────────────────────────
  server.registerTool(
    "crm_y_agentes",
    {
      title: "CRM y agente SDR",
      description:
        "vista='pipeline': contactos del CRM de las startups por etapa (contacto inicial, demo, propuesta, negociación, " +
        "ganado, perdido), valor del pipeline y movimientos en un periodo. vista='agente': tareas del agente SDR por estado " +
        "y las que esperan aprobación.",
      inputSchema: z.object({
        vista: z.enum(["pipeline", "agente"]),
        ...startupFilter,
        desde: DATE.optional().describe("Solo contactos/tareas actualizados desde esta fecha."),
        hasta: DATE.optional(),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db, userId }) => {
      const { all, ids } = await filterStartups(db, userId, args);
      if (ids && ids.length === 0) return ok({ total: 0 });
      const hasta = endOfDay(args.hasta);

      if (args.vista === "agente") {
        type T = { id: string; startup_id: string; agent_type: string; status: string; input: unknown; output: unknown; created_at: string };
        const tasks = await fetchAll<T>(() => {
          let q = db.from("agent_tasks").select("id, startup_id, agent_type, status, input, output, created_at").order("created_at", { ascending: false }).order("id");
          if (ids) q = q.in("startup_id", ids);
          if (args.desde) q = q.gte("updated_at", args.desde);
          if (hasta) q = q.lte("updated_at", hasta);
          return q;
        });
        return ok({
          total: tasks.length,
          por_estado: countBy(tasks, (t) => t.status),
          esperando_aprobacion: tasks
            .filter((t) => t.status === "pending_approval")
            .map((t) => ({ id: t.id, startup: all[t.startup_id]?.name, agente: t.agent_type, propuesta: t.output ?? t.input, creada: t.created_at })),
        });
      }

      type C = { startup_id: string; company: string; full_name: string; stage: string; deal_value: number | null; source: string; last_contact_at: string | null; updated_at: string };
      const contacts = await fetchAll<C>(() => {
        let q = db.from("contacts").select("startup_id, company, full_name, stage, deal_value, source, last_contact_at, updated_at").order("id");
        if (ids) q = q.in("startup_id", ids);
        if (args.desde) q = q.gte("updated_at", args.desde);
        if (hasta) q = q.lte("updated_at", hasta);
        return q;
      });
      const sum = (rows: C[]) => rows.reduce((a, c) => a + (c.deal_value ?? 0), 0);
      const open = contacts.filter((c) => !c.stage.startsWith("cerrado"));
      const byStartup = Object.entries(countBy(contacts, (c) => c.startup_id)).map(([id, n]) => {
        const mine = contacts.filter((c) => c.startup_id === id);
        return {
          startup: all[id]?.name, contactos: n, por_etapa: countBy(mine, (c) => c.stage),
          valor_pipeline_abierto: sum(mine.filter((c) => !c.stage.startsWith("cerrado"))),
          valor_ganado: sum(mine.filter((c) => c.stage === "cerrado_ganado")),
        };
      });
      return ok({
        total_contactos: contacts.length,
        por_etapa: countBy(contacts, (c) => c.stage),
        por_origen: countBy(contacts, (c) => c.source),
        valor_pipeline_abierto: sum(open),
        valor_ganado: sum(contacts.filter((c) => c.stage === "cerrado_ganado")),
        por_startup: byStartup,
        nota: args.desde || args.hasta
          ? "El filtro de fechas usa la última actualización del contacto (no hay historial de etapas)."
          : undefined,
      });
    })
  );
}
