import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthInfo, CallToolResult, ServerContext } from "@modelcontextprotocol/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Emisor OAuth (servidor OAuth 2.1 de Supabase Auth). */
export const AUTH_ISSUER = `${SUPABASE_URL}/auth/v1`;

/** Cliente Supabase que actúa como el usuario del token: RLS aplica igual que en la web. */
function supabaseForToken(token: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Verifica el bearer token emitido por Supabase y devuelve su AuthInfo. */
export async function verifySupabaseToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const { data, error } = await supabaseForToken(bearerToken).auth.getClaims(bearerToken);
  if (error || !data?.claims?.sub) return undefined;

  const claims = data.claims as Record<string, unknown>;
  return {
    token: bearerToken,
    clientId: (claims.client_id as string | undefined) ?? "soi",
    scopes: typeof claims.scope === "string" ? claims.scope.split(" ") : [],
    expiresAt: claims.exp as number | undefined,
    extra: { userId: claims.sub, email: claims.email },
  };
}

export interface ToolContext {
  db: SupabaseClient;
  userId: string;
}

/** Extrae el cliente Supabase del usuario autenticado a partir del contexto de la herramienta. */
export function toolContext(ctx: ServerContext): ToolContext {
  const auth = ctx.http?.authInfo;
  if (!auth?.token) throw new Error("No autenticado.");
  return { db: supabaseForToken(auth.token), userId: auth.extra?.userId as string };
}

// ─── Respuestas ──────────────────────────────────────────────────────────────

export function ok(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 1) }] };
}

export function fail(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

/** Envuelve el handler: errores de Supabase o de validación salen como error de herramienta. */
export function safe<A>(
  fn: (args: A, tc: ToolContext) => Promise<CallToolResult>
): (args: A, ctx: ServerContext) => Promise<CallToolResult> {
  return async (args, ctx) => {
    try {
      return await fn(args, toolContext(ctx));
    } catch (e) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  };
}
