import { getSession } from "@/lib/auth/getSession";
import { getClientsForRole } from "@/lib/mock-data";
import { ClientGrid } from "@/components/dashboard/ClientGrid";

export default async function ClientsPage() {
  const user = await getSession();
  if (!user) return null;

  const clients = getClientsForRole(user.role, user.assignedClients);

  return (
    <div>
      <ClientGrid clients={clients} />
    </div>
  );
}
