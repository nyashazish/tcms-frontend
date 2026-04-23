import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/api/users';

export async function GET() {
  try {
    const data = await getUsers();
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /users]', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
