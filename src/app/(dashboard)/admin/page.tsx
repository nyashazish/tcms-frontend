import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getClients, mapHealthStatus, mapServiceType } from "@/lib/api";
import { getUsers } from "@/lib/api/users";
import {
  MOCK_ADMIN_USERS,
  MOCK_CLIENTS,
  MOCK_SYNC_STATUS,
  MOCK_THRESHOLDS,
} from "@/lib/mock-data";
import { AdminTabs } from "@/components/dashboard/AdminTabs";
import type { AdminUser, Client, ServiceType } from "@/lib/types";
import type { PortalUser } from "@/components/dashboard/PortalUsersTable";

function mapPortalUserToAdminUser(u: PortalUser): AdminUser {
  return {
    id: u.id,
    email: u.email,
    name: u.fullName || u.email,
    role: u.role,
    assignedClients: [],
    lastLogin: u.updatedAt,
    status: u.status === 'invited' ? 'inactive' : 'active',
  };
}

function mapApiClientToAdminClient(apiClient: { id: string; name: string; healthStatus: string; metadata?: Record<string, unknown>; services: { serviceType: string; healthStatus: string }[] }): Client {
  const industry = (apiClient.metadata?.industry as string | undefined) ?? 'Marketing Services';
  return {
    id: apiClient.id,
    name: apiClient.name,
    industry,
    activeServices: apiClient.services.map((s) => mapServiceType(s.serviceType) as ServiceType),
    serviceHealth: Object.fromEntries(
      apiClient.services.map((s) => [
        mapServiceType(s.serviceType),
        { status: mapHealthStatus(s.healthStatus), lastUpdated: new Date().toISOString(), summary: '', keyMetric: '' }
      ])
    ) as Client['serviceHealth'],
    overallHealth: mapHealthStatus(apiClient.healthStatus),
  };
}

export default async function AdminPage() {
  const user = await getSession();

  if (!user || user.role !== "admin") {
    redirect("/overview");
  }

  let adminUsers: AdminUser[];
  let adminClients: Client[];

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const [portalUsers, clientsResponse] = await Promise.all([
        getUsers(),
        getClients({ page: 1, limit: 100 }),
      ]);
      adminUsers = portalUsers.map(mapPortalUserToAdminUser);
      adminClients = clientsResponse.data.map(mapApiClientToAdminClient);
    } catch (error) {
      console.error('Failed to fetch admin data from API:', error);
      adminUsers = MOCK_ADMIN_USERS;
      adminClients = MOCK_CLIENTS;
    }
  } else {
    adminUsers = MOCK_ADMIN_USERS;
    adminClients = MOCK_CLIENTS;
  }

  return (
    <div>
      <div className="section-header">
        <h2>Administration</h2>
      </div>

      <AdminTabs
        users={adminUsers}
        clients={adminClients}
        syncStatus={MOCK_SYNC_STATUS}
        thresholds={MOCK_THRESHOLDS}
      />
    </div>
  );
}
