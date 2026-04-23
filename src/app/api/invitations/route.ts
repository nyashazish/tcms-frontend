import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import type { Role } from '@/lib/auth/roles';

const VALID_ROLES: Role[] = ['admin', 'account_manager', 'viewer'];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 });
  }

  let body: { email?: unknown; role?: unknown; fullName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, role, fullName } = body;

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  if (typeof role !== 'string' || !VALID_ROLES.includes(role as Role)) {
    return NextResponse.json({ error: 'role must be admin, account_manager, or viewer' }, { status: 400 });
  }

  const name = typeof fullName === 'string' ? fullName.trim() : '';

  // ── Dev mode ───────────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`[DEV] Mock invite → ${email} (${role})`);
    console.log('[DEV] Mock invite link: http://localhost:3000/overview?dev-invited=1');
    return NextResponse.json({ success: true, dev: true });
  }

  // ── Production ─────────────────────────────────────────────────────────────
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  // Duplicate check
  const { data: existing } = await admin
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'A user with this email already exists' },
      { status: 409 }
    );
  }

  // Generate invite link (creates the auth user, no email sent by Supabase)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      data: { role, full_name: name },
      redirectTo: `${appUrl}/accept-invite`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[POST /api/invitations] generateLink error:', linkError);
    return NextResponse.json({ error: 'Failed to generate invite link' }, { status: 500 });
  }

  // Pre-create user_profiles row with the assigned role
  const { error: profileError } = await admin.from('user_profiles').upsert({
    id: linkData.user.id,
    email,
    full_name: name || null,
    role,
  });

  if (profileError) {
    console.error('[POST /api/invitations] upsert user_profiles error:', profileError);
    return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 });
  }

  // Send branded email via Resend
  const { resend } = await import('@/lib/email/resend');
  const { buildInviteEmail } = await import('@/lib/email/templates/invite');

  const { subject, html } = buildInviteEmail({
    inviterEmail: session.email,
    role: role as Role,
    actionLink: linkData.properties.action_link,
  });

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'noreply@hirezim.ai',
    to: email,
    subject,
    html,
  });

  if (emailError) {
    console.error('[POST /api/invitations] Resend error:', emailError);
    return NextResponse.json(
      { error: 'User created but invitation email failed to send. Contact support.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 });
  }

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

  // ── Dev mode ───────────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`[DEV] Mock revoke invitation → ${email}`);
    return NextResponse.json({ success: true, dev: true });
  }

  // ── Production ─────────────────────────────────────────────────────────────
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  // Look up the user_profiles row to get the auth UUID
  const { data: profile } = await admin
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  // Delete from Supabase Auth (cascades the session; user_profiles cleaned up below)
  const { error: authDeleteError } = await admin.auth.admin.deleteUser(profile.id);
  if (authDeleteError) {
    console.error('[DELETE /api/invitations] deleteUser error:', authDeleteError);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  }

  // Delete user_profiles row (belt-and-suspenders in case there is no cascade)
  await admin.from('user_profiles').delete().eq('id', profile.id);

  return NextResponse.json({ success: true });
}
