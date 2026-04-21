export type Role = 'admin' | 'account_manager' | 'viewer';

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  role: Role;
  assignedClients: string[];
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  account_manager: 'Account Manager',
  viewer: 'Viewer',
};

/** Dev-mode mock user. Used when NEXT_PUBLIC_SUPABASE_URL is not set. */
export const DEV_USER: AppUser = {
  id: 'dev-user-id',
  email: 'dev@tcms.local',
  role: 'admin',
  assignedClients: [],
};
