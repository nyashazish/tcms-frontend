import type { AppUser, Role } from './roles';
import { DEV_USER } from './roles';

/**
 * Server-side session resolver.
 *
 * Returns DEV_USER when Supabase env vars are not set so all dashboard pages
 * remain accessible during local development without a backend.
 *
 * Once NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are present,
 * reads the real Supabase session and decodes role + assigned_clients from
 * app_metadata (set via a Supabase Auth Hook / admin SDK on the backend).
 */
export async function getSession(): Promise<AppUser | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return DEV_USER;
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const role: Role = session.user.app_metadata?.role ?? 'viewer';
    const assignedClients: string[] =
      session.user.app_metadata?.assigned_clients ?? [];

    return {
      id: session.user.id,
      email: session.user.email ?? '',
      role,
      assignedClients,
    };
  } catch {
    return null;
  }
}
