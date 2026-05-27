import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import type { Role } from '@/lib/auth/roles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const VALID_ROLES: Role[] = ['admin', 'account_manager', 'viewer'];

type RouteContext = { params: Promise<{ id: string }> };

async function sendNotification(
  userEmail: string,
  type: 'role_changed' | 'suspended' | 'unsuspended' | 'deleted',
  newRole?: Role,
) {
  try {
    const { resend } = await import('@/lib/email/resend');
    const { buildAccountNotificationEmail } = await import('@/lib/email/templates/account-notification');
    const { subject, html } = buildAccountNotificationEmail({
      type,
      userEmail,
      newRole,
      supportEmail: process.env.RESEND_FROM_EMAIL,
    });
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@hirezim.ai',
      to: userEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error('[sendNotification] email failed:', err);
  }
}

async function getAccessToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('tcms-access-token')?.value ?? null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  let body: { action?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { action } = body;

  if (action !== 'role' && action !== 'suspend' && action !== 'unsuspend') {
    return NextResponse.json({ error: 'action must be role, suspend, or unsuspend' }, { status: 400 });
  }

  if (action === 'suspend' && id === session.id) {
    return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 });
  }
  if (action === 'role' && id === session.id) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }

  if (action === 'role') {
    const { role } = body;
    if (typeof role !== 'string' || !VALID_ROLES.includes(role as Role)) {
      return NextResponse.json({ error: 'role must be admin, account_manager, or viewer' }, { status: 400 });
    }
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log(`[DEV] Mock PATCH /api/users/${id}`, body);
    return NextResponse.json({ success: true, dev: true });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (action === 'role') {
    const newRole = body.role as Role;
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json({ error: data.error || 'Failed to update role' }, { status: response.status });
    }

    const userResponse = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const usersData = await userResponse.json();
    const user = usersData.data?.find((u: any) => u.id === id);

    if (user?.email) {
      await sendNotification(user.email, 'role_changed', newRole);
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'suspend') {
    return NextResponse.json({ error: 'Suspend not implemented via API' }, { status: 501 });
  }

  if (action === 'unsuspend') {
    return NextResponse.json({ error: 'Unsuspend not implemented via API' }, { status: 501 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log(`[DEV] Mock DELETE /api/users/${id}`);
    return NextResponse.json({ success: true, dev: true });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userResponse = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const usersData = await userResponse.json();
  const user = usersData.data?.find((u: any) => u.id === id);

  if (user?.email) {
    await sendNotification(user.email, 'deleted');
  }

  const response = await fetch(`${API_URL}/auth/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const data = await response.json();
    return NextResponse.json({ error: data.error || 'Failed to delete user' }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}