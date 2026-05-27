import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      const res = NextResponse.json({ message: 'Logged out successfully' });
      res.cookies.delete('tcms-dev-auth');
      return res;
    }

    const accessToken = request.cookies.get('tcms-access-token')?.value;

    if (accessToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('tcms-access-token');
    response.cookies.delete('tcms-refresh-token');

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}