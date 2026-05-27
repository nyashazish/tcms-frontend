import { getSession } from "@/lib/auth/getSession";
import { getClients, getAllAlertsForClientIds, mapHealthStatus, mapServiceType, mapAlertSeverity, mapAlertStatus } from "@/lib/api";
import { getClientsForRole, MOCK_ALERTS } from "@/lib/mock-data";
import { AlertsManager } from "@/components/dashboard/AlertsManager";
import type { ServiceType, ServiceHealth } from "@/lib/types";

function mapApiClientToMockClient(apiClient: { id: string; name: string; healthStatus: string; metadata?: Record<string, unknown>; services: { serviceType: string; healthStatus: string }[] }) {
  const industry = (apiClient.metadata?.industry as string | undefined) ?? 'Marketing Services';
  return {
    id: apiClient.id,
    name: apiClient.name,
    industry,
    activeServices: apiClient.services.map((s) => mapServiceType(s.serviceType) as ServiceType),
    overallHealth: mapHealthStatus(apiClient.healthStatus),
    serviceHealth: {} as Partial<Record<ServiceType, ServiceHealth>>,
  };
}

export default async function AlertsPage() {
  const user = await getSession();
  if (!user) return null;

  let clients: ReturnType<typeof mapApiClientToMockClient>[];
  let filteredAlerts: any[];

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const clientsResponse = await getClients({ page: 1, limit: 100 });
      clients = clientsResponse.data.map(mapApiClientToMockClient);

      const clientIds = clients.map((c) => c.id);
      const apiAlerts = await getAllAlertsForClientIds(clientIds);

      filteredAlerts = apiAlerts.map((alert) => ({
        id: alert.id,
        clientId: alert.clientId,
        clientName: alert.clientName,
        service: mapServiceType(alert.serviceType ?? '') as ServiceType,
        severity: mapAlertSeverity(alert.severity),
        message: alert.message,
        triggerCondition: '',
        thresholdBreached: '',
        timestamp: alert.triggeredAt,
        status: mapAlertStatus(alert.status),
        resolvedAt: alert.resolvedAt ?? undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch alerts from API:', error);
      clients = getClientsForRole(user.role, user.assignedClients) as any;
      filteredAlerts = MOCK_ALERTS.filter((a) => clients.map((c: any) => c.id).includes(a.clientId));
    }
  } else {
    clients = getClientsForRole(user.role, user.assignedClients) as any;
    const clientIds = clients.map((c: any) => c.id);
    filteredAlerts = MOCK_ALERTS.filter((a) => clientIds.includes(a.clientId));
  }

  return (
    <div>
      <div className="section-header">
        <h2>Alert Log</h2>
      </div>

      <AlertsManager initialAlerts={filteredAlerts} clients={clients} />
    </div>
  );
}
