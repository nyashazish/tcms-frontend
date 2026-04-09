import Link from "next/link";
import { getSession } from "@/lib/auth/getSession";
import {
  getAgencyStats,
  getServiceHealthDistribution,
  getOpenAlerts,
  getClientsForRole,
} from "@/lib/mock-data";
import { SERVICE_LABELS, type ServiceType } from "@/lib/types";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import type { ServiceHealthPoint } from "@/components/dashboard/ServiceHealthBars";
import { ServiceHealthBars } from "@/components/dashboard/OverviewCharts";
import {
  WarningCircle,
  CheckCircle,
  XCircle,
  Users,
} from "@phosphor-icons/react/dist/ssr";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OverviewPage() {
  const user = await getSession();
  if (!user) return null;

  const stats = getAgencyStats();
  const serviceHealthRaw = getServiceHealthDistribution();
  const serviceHealth: ServiceHealthPoint[] = serviceHealthRaw.map((d) => ({
    service: d.service as ServiceType,
    total: d.total,
    green: d.green,
    yellow: d.yellow,
    red: d.red,
  }));
  const alerts = getOpenAlerts();
  const clients = getClientsForRole(user.role, user.assignedClients);

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="section-header">
        <h2>Overview</h2>
        <span className="text-muted" style={{ fontSize: 13 }}>
          Last updated: {today}
        </span>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        {/* Total Clients */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Users size={16} weight="regular" style={{ color: "var(--text-muted)" }} />
            <p className="card-title" style={{ margin: 0 }}>Total Clients</p>
          </div>
          <p className="kpi-value">{stats.total}</p>
          <p className="card-subtitle">accounts monitored</p>
        </div>

        {/* Critical */}
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

        {/* Warnings */}
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

        {/* Healthy */}
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

      {/* ── Service Health Bars + Alert Feed ──────────────────────────────── */}
      <div
        className="dashboard-grid today-grid"
        style={{ marginBottom: 28 }}
      >
        {/* Service health distribution */}
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

        {/* Active alerts feed */}
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

      {/* ── Client Health Table ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="card-header"
          style={{ padding: "20px 24px 16px", marginBottom: 0 }}
        >
          <p className="card-title" style={{ margin: 0 }}>Client Health</p>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""}
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
                        <TrafficDot status={client.serviceHealth[s]!.status} />
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
      </div>
    </div>
  );
}
