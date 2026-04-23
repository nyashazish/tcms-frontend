import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const res = NextResponse.json({ message: 'Logged out successfully' });
      res.cookies.delete('tcms-dev-auth');
      return res;
    }

    // Build the response first so setAll can write directly onto its Set-Cookie headers.
    // The shared createClient() writes to next/headers cookies(), which is read-only
    // in Route Handlers — cookie deletions would be silently dropped.
    const response = NextResponse.json({ message: 'Logged out successfully' });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    await supabase.auth.signOut();

    // Explicitly delete every Supabase auth cookie that arrived on the request.
    // signOut() clears the in-memory session but doesn't always emit Set-Cookie
    // headers for every chunked token cookie (sb-*-auth-token.0, .1, …).
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        response.cookies.delete(name);
      }
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
