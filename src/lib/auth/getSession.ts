import type { AppUser, Role } from './roles';
import { DEV_USER } from './roles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const isApiConfigured = !!process.env.NEXT_PUBLIC_API_URL;

export async function getSession(): Promise<AppUser | null> {
  if (!isApiConfigured) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const devAuth = cookieStore.get('tcms-dev-auth');
    if (!devAuth) return null;
    try {
      const data = JSON.parse(devAuth.value);
      if (data && typeof data === 'object') {
        return {
          id: data.id ?? 'dev-user-id',
          email: data.email ?? DEV_USER.email,
          fullName: data.fullName,
          role: data.role ?? 'admin',
          assignedClients: data.assignedClients ?? [],
        };
      }
    } catch {
      // old 'true' cookie — fall through
    }
    return DEV_USER;
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('tcms-access-token')?.value;

    if (!accessToken) return null;

    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.user) return null;

    const { user } = data;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      assignedClients: user.clientIds ?? [],
    };
  } catch {
    return null;
  }
}