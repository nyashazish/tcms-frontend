import { notFound } from "next/navigation";
import Link from "next/link";
import { SparkAreaChart } from "@/components/dashboard/ClientDetailCharts";
import {
  getClientById,
  getAlertsByClientId,
  getGoogleAdsMetrics,
  getLSAMetrics,
  getGBPMetrics,
  getEmailMetrics,
  getSEOMetrics,
  getReviewMetrics,
  getLeadGenMetrics,
} from "@/lib/mock-data";
import { SERVICE_LABELS, type ServiceType, type TrafficLight } from "@/lib/types";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react/dist/ssr";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEALTH_LABELS: Record<TrafficLight, string> = {
  green: "Healthy",
  yellow: "Warning",
  red: "Critical",
};

const HEALTH_COLORS: Record<TrafficLight, string> = {
  green: "var(--accent-green)",
  yellow: "var(--accent-yellow)",
  red: "var(--accent-red)",
};

const SERVICE_ROUTES: Record<ServiceType, string> = {
  "google-ads": "google-ads",
  lsa: "lsa",
  gbp: "gbp",
  email: "email",
  seo: "seo",
  reviews: "reviews",
  "lead-gen": "lead-gen",
};

// ─── Spark data helpers ───────────────────────────────────────────────────────

interface SparkInfo {
  data: number[];
  label: string;
  color: string;
}

function getSparkInfo(service: ServiceType, clientId: string, status: TrafficLight): SparkInfo | null {
  const color =
    status === "red"
      ? "#ef4444"
      : status === "yellow"
      ? "#eab308"
      : "#22c55e";

  switch (service) {
    case "google-ads": {
      const m = getGoogleAdsMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.clicks), label: "7-day clicks", color };
    }
    case "lsa": {
      const m = getLSAMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.leads), label: "7-day leads", color };
    }
    case "gbp": {
      const m = getGBPMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.impressions), label: "7-day impressions", color };
    }
    case "email": {
      const m = getEmailMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.openRate), label: "7-day open rate", color };
    }
    case "seo": {
      const m = getSEOMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.clicks), label: "7-day clicks", color };
    }
    case "reviews": {
      const m = getReviewMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.avgRating), label: "7-day avg rating", color };
    }
    case "lead-gen": {
      const m = getLeadGenMetrics(clientId);
      if (!m) return null;
      return { data: m.trend.slice(-7).map((d) => d.leads), label: "7-day leads", color };
    }
    default:
      return null;
  }
}

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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const openAlerts = getAlertsByClientId(id).filter((a) => a.status === "open");

  return (
    <div>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <Link href="/clients" className="back-link">
        <ArrowLeft size={14} />
        All Clients
      </Link>

      {/* ── Client header ─────────────────────────────────────────────────── */}
      <div className="client-detail-header">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
            {client.name}
          </h2>
          <p className="text-muted" style={{ fontSize: 13 }}>
            {client.industry}
          </p>
        </div>
        <div className="client-detail-overall">
          <TrafficDot status={client.overallHealth} size="md" />
          <span
            className="client-detail-health-label"
            style={{ color: HEALTH_COLORS[client.overallHealth] }}
          >
            {HEALTH_LABELS[client.overallHealth]}
          </span>
        </div>
      </div>

      {/* ── Service health cards ───────────────────────────────────────────── */}
      <div className="service-health-grid" style={{ marginBottom: 28 }}>
        {client.activeServices.map((service) => {
          const health = client.serviceHealth[service]!;
          const spark = getSparkInfo(service, id, health.status);
          return (
            <Link
              key={service}
              href={`/clients/${id}/${SERVICE_ROUTES[service]}`}
              className="service-health-card"
            >
              <div className="service-health-card-top">
                <span className="service-health-card-name">
                  {SERVICE_LABELS[service]}
                </span>
                <TrafficDot status={health.status} />
              </div>

              {health.keyMetric && (
                <p className="service-health-card-metric">{health.keyMetric}</p>
              )}

              <p className="service-health-card-summary" title={health.summary}>
                {health.summary}
              </p>

              {spark && (
                <div className="service-health-card-spark">
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginBottom: 4,
                    }}
                  >
                    {spark.label}
                  </p>
                  <SparkAreaChart data={spark.data} color={spark.color} />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Active issues ──────────────────────────────────────────────────── */}
      {openAlerts.length > 0 && (
        <div className="client-issues-section">
          <p className="client-issues-title">
            <WarningCircle
              size={14}
              weight="fill"
              style={{ color: "var(--accent-red)" }}
            />
            Active Issues ({openAlerts.length})
          </p>
          <div className="alert-feed">
            {openAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-feed-item alert-feed-item--${alert.severity}`}
              >
                <TrafficDot status={alert.severity} />
                <div className="alert-feed-meta">
                  <div className="alert-feed-header">
                    <span className="service-badge">
                      {SERVICE_LABELS[alert.service]}
                    </span>
                    <span
                      className="alert-feed-client"
                      style={{ fontWeight: 400 }}
                    >
                      {alert.thresholdBreached}
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
        </div>
      )}
    </div>
  );
}
