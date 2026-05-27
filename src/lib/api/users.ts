import type { PortalUser } from '@/components/dashboard/PortalUsersTable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAccessToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('tcms-access-token')?.value ?? null;
}

export async function getUsers(): Promise<PortalUser[]> {
  if (!process.env.NEXT_PUBLIC_API_URL) {
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

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const data = await response.json();

  return (data.data ?? []).map((row: any) => ({
    id: row.id,
    email: row.email ?? '',
    fullName: row.fullName ?? row.email ?? '',
    role: (row.role as PortalUser['role']) ?? 'viewer',
    status: row.emailConfirmedAt ? 'active' : 'invited',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? row.createdAt,
  }));
}