import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Dev mode — no Supabase configured, set a lightweight session cookie
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const res = NextResponse.json({
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: {
          id: 'dev-user-id',
          email,
          role: 'admin',
          clientIds: [],
          fullName: 'Dev User',
        },
      });
      res.cookies.set('tcms-dev-auth', 'true', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      return res;
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const { session, user } = data;
    const role = user.app_metadata?.role ?? 'viewer';
    const clientIds = role === 'admin' ? [] : (user.app_metadata?.assigned_clients ?? []);
    const fullName: string = user.user_metadata?.full_name ?? user.email ?? '';

    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'bearer',
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      user: { id: user.id, email: user.email, role, clientIds, fullName },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
