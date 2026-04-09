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
  // ── Dev passthrough ────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next();
  }

  // ── Public routes ──────────────────────────────────────────────────────────
  const { pathname } = request.nextUrl;
  const publicPaths = ["/login", "/forgot-password"];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // ── Session check (activate when backend is connected) ────────────────────
  // TODO: read Supabase session from cookies and redirect to /login if absent.
  // Use createServerClient from @supabase/ssr here (cannot import from
  // @/lib/supabase/server — proxy must not share app module graph).
  //
  // Example:
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
