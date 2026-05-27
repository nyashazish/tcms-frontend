import { getSession } from "@/lib/auth/getSession";
import { getClients, mapHealthStatus, mapServiceType } from "@/lib/api";
import { getClientsForRole } from "@/lib/mock-data";
import { ClientGrid } from "@/components/dashboard/ClientGrid";
import type { ServiceType, ServiceHealth, TrafficLight } from "@/lib/types";

const PAGE_LIMIT = 20;

function mapApiClientToGridClient(apiClient: { id: string; name: string; status: string; healthStatus: string; metadata?: Record<string, unknown>; services: { serviceType: string; healthStatus: string }[] }) {
  const industry = (apiClient.metadata?.industry as string | undefined) ?? 'Marketing Services';
  return {
    id: apiClient.id,
    name: apiClient.name,
    industry,
    activeServices: apiClient.services.map((s) => mapServiceType(s.serviceType) as ServiceType),
    overallHealth: mapHealthStatus(apiClient.healthStatus),
    serviceHealth: Object.fromEntries(
      apiClient.services.map((s) => [
        mapServiceType(s.serviceType),
        { status: mapHealthStatus(s.healthStatus) as TrafficLight, lastUpdated: new Date().toISOString(), summary: '', keyMetric: '' } satisfies ServiceHealth,
      ])
    ) as Partial<Record<ServiceType, ServiceHealth>>,
  };
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await getSession();
  if (!user) return null;

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1);

  let clients: ReturnType<typeof mapApiClientToGridClient>[];
  let pagination = { total: 0, page: 1, totalPages: 1, limit: PAGE_LIMIT };

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const data = await getClients({ page, limit: PAGE_LIMIT });
      clients = data.data.map(mapApiClientToGridClient);
      pagination = { total: data.total, page: data.page, totalPages: data.totalPages, limit: data.limit };
    } catch (error) {
      console.error('Failed to fetch clients from API:', error);
      clients = getClientsForRole(user.role, user.assignedClients) as any;
    }
  } else {
    clients = getClientsForRole(user.role, user.assignedClients) as any;
  }

  return (
    <div>
      <ClientGrid clients={clients} pagination={pagination} />
    </div>
  );
}