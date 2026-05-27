import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
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
      res.cookies.set(
        'tcms-dev-auth',
        JSON.stringify({ id: 'dev-user-id', email, role: 'admin', fullName: 'Dev User' }),
        { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 }
      );
      return res;
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Unauthorized', message: data.message || 'Invalid email or password' },
        { status: response.status }
      );
    }

    const res = NextResponse.json(data);
    res.cookies.set('tcms-access-token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expires_in,
    });
    res.cookies.set('tcms-refresh-token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}