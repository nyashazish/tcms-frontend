import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import type { Role } from '@/lib/auth/roles';

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
    // Non-fatal — log but don't block the response
    console.error('[sendNotification] email failed:', err);
  }
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

  // ── Dev mode ───────────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`[DEV] Mock PATCH /api/users/${id}`, body);
    return NextResponse.json({ success: true, dev: true });
  }

  // ── Production ─────────────────────────────────────────────────────────────
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('user_profiles')
    .select('email, full_name, role')
    .eq('id', id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'role') {
    const newRole = body.role as Role;

    const { error } = await admin
      .from('user_profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[PATCH /api/users] update role error:', error);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    await sendNotification(profile.email, 'role_changed', newRole);
    return NextResponse.json({ success: true });
  }

  if (action === 'suspend') {
    const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: '87600h' });
    if (error) {
      console.error('[PATCH /api/users] ban error:', error);
      return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
    }
    await sendNotification(profile.email, 'suspended');
    return NextResponse.json({ success: true });
  }

  // action === 'unsuspend'
  const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: 'none' });
  if (error) {
    console.error('[PATCH /api/users] unban error:', error);
    return NextResponse.json({ error: 'Failed to unsuspend user' }, { status: 500 });
  }
  await sendNotification(profile.email, 'unsuspended');
  return NextResponse.json({ success: true });
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

  // ── Dev mode ───────────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`[DEV] Mock DELETE /api/users/${id}`);
    return NextResponse.json({ success: true, dev: true });
  }

  // ── Production ─────────────────────────────────────────────────────────────
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Send notification before deleting so the user still exists in auth
  await sendNotification(profile.email, 'deleted');

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(id);
  if (authDeleteError) {
    console.error('[DELETE /api/users] deleteUser error:', authDeleteError);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }

  // Belt-and-suspenders in case cascade is not configured
  await admin.from('user_profiles').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
