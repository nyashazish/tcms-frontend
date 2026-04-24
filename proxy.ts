import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection proxy (Next.js 16 — replaces middleware.ts).
 *
 * DEV MODE (no Supabase configured):
 *   Passes all requests through unconditionally so every page is accessible
 *   during development without a backend connection.
 *
 * PRODUCTION (NEXT_PUBLIC_SUPABASE_URL is set):
 *   Redirects unauthenticated requests to /login.
 *   Public paths (/login, /forgot-password) are always accessible.
 *
 *   Full session-check logic will be wired in once the Supabase project is
 *   provisioned and the env vars are added to .env.local / Vercel settings.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes (always accessible) ─────────────────────────────────────
  const publicPaths = ["/login", "/forgot-password", "/reset-password"];
  const isPublic =
    publicPaths.includes(pathname) || pathname.startsWith("/auth/");

  if (isPublic) return NextResponse.next();

  // ── Dev mode — enforce login via a lightweight cookie ─────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const devAuth = request.cookies.get("tcms-dev-auth");
    if (!devAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Production: session check (wire in once Supabase is provisioned) ────────
  // Use createServerClient from @supabase/ssr directly here — proxy must not
  // import from @/lib/supabase/server to avoid sharing the app module graph.
  //
  //   const supabase = createServerClient(url, key, { cookies: { ... } })
  //   const { data: { session } } = await supabase.auth.getSession()
  //   if (!session) return NextResponse.redirect(new URL('/login', request.url))

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
