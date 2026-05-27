import Link from "next/link";
import { getSession } from "@/lib/auth/getSession";
import { getOverview, mapHealthStatus, mapServiceType, mapAlertSeverity } from "@/lib/api";
import { getAgencyStats, getServiceHealthDistribution, getOpenAlerts, getClientsForRole } from "@/lib/mock-data";
import { SERVICE_LABELS, type ServiceType, type ServiceHealth, type TrafficLight } from "@/lib/types";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import type { ServiceHealthPoint } from "@/components/dashboard/ServiceHealthBars";
import { ServiceHealthBars } from "@/components/dashboard/OverviewCharts";
import {
  WarningCircle,
  CheckCircle,
  XCircle,
  Users,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";

const CLIENT_PAGE_LIMIT = 20;

const SERVICE_COLS: ServiceType[] = [
  "google-ads",
  "lsa",
  "gbp",
  "email",
  "seo",
  "reviews",
  "lead-gen",
];

const COL_LABELS: Record<ServiceType, string> = {
  "google-ads": "Ads",
  lsa: "LSA",
  gbp: "GBP",
  email: "Email",
  seo: "SEO",
  reviews: "Reviews",
  "lead-gen": "Leads",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function mapApiServiceHealth(apiData: { serviceType: string; critical: number; warning: number; healthy: number }[]): ServiceHealthPoint[] {
  return apiData.map((d) => ({
    service: mapServiceType(d.serviceType) as ServiceType,
    total: d.critical + d.warning + d.healthy,
    green: d.healthy,
    yellow: d.warning,
    red: d.critical,
  }));
}

function mapApiClientToMock(apiClient: { id: string; name: string; healthStatus: string; services: { serviceType: string; healthStatus: string }[] }) {
  return {
    id: apiClient.id,
    name: apiClient.name,
    industry: 'Marketing Services',
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

function mapApiAlertToMock(apiAlert: { id: string; clientId: string; clientName: string; service?: string; serviceType?: string; severity: string; message: string; timestamp?: string; triggeredAt?: string }) {
  const serviceRaw = apiAlert.service ?? apiAlert.serviceType ?? '';
  return {
    id: apiAlert.id,
    clientId: apiAlert.clientId,
    clientName: apiAlert.clientName,
    service: mapServiceType(serviceRaw) as ServiceType,
    severity: mapAlertSeverity(apiAlert.severity),
    message: apiAlert.message,
    timestamp: apiAlert.timestamp ?? apiAlert.triggeredAt ?? new Date().toISOString(),
  };
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ clientPage?: string }> }) {
  const user = await getSession();
  if (!user) return null;

  const { clientPage: clientPageParam } = await searchParams;
  const clientPage = Math.max(1, parseInt(clientPageParam ?? '1') || 1);

  let stats: { total: number; red: number; yellow: number; green: number };
  let serviceHealth: ServiceHealthPoint[];
  let alerts: { id: string; clientId: string; clientName: string; service: ServiceType; severity: TrafficLight; message: string; timestamp: string }[];
  let clients: ReturnType<typeof mapApiClientToMock>[];
  let clientPagination = { total: 0, page: 1, totalPages: 1, limit: CLIENT_PAGE_LIMIT };

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const data = await getOverview({
        clientPage,
        clientLimit: CLIENT_PAGE_LIMIT,
        alertPage: 1,
        alertLimit: 20,
      });

      stats = {
        total: data.stats.totalClients,
        red: data.stats.critical,
        yellow: data.stats.warning,
        green: data.stats.healthy,
      };
      serviceHealth = mapApiServiceHealth(data.serviceHealthDistribution);
      alerts = data.activeAlerts.data.map(mapApiAlertToMock);
      clients = data.clientHealth.data.map(mapApiClientToMock);
      clientPagination = {
        total: data.clientHealth.total,
        page: data.clientHealth.page,
        totalPages: data.clientHealth.totalPages,
        limit: data.clientHealth.limit,
      };
    } catch (error) {
      console.error('Failed to fetch overview from API:', error);
      stats = getAgencyStats();
      serviceHealth = getServiceHealthDistribution().map((d) => ({
        service: d.service as ServiceType,
        total: d.total,
        green: d.green,
        yellow: d.yellow,
        red: d.red,
      }));
      alerts = getOpenAlerts() as any;
      clients = getClientsForRole(user.role, user.assignedClients) as any;
    }
  } else {
    stats = getAgencyStats();
    serviceHealth = getServiceHealthDistribution().map((d) => ({
      service: d.service as ServiceType,
      total: d.total,
      green: d.green,
      yellow: d.yellow,
      red: d.red,
    }));
    alerts = getOpenAlerts() as any;
    clients = getClientsForRole(user.role, user.assignedClients) as any;
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <div className="section-header">
        <h2>Overview</h2>
        <span className="text-muted" style={{ fontSize: 13 }}>
          Last updated: {today}
        </span>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Users size={16} weight="regular" style={{ color: "var(--text-muted)" }} />
            <p className="card-title" style={{ margin: 0 }}>Total Clients</p>
          </div>
          <p className="kpi-value">{stats.total}</p>
          <p className="card-subtitle">accounts monitored</p>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <XCircle size={16} weight="regular" style={{ color: "var(--accent-red)" }} />
            <p className="card-title" style={{ margin: 0 }}>Critical</p>
          </div>
          <p className="kpi-value kpi-value--red">{stats.red}</p>
          <p className="card-subtitle">
            {stats.red === 1 ? "client needs" : "clients need"} immediate attention
          </p>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <WarningCircle size={16} weight="regular" style={{ color: "var(--accent-yellow)" }} />
            <p className="card-title" style={{ margin: 0 }}>Warnings</p>
          </div>
          <p className="kpi-value kpi-value--yellow">{stats.yellow}</p>
          <p className="card-subtitle">
            {stats.yellow === 1 ? "client" : "clients"} trending toward threshold
          </p>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <CheckCircle size={16} weight="regular" style={{ color: "var(--accent-green)" }} />
            <p className="card-title" style={{ margin: 0 }}>Healthy</p>
          </div>
          <p className="kpi-value kpi-value--green">{stats.green}</p>
          <p className="card-subtitle">
            {stats.green === 1 ? "client" : "clients"} within all targets
          </p>
        </div>
      </div>

      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-header" style={{ marginBottom: 8 }}>
            <p className="card-title" style={{ margin: 0 }}>
              Service Health Distribution
            </p>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {stats.total} clients
            </span>
          </div>
          <ServiceHealthBars data={serviceHealth} />
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <p className="card-title" style={{ margin: 0 }}>Active Alerts</p>
            {alerts.length > 0 && (
              <span className="badge negative">{alerts.length} open</span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0",
                color: "var(--text-muted)",
                gap: 8,
              }}
            >
              <CheckCircle size={28} weight="light" style={{ color: "var(--accent-green)" }} />
              <p style={{ fontSize: 13 }}>No open alerts</p>
            </div>
          ) : (
            <div className="alert-feed">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-feed-item alert-feed-item--${alert.severity}`}
                >
                  <TrafficDot status={alert.severity} />
                  <div className="alert-feed-meta">
                    <div className="alert-feed-header">
                      <span className="alert-feed-client">{alert.clientName}</span>
                      <span className="service-badge">
                        {SERVICE_LABELS[alert.service]}
                      </span>
                    </div>
                    <p className="alert-feed-message">{alert.message}</p>
                    <p className="alert-feed-time">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="card-header"
          style={{ padding: "20px 24px 16px", marginBottom: 0 }}
        >
          <p className="card-title" style={{ margin: 0 }}>Client Health</p>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {clientPagination.total || clients.length} client{(clientPagination.total || clients.length) !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ padding: "0 24px 12px", width: "22%" }}>Client</th>
                {SERVICE_COLS.map((s) => (
                  <th
                    key={s}
                    style={{ textAlign: "center", padding: "0 8px 12px" }}
                    title={SERVICE_LABELS[s]}
                  >
                    {COL_LABELS[s]}
                  </th>
                ))}
                <th style={{ padding: "0 24px 12px" }}>Overall</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td style={{ padding: "12px 24px" }}>
                    <Link
                      href={`/clients/${client.id}`}
                      style={{
                        fontWeight: 500,
                        color: "var(--accent-purple-hover)",
                        fontSize: 13,
                      }}
                    >
                      {client.name}
                    </Link>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {client.industry}
                    </p>
                  </td>

                  {SERVICE_COLS.map((s) => (
                    <td
                      key={s}
                      style={{ textAlign: "center", padding: "12px 8px" }}
                    >
                      {client.activeServices.includes(s) ? (
                        <TrafficDot status={client.serviceHealth[s as ServiceType]?.status as 'green' | 'yellow' | 'red'} />
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          —
                        </span>
                      )}
                    </td>
                  ))}

                  <td style={{ padding: "12px 24px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <TrafficDot status={client.overallHealth} size="md" />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "capitalize",
                          color:
                            client.overallHealth === "red"
                              ? "var(--accent-red)"
                              : client.overallHealth === "yellow"
                              ? "var(--accent-yellow)"
                              : "var(--accent-green)",
                        }}
                      >
                        {client.overallHealth}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientPagination.totalPages > 1 && (() => {
          const { page, totalPages, total, limit } = clientPagination;
          const start = (page - 1) * limit + 1;
          const end = Math.min(page * limit, total);
          const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, []);

          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid var(--border-color)" }}>
              <span className="pagination-info">{start}–{end} of {total} clients</span>
              <div className="pagination-controls">
                <Link
                  href={`/overview?clientPage=${page - 1}`}
                  className={`pagination-btn${page === 1 ? " disabled" : ""}`}
                  aria-disabled={page === 1}
                >
                  <CaretLeft size={12} />
                </Link>
                {pages.map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/overview?clientPage=${p}`}
                      className={`pagination-btn${p === page ? " active" : ""}`}
                    >
                      {p}
                    </Link>
                  )
                )}
                <Link
                  href={`/overview?clientPage=${page + 1}`}
                  className={`pagination-btn${page === totalPages ? " disabled" : ""}`}
                  aria-disabled={page === totalPages}
                >
                  <CaretRight size={12} />
                </Link>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}