"use client";

import { useUser } from "./UserProvider";
import type { Role } from "@/lib/auth/roles";

interface RoleGateProps {
  /** Role(s) that are allowed to see the children. */
  allow: Role | Role[];
  children: React.ReactNode;
}

/**
 * Renders children only when the current user's role is in the `allow` list.
 * Use this to hide UI elements from lower-privilege roles.
 *
 * Example:
 *   <RoleGate allow="admin"><AdminPanel /></RoleGate>
 *   <RoleGate allow={['admin', 'account_manager']}><EditButton /></RoleGate>
 */
export function RoleGate({ allow, children }: RoleGateProps) {
  const { role } = useUser();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!allowed.includes(role)) return null;

  return <>{children}</>;
}
