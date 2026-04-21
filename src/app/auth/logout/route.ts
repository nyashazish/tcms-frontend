import { NextResponse } from 'next/server';

export async function POST() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const res = NextResponse.json({ message: 'Logged out successfully' });
      res.cookies.delete('tcms-dev-auth');
      return res;
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
