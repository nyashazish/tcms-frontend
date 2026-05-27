import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import type { Role } from '@/lib/auth/roles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const VALID_ROLES: Role[] = ['admin', 'account_manager', 'viewer'];

async function getAccessToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('tcms-access-token')?.value ?? null;
}

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

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log(`[DEV] Mock invite → ${email} (${role})`);
    console.log('[DEV] Mock invite link: http://localhost:3000/overview?dev-invited=1');
    return NextResponse.json({ success: true, dev: true });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/auth/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email, fullName: name }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message || data.error || 'Failed to generate invite link' },
      { status: response.status }
    );
  }

  const { resend } = await import('@/lib/email/resend');
  const { buildInviteEmail } = await import('@/lib/email/templates/invite');

  const { subject, html } = buildInviteEmail({
    inviterEmail: session.email,
    role: role as Role,
    actionLink: data.user?.invited_at ? 'http://localhost:3000/accept-invite' : '',
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

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log(`[DEV] Mock revoke invitation → ${email}`);
    return NextResponse.json({ success: true, dev: true });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usersResponse = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const usersData = await usersResponse.json();
  const user = usersData.data?.find((u: any) => u.email === email);

  if (!user) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  const deleteResponse = await fetch(`${API_URL}/auth/${user.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!deleteResponse.ok) {
    const data = await deleteResponse.json();
    return NextResponse.json({ error: data.error || 'Failed to revoke invitation' }, { status: deleteResponse.status });
  }

  return NextResponse.json({ success: true });
}