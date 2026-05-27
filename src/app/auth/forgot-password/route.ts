import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email } = body;
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log(`[DEV] Mock password reset → ${email}`);
    console.log('[DEV] Mock reset link: http://localhost:3000/reset-password#access_token=dev&refresh_token=dev&type=recovery');
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Bad Request', message: data.message || 'Failed to send reset email' },
        { status: response.status }
      );
    }

    if (data.reset_link) {
      const { resend } = await import('@/lib/email/resend');
      const { buildResetPasswordEmail } = await import('@/lib/email/templates/reset-password');

      const { subject, html } = buildResetPasswordEmail({
        actionLink: data.reset_link,
      });

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@hirezim.ai',
        to: email,
        subject,
        html,
      });

      if (emailError) {
        console.error('[POST /auth/forgot-password] Resend error:', emailError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /auth/forgot-password] Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}