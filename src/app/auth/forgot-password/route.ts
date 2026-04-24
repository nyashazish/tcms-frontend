import { NextResponse } from 'next/server';

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

  // Always respond 200 — never reveal whether the email exists.

  // ── Dev mode ───────────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`[DEV] Mock password reset → ${email}`);
    console.log('[DEV] Mock reset link: http://localhost:3000/reset-password#access_token=dev&refresh_token=dev&type=recovery');
    return NextResponse.json({ ok: true, dev: true });
  }

  // ── Production ─────────────────────────────────────────────────────────────
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${appUrl}/reset-password`,
    },
  });

  // If user doesn't exist, generateLink returns an error — swallow it silently.
  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ ok: true });
  }

  const { resend } = await import('@/lib/email/resend');
  const { buildResetPasswordEmail } = await import('@/lib/email/templates/reset-password');

  const { subject, html } = buildResetPasswordEmail({
    actionLink: linkData.properties.action_link,
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

  return NextResponse.json({ ok: true });
}
