import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection proxy (Next.js 16 — replaces middleware.ts).
 *
 * DEV MODE (no API configured):
 *   Enforces login via tcms-dev-auth cookie.
 *
 * PRODUCTION:
 *   Redirects unauthenticated requests to /login.
 *   Public paths (/login, /forgot-password, /reset-password) are always accessible.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes (always accessible) ─────────────────────────────────────
  const publicPaths = ["/login", "/forgot-password", "/reset-password"];
  const isPublic =
    publicPaths.includes(pathname) || pathname.startsWith("/auth/");

  if (isPublic) return NextResponse.next();

  // ── Dev mode — enforce login via a lightweight cookie ─────────────────────
  if (!process.env.NEXT_PUBLIC_API_URL) {
    const devAuth = request.cookies.get("tcms-dev-auth");
    if (!devAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("tcms-access-token");
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
