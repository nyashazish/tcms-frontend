import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { MOCK_ADMIN_USERS } = await import('@/lib/mock-data');
    const data = MOCK_ADMIN_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.name,
      role: u.role,
      status: u.status,
      createdAt: '2026-04-10T09:00:00.000Z',
      updatedAt: u.lastLogin,
    }));
    return NextResponse.json({ data });
  }

  return NextResponse.json({ data: [] });
}
