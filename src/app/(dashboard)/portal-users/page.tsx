import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { MOCK_ADMIN_USERS } from "@/lib/mock-data";
import { PortalUsersTable } from "@/components/dashboard/PortalUsersTable";
import type { PortalUser } from "@/components/dashboard/PortalUsersTable";

export default async function PortalUsersPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/overview");

  const users: PortalUser[] = MOCK_ADMIN_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.name,
    role: u.role,
    status: u.status,
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: u.lastLogin,
  }));

  return (
    <div>
      <div className="section-header">
        <h2>Portal Users</h2>
      </div>
      <PortalUsersTable users={users} />
    </div>
  );
}
