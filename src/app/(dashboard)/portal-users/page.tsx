import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/api/users";
import { PortalUsersTable } from "@/components/dashboard/PortalUsersTable";

export default async function PortalUsersPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/overview");

  const users = await getUsers();

  return (
    <div>
      <div className="section-header">
        <h2>Portal Users</h2>
      </div>
      <PortalUsersTable users={users} currentUserId={user.id} />
    </div>
  );
}
