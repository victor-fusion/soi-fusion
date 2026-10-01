import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, safe, type ToolContext } from "../context";
import { assertOk, fetchAll, personName, resolveStartup, today, UUID_RE, type PersonRow } from "../data";
import { DATE, READ_ONLY } from "./shared";

// ─── Catálogos ───────────────────────────────────────────────────────────────

const TIPO = z.enum(["startup", "fusion"]).describe(
  "'startup' = CRM de una startup (sus leads y clientes). 'fusion' = CRM propio de Fusión (inversores, partners, mentores…). " +
  "Si el usuario no deja claro cuál, pregúntale antes de llamar a la herramienta."
);
const STAGES = ["contacto_inicial", "demo", "propuesta", "negociacion", "cerrado_ganado", "cerrado_perdido"] as const;
const SOURCES = ["linkedin", "agente_ia", "evento", "referido", "cold_email", "otro"] as const;
const CATEGORIES = ["inversor", "partner", "mentor", "cliente", "proveedor", "institucion", "candidato", "startup_candidata", "prensa", "otro"] as const;
const FUSION_STATUSES = ["nuevo", "activo", "en_conversacion", "colaborando", "inactivo", "descartado"] as const;
const MEMBER_TYPES = ["cofundador", "empleado", "advisor", "becario", "contratista"] as const;
const DEDICATIONS = ["full-time", "part-time", "puntual"] as const;

const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;
const DELETE = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false } as const;
const PERMISSION_NOTE = " Solo para usuarios con permiso de gestión de contactos en el MCP.";
const ASK_NOTE =
  " Si la orden es ambigua (qué contacto, qué tipo, qué dato), pregunta al usuario antes de ejecutar.";
const CONFIRM = z.literal(true).describe(
  "Debe ser true. Antes, muestra al usuario el registro exacto que se va a borrar y obtén su confirmación explícita."
);

const TABLE = { startup: "contacts", fusion: "fusion_contacts" } as const;

// ─── Utilidades ──────────────────────────────────────────────────────────────

async function requireContactsPermission({ db, userId }: ToolContext) {
  const { data } = await db.from("profiles").select("mcp_contacts").eq("id", userId).single();
  if (!data?.mcp_contacts) {
    throw new Error("No tienes permiso para gestionar contactos desde el MCP de SOI.");
  }
}

type ContactRow = Record<string, unknown> & { id: string; full_name: string; company: string | null; email: string | null };

const describe = (c: ContactRow, startupNames: Record<string, string> = {}) =>
  [c.full_name, c.company, c.email, c.startup_id ? `startup: ${startupNames[c.startup_id as string] ?? c.startup_id}` : null]
    .filter(Boolean).join(" · ");

/** Encuentra un contacto por id, email o nombre. Si hay 0 o varios, se para y lista candidatos. */
async function resolveContact(
  db: SupabaseClient, tipo: "startup" | "fusion", ref: string, startupId?: string
): Promise<ContactRow> {
  const r = ref.trim();
  let q = db.from(TABLE[tipo]).select("*");
  if (startupId) q = q.eq("startup_id", startupId);
  q = UUID_RE.test(r) ? q.eq("id", r) : r.includes("@") ? q.ilike("email", r) : q.ilike("full_name", `%${r}%`);
  const rows = assertOk(await q.limit(20)) as ContactRow[];

  if (rows.length === 0) throw new Error(`No encuentro ningún contacto (${tipo}) que coincida con "${ref}".`);
  if (rows.length > 1) {
    const exact = rows.filter((c) => c.full_name.toLowerCase() === r.toLowerCase());
    if (exact.length === 1) return exact[0];
    throw new Error(
      `"${ref}" coincide con ${rows.length} contactos. Pregunta al usuario cuál es y vuelve a llamar con su id:\n` +
      rows.map((c) => `- ${c.id}: ${describe(c)}`).join("\n")
    );
  }
  return rows[0];
}

/** Encuentra una persona del SOI por id, email o nombre. */
async function resolvePerson(db: SupabaseClient, ref: string): Promise<PersonRow> {
  const r = ref.trim().toLowerCase();
  const people = await fetchAll<PersonRow>(() =>
    db.from("profiles").select("id, email, full_name, first_name, last_name, role, startup_id").order("id")
  );
  const matches = UUID_RE.test(r)
    ? people.filter((p) => p.id === r)
    : r.includes("@")
      ? people.filter((p) => p.email.toLowerCase() === r)
      : people.filter((p) => `${personName(p)} ${p.full_name ?? ""}`.toLowerCase().includes(r));

  if (matches.length === 1) return matches[0];
  throw new Error(
    matches.length === 0
      ? `No encuentro a ninguna persona que coincida con "${ref}".`
      : `"${ref}" coincide con varias personas. Pregunta al usuario cuál es:\n` +
        matches.map((p) => `- ${p.id}: ${personName(p)} (${p.email})`).join("\n")
  );
}

async function resolveAdmin(db: SupabaseClient, userId: string, ref: string): Promise<string | null> {
  const r = ref.trim().toLowerCase();
  if (r === "ninguno" || r === "") return null;
  if (r === "yo") return userId;
  const p = await resolvePerson(db, ref);
  if (p.role !== "admin") throw new Error(`${personName(p)} no es del equipo de Fusión.`);
  return p.id;
}

/** Copia solo los campos definidos, traduciendo nombres de parámetro → columna. */
function pick(args: Record<string, unknown>, map: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const [arg, col] of Object.entries(map)) {
    const v = args[arg];
    if (v !== undefined) out[col] = typeof v === "string" && v.trim() === "" ? null : v;
  }
  return out;
}

const STARTUP_COLUMNS = {
  nombre: "full_name", empresa: "company", cargo: "role", email: "email", linkedin: "linkedin_url",
  etapa: "stage", valor: "deal_value", origen: "source", ultimo_contacto: "last_contact_at", notas: "notes",
};
const FUSION_COLUMNS = {
  nombre: "full_name", empresa: "company", cargo: "role", email: "email", telefono: "phone", linkedin: "linkedin_url",
  categoria: "category", estado: "status", etiquetas: "tags", ultimo_contacto: "last_contact_at", notas: "notes",
};

const contactFields = {
  nombre: z.string().min(1).optional(),
  empresa: z.string().optional().describe("Obligatoria en contactos de startup."),
  cargo: z.string().optional(),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  telefono: z.string().optional().describe("Solo CRM de Fusión."),
  etapa: z.enum(STAGES).optional().describe("Solo CRM de startup."),
  valor: z.number().optional().describe("Solo CRM de startup: valor del deal (€)."),
  origen: z.enum(SOURCES).optional().describe("Solo CRM de startup."),
  categoria: z.enum(CATEGORIES).optional().describe("Solo CRM de Fusión."),
  estado: z.enum(FUSION_STATUSES).optional().describe("Solo CRM de Fusión."),
  etiquetas: z.array(z.string()).optional().describe("Solo CRM de Fusión."),
  responsable: z.string().optional().describe("Solo CRM de Fusión: persona del equipo de Fusión, 'yo' o 'ninguno'."),
  ultimo_contacto: DATE.optional(),
  notas: z.string().optional().describe("Sustituye las notas actuales."),
};

function checkFieldsForType(tipo: "startup" | "fusion", args: Record<string, unknown>) {
  const onlyStartup = ["etapa", "valor", "origen"];
  const onlyFusion = ["telefono", "categoria", "estado", "etiquetas", "responsable"];
  const wrong = (tipo === "startup" ? onlyFusion : onlyStartup).filter((f) => args[f] !== undefined);
  if (wrong.length) {
    throw new Error(`Los campos ${wrong.join(", ")} no aplican a contactos de tipo '${tipo}'. Pregunta al usuario qué quiere hacer.`);
  }
}

// ─── Herramientas ────────────────────────────────────────────────────────────

export function registerContactosTools(server: McpServer) {
  // ─── buscar_contactos ──────────────────────────────────────────────────────
  server.registerTool(
    "buscar_contactos",
    {
      title: "Buscar contactos",
      description:
        "Busca contactos individuales en el CRM de las startups (tipo='startup') o en el CRM de Fusión (tipo='fusion') " +
        "por texto (nombre, empresa, email), startup, etapa, categoría o estado. Devuelve los ids necesarios para editar o borrar.",
      inputSchema: z.object({
        tipo: TIPO,
        texto: z.string().optional(),
        startup: z.string().optional().describe("Solo tipo='startup'."),
        etapa: z.enum(STAGES).optional(),
        categoria: z.enum(CATEGORIES).optional(),
        estado: z.enum(FUSION_STATUSES).optional(),
        limite: z.number().int().min(1).max(200).optional().describe("Por defecto 50."),
      }),
      annotations: READ_ONLY,
    },
    safe(async (args, { db }) => {
      let q = db.from(TABLE[args.tipo]).select("*").order("updated_at", { ascending: false });
      if (args.texto) {
        const t = args.texto.replace(/[,()]/g, " ").trim();
        q = q.or(`full_name.ilike.%${t}%,company.ilike.%${t}%,email.ilike.%${t}%`);
      }
      if (args.tipo === "startup") {
        if (args.startup) q = q.eq("startup_id", (await resolveStartup(db, args.startup)).id);
        if (args.etapa) q = q.eq("stage", args.etapa);
      } else {
        if (args.categoria) q = q.eq("category", args.categoria);
        if (args.estado) q = q.eq("status", args.estado);
      }
      const rows = assertOk(await q.limit(args.limite ?? 50)) as ContactRow[];

      let names: Record<string, string> = {};
      if (args.tipo === "startup" && rows.length) {
        const ids = [...new Set(rows.map((r) => r.startup_id as string))];
        const { data } = await db.from("startups").select("id, name").in("id", ids);
        names = Object.fromEntries((data ?? []).map((s) => [s.id, s.name]));
      }
      return ok({
        total: rows.length,
        contactos: rows.map((r) => ({ ...r, startup: r.startup_id ? names[r.startup_id as string] : undefined })),
      });
    })
  );

  // ─── crear_contacto ────────────────────────────────────────────────────────
  server.registerTool(
    "crear_contacto",
    {
      title: "Crear contacto",
      description:
        "Crea un contacto en el CRM de una startup (tipo='startup', requiere startup y empresa) o en el CRM de Fusión (tipo='fusion'). " +
        "Si ya existe alguien con el mismo email o nombre, se detiene para que confirmes con el usuario." + ASK_NOTE + PERMISSION_NOTE,
      inputSchema: z.object({
        tipo: TIPO,
        startup: z.string().optional().describe("Obligatoria si tipo='startup'."),
        ...contactFields,
        nombre: z.string().min(1),
        permitir_duplicado: z.boolean().optional().describe("true solo si el usuario confirma que quiere crear un posible duplicado."),
      }),
      annotations: WRITE,
    },
    safe(async (args, tc) => {
      await requireContactsPermission(tc);
      const { db, userId } = tc;
      checkFieldsForType(args.tipo, args);

      let row: Record<string, unknown>;
      let startupId: string | undefined;
      if (args.tipo === "startup") {
        if (!args.startup) throw new Error("Falta la startup a la que pertenece el contacto. Pregunta al usuario.");
        if (!args.empresa) throw new Error("Falta la empresa del contacto (obligatoria en el CRM de startup). Pregunta al usuario.");
        startupId = (await resolveStartup(db, args.startup)).id;
        row = { ...pick(args, STARTUP_COLUMNS), startup_id: startupId };
      } else {
        row = pick(args, FUSION_COLUMNS);
        if (args.responsable !== undefined) row.owner_id = await resolveAdmin(db, userId, args.responsable);
      }

      if (!args.permitir_duplicado) {
        let dq = db.from(TABLE[args.tipo]).select("*");
        if (startupId) dq = dq.eq("startup_id", startupId);
        const quote = (v: string) => `"${v.replace(/"/g, "").trim()}"`;
        const filters = [`full_name.ilike.${quote(args.nombre)}`];
        if (args.email) filters.push(`email.ilike.${quote(args.email)}`);
        const dups = assertOk(await dq.or(filters.join(",")).limit(5)) as ContactRow[];
        if (dups.length) {
          throw new Error(
            "Posible duplicado. Pregunta al usuario si quiere editar el existente o crear uno nuevo (permitir_duplicado=true):\n" +
            dups.map((c) => `- ${c.id}: ${describe(c)}`).join("\n")
          );
        }
      }

      const created = assertOk(await db.from(TABLE[args.tipo]).insert(row).select("*").single());
      return ok({ creado: created });
    })
  );

  // ─── editar_contacto ───────────────────────────────────────────────────────
  server.registerTool(
    "editar_contacto",
    {
      title: "Editar contacto",
      description:
        "Modifica un contacto existente (solo los campos indicados). Identifícalo por id, email o nombre; si hay varias " +
        "coincidencias devuelve la lista para que preguntes cuál. 'nota_adicional' añade una línea fechada sin borrar las notas." +
        ASK_NOTE + PERMISSION_NOTE,
      inputSchema: z.object({
        tipo: TIPO,
        contacto: z.string().describe("Id, email o nombre del contacto."),
        startup: z.string().optional().describe("Tipo 'startup': acota la búsqueda a esa startup."),
        ...contactFields,
        nota_adicional: z.string().optional(),
      }),
      annotations: { ...WRITE, idempotentHint: true },
    },
    safe(async (args, tc) => {
      await requireContactsPermission(tc);
      const { db, userId } = tc;
      checkFieldsForType(args.tipo, args);

      const startupId = args.tipo === "startup" && args.startup ? (await resolveStartup(db, args.startup)).id : undefined;
      const current = await resolveContact(db, args.tipo, args.contacto, startupId);

      const update = pick(args, args.tipo === "startup" ? STARTUP_COLUMNS : FUSION_COLUMNS);
      if (args.tipo === "fusion" && args.responsable !== undefined) {
        update.owner_id = await resolveAdmin(db, userId, args.responsable);
      }
      if (args.nota_adicional) {
        const base = (update.notes as string | undefined) ?? (current.notes as string | null) ?? "";
        update.notes = `${base}${base ? "\n" : ""}[${today()}] ${args.nota_adicional.trim()}`;
      }
      if (Object.keys(update).length === 0) throw new Error("No has indicado ningún cambio. Pregunta al usuario qué quiere modificar.");

      const updated = assertOk(await db.from(TABLE[args.tipo]).update(update).eq("id", current.id).select("*").single());
      return ok({ actualizado: updated, campos: Object.keys(update) });
    })
  );

  // ─── borrar_contacto ───────────────────────────────────────────────────────
  server.registerTool(
    "borrar_contacto",
    {
      title: "Borrar contacto",
      description:
        "Elimina definitivamente un contacto del CRM de startup o de Fusión. No se puede deshacer. " +
        "Identifícalo preferiblemente por id (usa 'buscar_contactos')." + ASK_NOTE + PERMISSION_NOTE,
      inputSchema: z.object({
        tipo: TIPO,
        contacto: z.string().describe("Id (recomendado), email o nombre exacto."),
        confirmado: CONFIRM,
      }),
      annotations: DELETE,
    },
    safe(async (args, tc) => {
      await requireContactsPermission(tc);
      const { db } = tc;
      const c = await resolveContact(db, args.tipo, args.contacto);
      assertOk(await db.from(TABLE[args.tipo]).delete().eq("id", c.id));
      return ok({ borrado: describe(c), id: c.id });
    })
  );

  // ─── invitar_miembro ───────────────────────────────────────────────────────
  server.registerTool(
    "invitar_miembro",
    {
      title: "Invitar miembro al SOI",
      description:
        "Da de alta a una persona en el SOI enviándole una invitación por email, y opcionalmente la asigna a una startup " +
        "y rellena su ficha. Para el equipo de Fusión usa rol='admin'." + ASK_NOTE + PERMISSION_NOTE,
      inputSchema: z.object({
        email: z.string().email(),
        startup: z.string().optional().describe("Startup a la que pertenece (founders)."),
        rol: z.enum(["founder", "admin"]).optional().describe("Por defecto founder."),
        nombre: z.string().optional(),
        apellidos: z.string().optional(),
        cargo: z.string().optional(),
        tipo_miembro: z.enum(MEMBER_TYPES).optional(),
        dedicacion: z.enum(DEDICATIONS).optional(),
      }),
      annotations: WRITE,
    },
    safe(async (args, tc) => {
      await requireContactsPermission(tc);
      const { db } = tc;

      const { data: existing } = await db.from("profiles").select("id").ilike("email", args.email);
      if (existing?.length) throw new Error(`${args.email} ya tiene usuario en el SOI. Usa 'editar_miembro'.`);

      const startupId = args.startup ? (await resolveStartup(db, args.startup)).id : null;

      // Misma Edge Function que la web (generateLink → Resend)
      const { data: fnData, error: fnError } = await db.functions.invoke("invite-member", { body: { email: args.email } });
      if (fnError) throw new Error(`No se pudo enviar la invitación: ${fnError.message}`);
      const newId = (fnData as { user_id?: string })?.user_id;
      if (!newId) throw new Error("La invitación se envió pero no se obtuvo el id del usuario.");

      const update = {
        ...pick(args, {
          nombre: "first_name", apellidos: "last_name", cargo: "role_title",
          tipo_miembro: "member_type", dedicacion: "dedication", rol: "role",
        }),
        ...(startupId ? { startup_id: startupId } : {}),
      };
      if (Object.keys(update).length) assertOk(await db.from("profiles").update(update).eq("id", newId));

      return ok({ invitado: args.email, id: newId, datos: update });
    })
  );

  // ─── editar_miembro ────────────────────────────────────────────────────────
  server.registerTool(
    "editar_miembro",
    {
      title: "Editar miembro",
      description:
        "Modifica la ficha de una persona del SOI (nombre, cargo, tipo, dedicación, startup, contacto, rol). " +
        "Identifícala por email, nombre o id." + ASK_NOTE + PERMISSION_NOTE,
      inputSchema: z.object({
        persona: z.string().describe("Email, nombre o id."),
        nombre: z.string().optional(),
        apellidos: z.string().optional(),
        cargo: z.string().optional(),
        tipo_miembro: z.enum(MEMBER_TYPES).optional(),
        dedicacion: z.enum(DEDICATIONS).optional(),
        startup: z.string().optional().describe("Nombre de la startup o 'ninguna'."),
        rol: z.enum(["founder", "admin"]).optional().describe("Cambiar a admin da acceso a todas las startups: confírmalo con el usuario."),
        telefono: z.string().optional(),
        linkedin: z.string().url().optional(),
        fecha_incorporacion: DATE.optional(),
      }),
      annotations: { ...WRITE, idempotentHint: true },
    },
    safe(async (args, tc) => {
      await requireContactsPermission(tc);
      const { db } = tc;
      const p = await resolvePerson(db, args.persona);

      const update = pick(args, {
        nombre: "first_name", apellidos: "last_name", cargo: "role_title", tipo_miembro: "member_type",
        dedicacion: "dedication", rol: "role", telefono: "phone", linkedin: "linkedin_url", fecha_incorporacion: "joined_at",
      });
      if (args.startup !== undefined) {
        update.startup_id = args.startup.trim().toLowerCase() === "ninguna" ? null : (await resolveStartup(db, args.startup)).id;
      }
      if (Object.keys(update).length === 0) throw new Error("No has indicado ningún cambio. Pregunta al usuario qué quiere modificar.");

      assertOk(await db.from("profiles").update(update).eq("id", p.id));
      return ok({ persona: personName(p), email: p.email, campos: Object.keys(update) });
    })
  );

  // ─── borrar_miembro ────────────────────────────────────────────────────────
  server.registerTool(
    "borrar_miembro",
    {
      title: "Borrar miembro",
      description:
        "Elimina definitivamente el usuario de una persona del SOI (pierde el acceso y su ficha). No se puede deshacer." +
        ASK_NOTE + PERMISSION_NOTE,
      inputSchema: z.object({
        persona: z.string().describe("Email (recomendado), nombre o id."),
        confirmado: CONFIRM,
      }),
      annotations: DELETE,
    },
    safe(async (args, tc) => {
      await requireContactsPermission(tc);
      const p = await resolvePerson(tc.db, args.persona);
      if (p.id === tc.userId) throw new Error("No puedes borrar tu propio usuario desde el MCP.");

      // Borrar un usuario de Auth requiere service role (igual que en la web, admin/miembros).
      const { error } = await createAdminClient().auth.admin.deleteUser(p.id);
      if (error) throw new Error(error.message);
      return ok({ borrado: personName(p), email: p.email });
    })
  );
}
