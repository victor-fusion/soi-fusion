import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ok, safe, type ToolContext } from "../context";
import { assertOk, fetchAll, personName, phaseNames, resolveStartup, today, UUID_RE, type PersonRow } from "../data";
import { DATE, STARTUP_STATUSES, STARTUP_TYPES } from "./shared";
import { recomputeDeadlines } from "@/lib/data/deadlines";
import { activeCycle } from "@/lib/cycle-utils";
import type { Cycle } from "@/types";

// Escriben datos pero nunca borran. Los clientes MCP piden confirmación al usuario.
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;
const WRITE_NOTE = " Solo para usuarios con permiso de escritura en el MCP.";
const MONTH = z.string().regex(/^\d{4}-\d{2}$/, "Formato YYYY-MM");

/** Solo perfiles con profiles.mcp_write pueden usar herramientas de escritura. RLS aplica además. */
async function requireWriter({ db, userId }: ToolContext) {
  const { data } = await db.from("profiles").select("mcp_write").eq("id", userId).single();
  if (!data?.mcp_write) {
    throw new Error("No tienes permiso de escritura en el MCP de SOI. Pídeselo a un admin de Fusión.");
  }
}

/** Resuelve un responsable de Fusión por nombre, email o 'yo'. null = sin asignar. */
async function resolveOwner(db: SupabaseClient, userId: string, ref: string): Promise<string | null> {
  const r = ref.trim().toLowerCase();
  if (r === "ninguno" || r === "") return null;
  if (r === "yo") return userId;

  const admins = await fetchAll<PersonRow>(() =>
    db.from("profiles").select("id, email, full_name, first_name, last_name, role, startup_id").eq("role", "admin").order("id")
  );
  const matches = admins.filter((a) => `${personName(a)} ${a.email}`.toLowerCase().includes(r));
  if (matches.length !== 1) {
    throw new Error(
      matches.length === 0
        ? `No encuentro a "${ref}" en el equipo de Fusión.`
        : `"${ref}" coincide con varias personas: ${matches.map((m) => personName(m)).join(", ")}.`
    );
  }
  return matches[0].id;
}

const startupFields = {
  tipo: z.enum(STARTUP_TYPES).optional(),
  sector: z.string().optional(),
  tagline: z.string().max(120).optional(),
  web: z.string().url().optional(),
  fecha_inicio: DATE.optional().describe("Inicio del ciclo. Recalcula las fechas límite de los entregables."),
  responsable: z.string().optional().describe("Nombre o email del responsable de Fusión, 'yo' o 'ninguno'."),
  estado: z.enum(STARTUP_STATUSES).optional(),
};

export function registerEscrituraTools(server: McpServer) {
  // ─── crear_startup ─────────────────────────────────────────────────────────
  server.registerTool(
    "crear_startup",
    {
      title: "Crear startup",
      description:
        "Da de alta una startup nueva. Se le asignan automáticamente los entregables tipo de las 6 fases. " +
        "Sin 'ciclo' se usa el ciclo activo; sin 'fecha_inicio', la fecha de inicio del ciclo." + WRITE_NOTE,
      inputSchema: z.object({
        nombre: z.string().min(1),
        ciclo: z.number().int().min(1).optional().describe("Por defecto, el ciclo activo."),
        fase: z.number().int().min(1).max(6).optional().describe("Fase inicial (por defecto 1)."),
        ...startupFields,
      }),
      annotations: WRITE,
    },
    safe(async (args, tc) => {
      await requireWriter(tc);
      const { db, userId } = tc;

      const { data: existing } = await db.from("startups").select("id").ilike("name", args.nombre.trim());
      if (existing?.length) throw new Error(`Ya existe una startup llamada "${args.nombre}".`);

      const cycles = assertOk(await db.from("cycles").select("number, name, start_date, end_date, is_active").order("number")) as Cycle[];
      const cycle = args.ciclo !== undefined ? cycles.find((c) => c.number === args.ciclo) : activeCycle(cycles);
      if (!cycle) {
        throw new Error(`El ciclo ${args.ciclo ?? "activo"} no existe. Ciclos disponibles: ${cycles.map((c) => c.number).join(", ")}.`);
      }
      const fechaInicio = args.fecha_inicio ?? cycle.start_date ?? undefined;

      const created = assertOk(
        await db.from("startups").insert({
          name: args.nombre.trim(),
          batch: cycle.number,
          current_phase: args.fase ?? 1,
          type: args.tipo ?? "b2b_saas",
          status: args.estado ?? "activa",
          sector: args.sector ?? null,
          tagline: args.tagline ?? null,
          web_url: args.web ?? null,
          cycle_start_date: fechaInicio ?? null,
          fusion_owner_id: args.responsable ? await resolveOwner(db, userId, args.responsable) : null,
        }).select("id, name").single()
      ) as { id: string; name: string };

      if (fechaInicio) await recomputeDeadlines(db, created.id, fechaInicio);
      const { count } = await db.from("entregables").select("id", { count: "exact", head: true }).eq("startup_id", created.id);

      return ok({ creada: created.name, id: created.id, ciclo: cycle.number, fecha_inicio: fechaInicio ?? null, entregables_asignados: count ?? 0 });
    })
  );

  // ─── editar_startup ────────────────────────────────────────────────────────
  server.registerTool(
    "editar_startup",
    {
      title: "Editar startup",
      description:
        "Modifica datos de una startup existente (nombre, ciclo, tipo, estado, sector, tagline, web, fecha de inicio, " +
        "responsable de Fusión, métrica norte). Solo cambia los campos indicados. Para cambiar de fase usa 'cambiar_fase'." + WRITE_NOTE,
      inputSchema: z.object({
        startup: z.string().describe("Nombre o id de la startup."),
        nombre: z.string().min(1).optional(),
        ciclo: z.number().int().min(1).optional(),
        metrica_norte: z.string().optional(),
        valor_metrica_norte: z.string().optional(),
        ...startupFields,
      }),
      annotations: { ...WRITE, idempotentHint: true },
    },
    safe(async (args, tc) => {
      await requireWriter(tc);
      const { db, userId } = tc;
      const s = await resolveStartup(db, args.startup);

      const update: Record<string, unknown> = {};
      if (args.nombre !== undefined) update.name = args.nombre.trim();
      if (args.ciclo !== undefined) update.batch = args.ciclo;
      if (args.tipo !== undefined) update.type = args.tipo;
      if (args.estado !== undefined) update.status = args.estado;
      if (args.sector !== undefined) update.sector = args.sector || null;
      if (args.tagline !== undefined) update.tagline = args.tagline || null;
      if (args.web !== undefined) update.web_url = args.web || null;
      if (args.fecha_inicio !== undefined) update.cycle_start_date = args.fecha_inicio;
      if (args.metrica_norte !== undefined) update.north_star_metric = args.metrica_norte || null;
      if (args.valor_metrica_norte !== undefined) update.north_star_value = args.valor_metrica_norte || null;
      if (args.responsable !== undefined) update.fusion_owner_id = await resolveOwner(db, userId, args.responsable);

      if (Object.keys(update).length === 0) throw new Error("No has indicado ningún campo que cambiar.");

      assertOk(await db.from("startups").update(update).eq("id", s.id));
      if (args.fecha_inicio) await recomputeDeadlines(db, s.id, args.fecha_inicio);

      return ok({ startup: s.name, campos_actualizados: Object.keys(update) });
    })
  );

  // ─── cambiar_fase ──────────────────────────────────────────────────────────
  server.registerTool(
    "cambiar_fase",
    {
      title: "Cambiar de fase",
      description: "Mueve una startup a otra fase del ciclo (1-6). Queda registrado en el historial de fases." + WRITE_NOTE,
      inputSchema: z.object({
        startup: z.string().describe("Nombre o id de la startup."),
        fase: z.number().int().min(1).max(6),
      }),
      annotations: { ...WRITE, idempotentHint: true },
    },
    safe(async ({ startup, fase }, tc) => {
      await requireWriter(tc);
      const { db } = tc;
      const s = await resolveStartup(db, startup);
      const phases = await phaseNames(db);

      if (s.current_phase === fase) return ok({ startup: s.name, aviso: `Ya estaba en la fase ${fase} · ${phases[fase]}.` });

      assertOk(await db.from("startups").update({ current_phase: fase }).eq("id", s.id));
      return ok({
        startup: s.name,
        de: `${s.current_phase} · ${phases[s.current_phase]}`,
        a: `${fase} · ${phases[fase]}`,
      });
    })
  );

  // ─── revisar_entregable ────────────────────────────────────────────────────
  server.registerTool(
    "revisar_entregable",
    {
      title: "Revisar entregable",
      description:
        "Aprueba un entregable (pasa a 'completado') o lo devuelve con cambios solicitados y notas para el founder. " +
        "Identifícalo por id, o por startup + parte del título." + WRITE_NOTE,
      inputSchema: z.object({
        entregable_id: z.string().optional(),
        startup: z.string().optional().describe("Nombre o id de la startup (si no se da entregable_id)."),
        titulo: z.string().optional().describe("Parte del título del entregable (si no se da entregable_id)."),
        decision: z.enum(["aprobar", "solicitar_cambios"]),
        notas: z.string().optional().describe("Qué debe corregir el founder. Recomendado al solicitar cambios."),
      }),
      annotations: { ...WRITE, idempotentHint: true },
    },
    safe(async (args, tc) => {
      await requireWriter(tc);
      const { db } = tc;

      type Ent = { id: string; title: string; status: string; phase: number; startup_id: string };
      let ent: Ent;
      if (args.entregable_id) {
        if (!UUID_RE.test(args.entregable_id)) throw new Error("entregable_id no es un id válido.");
        ent = assertOk(
          await db.from("entregables").select("id, title, status, phase, startup_id").eq("id", args.entregable_id).single()
        ) as Ent;
      } else {
        if (!args.startup || !args.titulo) throw new Error("Indica entregable_id, o bien startup y titulo.");
        const s = await resolveStartup(db, args.startup);
        const matches = assertOk(
          await db.from("entregables").select("id, title, status, phase, startup_id")
            .eq("startup_id", s.id).ilike("title", `%${args.titulo}%`)
        ) as Ent[];
        if (matches.length !== 1) {
          throw new Error(
            matches.length === 0
              ? `${s.name} no tiene ningún entregable que contenga "${args.titulo}".`
              : `"${args.titulo}" coincide con varios entregables de ${s.name}: ${matches.map((m) => `${m.title} (fase ${m.phase})`).join("; ")}.`
          );
        }
        ent = matches[0];
      }

      const status = args.decision === "aprobar" ? "completado" : "cambios_solicitados";
      const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (args.notas !== undefined || status === "cambios_solicitados") update.reviewer_notes = args.notas?.trim() || null;

      assertOk(await db.from("entregables").update(update).eq("id", ent.id));
      return ok({
        entregable: ent.title,
        fase: ent.phase,
        estado_anterior: ent.status,
        estado_nuevo: status,
        aviso: ent.status !== "en_revision" ? "El entregable no estaba en revisión." : undefined,
      });
    })
  );

  // ─── registrar_metricas ────────────────────────────────────────────────────
  server.registerTool(
    "registrar_metricas",
    {
      title: "Registrar métricas del mes",
      description:
        "Guarda las métricas de un mes para una startup. Si el mes ya tiene registro, solo actualiza los campos indicados." + WRITE_NOTE,
      inputSchema: z.object({
        startup: z.string().describe("Nombre o id de la startup."),
        mes: MONTH.describe("Mes al que corresponden, YYYY-MM."),
        facturacion: z.number().optional().describe("€ facturados en el mes."),
        mrr: z.number().optional().describe("Ingresos recurrentes mensuales (€)."),
        clientes_pago: z.number().int().optional(),
        usuarios_activos: z.number().int().optional(),
        pipeline: z.number().optional().describe("Valor del pipeline abierto (€)."),
        burn_rate: z.number().optional().describe("Gasto neto mensual (€)."),
        runway_meses: z.number().optional(),
        notas: z.string().optional(),
      }),
      annotations: { ...WRITE, idempotentHint: true },
    },
    safe(async (args, tc) => {
      await requireWriter(tc);
      const { db } = tc;
      const s = await resolveStartup(db, args.startup);

      const fields: Record<string, unknown> = {
        revenue: args.facturacion, mrr: args.mrr, paying_customers: args.clientes_pago,
        active_users: args.usuarios_activos, pipeline_value: args.pipeline, burn_rate: args.burn_rate,
        runway_months: args.runway_meses, notes: args.notas,
      };
      const provided = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      if (Object.keys(provided).length === 0) throw new Error("No has indicado ninguna métrica.");

      // Upsert solo con las columnas indicadas: en conflicto, PostgREST actualiza únicamente esas.
      const row = assertOk(
        await db.from("startup_metrics")
          .upsert({ startup_id: s.id, period: `${args.mes}-01`, ...provided }, { onConflict: "startup_id,period" })
          .select("*").single()
      );
      return ok({ startup: s.name, mes: args.mes, registro: row });
    })
  );

  // ─── registrar_weekly ──────────────────────────────────────────────────────
  server.registerTool(
    "registrar_weekly",
    {
      title: "Registrar weekly",
      description: "Registra una reunión semanal con una startup: agenda, notas y tareas acordadas." + WRITE_NOTE,
      inputSchema: z.object({
        startup: z.string().describe("Nombre o id de la startup."),
        fecha: DATE.optional().describe("Fecha de la reunión (por defecto hoy)."),
        agenda: z.array(z.string()).optional(),
        notas: z.string().optional(),
        tareas: z.array(z.object({
          texto: z.string().min(1),
          responsable: z.string().optional(),
          fecha: DATE.optional(),
        })).optional(),
      }),
      annotations: WRITE,
    },
    safe(async (args, tc) => {
      await requireWriter(tc);
      const { db } = tc;
      const s = await resolveStartup(db, args.startup);

      if (!args.agenda?.length && !args.notas && !args.tareas?.length) {
        throw new Error("La weekly está vacía: indica agenda, notas o tareas.");
      }

      const actionItems = (args.tareas ?? []).map((t) => ({
        id: crypto.randomUUID(), text: t.texto, owner: t.responsable ?? "", due_date: t.fecha, done: false,
      }));

      assertOk(
        await db.from("weeklies").insert({
          startup_id: s.id,
          date: args.fecha ?? today(),
          agenda: args.agenda ?? [],
          notes: args.notas ?? null,
          action_items: actionItems,
        })
      );
      return ok({ startup: s.name, fecha: args.fecha ?? today(), tareas: actionItems.length });
    })
  );
}
