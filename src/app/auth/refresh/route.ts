import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const { session } = data;

    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'bearer',
      expires_in: session.expires_in,
      expires_at: session.expires_at,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
