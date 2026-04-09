import { getSession } from "@/lib/auth/getSession";
import { getClientsForRole } from "@/lib/mock-data";
import { ClientGrid } from "@/components/dashboard/ClientGrid";
import { Users } from "@phosphor-icons/react/dist/ssr";

export default async function ClientsPage() {
  const user = await getSession();
  if (!user) return null;

  const clients = getClientsForRole(user.role, user.assignedClients);

  return (
    <div>
      <div className="section-header">
        <h2>Clients</h2>
        <span
          className="text-muted"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
        >
          <Users size={14} weight="regular" />
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ClientGrid clients={clients} />
    </div>
  );
}
