import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims verifica el JWT en local con las claves públicas (ES256) y refresca
  // la sesión si ha caducado; evita la llamada de red de getUser en cada navegación.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const pathname = request.nextUrl.pathname;

  // Estas rutas manejan su propia auth (hash token o bearer OAuth del MCP) — no redirigir.
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/mcp") ||
    pathname.startsWith("/demo") ||   // prototipo público con datos ficticios
    pathname.startsWith("/.well-known")
  ) {
    return supabaseResponse;
  }

  if (pathname.startsWith("/login")) {
    if (user) {
      return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")) ?? "/dashboard", request.url));
    }
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

/** Solo rutas internas: evita redirecciones abiertas a otros dominios. */
export function safeNext(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}
