import { getSession } from "@/lib/auth/getSession";
import { getClientsForRole, MOCK_ALERTS } from "@/lib/mock-data";
import { AlertsManager } from "@/components/dashboard/AlertsManager";

export default async function AlertsPage() {
  const user = await getSession();
  if (!user) return null;

  const clients = getClientsForRole(user.role, user.assignedClients);
  const clientIds = clients.map((c) => c.id);
  
  // Filter alerts based on user role (assigned clients)
  const filteredAlerts = MOCK_ALERTS.filter((a) => clientIds.includes(a.clientId));

  return (
    <div>
      <div className="section-header">
        <h2>Alert Log</h2>
      </div>
      
      <AlertsManager initialAlerts={filteredAlerts} clients={clients} />
    </div>
  );
}
