import type { PortalUser } from '@/components/dashboard/PortalUsersTable';

export async function getUsers(): Promise<PortalUser[]> {
  // Dev mode — no Supabase configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { MOCK_ADMIN_USERS } = await import('@/lib/mock-data');
    return MOCK_ADMIN_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.name,
      role: u.role,
      status: u.status,
      createdAt: '2026-04-10T09:00:00.000Z',
      updatedAt: u.lastLogin,
    }));
  }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  // Fetch profiles and auth users in parallel
  const [profilesResult, authResult] = await Promise.all([
    admin
      .from('user_profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers(),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);

  const authUsers = authResult.data?.users ?? [];

  // All auth user IDs — used to skip orphaned profile rows (auth deleted without cascade)
  const authUserIds = new Set(authUsers.map((u) => u.id));

  // Confirmed subset — used to distinguish active vs invited
  const confirmedIds = new Set(
    authUsers.filter((u) => u.email_confirmed_at != null).map((u) => u.id)
  );

  return (profilesResult.data ?? [])
    .filter((row) => authUserIds.has(row.id))
    .map((row) => ({
      id: row.id,
      email: row.email ?? '',
      fullName: row.full_name ?? row.email ?? '',
      role: (row.role as PortalUser['role']) ?? 'viewer',
      status: confirmedIds.has(row.id) ? 'active' : 'invited',
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
    }));
}
