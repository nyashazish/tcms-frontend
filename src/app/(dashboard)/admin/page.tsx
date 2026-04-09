import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import {
  MOCK_ADMIN_USERS,
  MOCK_CLIENTS,
  MOCK_SYNC_STATUS,
  MOCK_THRESHOLDS,
} from "@/lib/mock-data";
import { AdminTabs } from "@/components/dashboard/AdminTabs";

export default async function AdminPage() {
  const user = await getSession();
  
  // Security check: only admins can access this page
  if (!user || user.role !== "admin") {
    redirect("/overview");
  }

  return (
    <div>
      <div className="section-header">
        <h2>Administration</h2>
      </div>

      <AdminTabs
        users={MOCK_ADMIN_USERS}
        clients={MOCK_CLIENTS}
        syncStatus={MOCK_SYNC_STATUS}
        thresholds={MOCK_THRESHOLDS}
      />
    </div>
  );
}
