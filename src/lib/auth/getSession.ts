import type { AppUser, Role } from './roles';
import { DEV_USER } from './roles';

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getSession(): Promise<AppUser | null> {
  // ── Dev mode ───────────────────────────────────────────────────────────────
  if (!isSupabaseConfigured) {
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

  // ── Production ─────────────────────────────────────────────────────────────
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Verify the session token with the Supabase Auth server
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Role and name live in user_profiles, not app_metadata
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    const role: Role = (profile?.role as Role) ?? 'viewer';
    const fullName: string | undefined =
      profile?.full_name ?? user.user_metadata?.full_name ?? undefined;

    return {
      id: user.id,
      email: user.email ?? '',
      fullName,
      role,
      assignedClients: [],
    };
  } catch {
    return null;
  }
}
