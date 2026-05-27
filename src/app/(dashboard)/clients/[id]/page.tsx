import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient, getAlerts, mapHealthStatus, mapServiceType, mapAlertSeverity } from "@/lib/api";
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
import { getSession } from "@/lib/auth/getSession";
import { SparkAreaChart } from "@/components/dashboard/ClientDetailCharts";
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

// ─── Mock spark data (only used when API is not configured) ───────────────────

interface SparkInfo {
  data: number[];
  label: string;
  color: string;
}

function getMockSparkInfo(service: ServiceType, clientId: string, status: TrafficLight): SparkInfo | null {
  const color =
    status === "red" ? "#ef4444" : status === "yellow" ? "#eab308" : "#22c55e";

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

// ─── Normalised shape used by the template ────────────────────────────────────

interface NormalisedService {
  type: ServiceType;
  status: TrafficLight;
  summary: string;
  keyMetric: string;
}

interface NormalisedAlert {
  id: string;
  service: ServiceType;
  severity: TrafficLight;
  message: string;
  thresholdBreached: string;
  timestamp: string;
}

interface NormalisedClient {
  id: string;
  name: string;
  industry: string;
  overallHealth: TrafficLight;
  activeServices: NormalisedService[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let client: NormalisedClient;
  let openAlerts: NormalisedAlert[];
  let useMockSparks = false;

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const [apiClient, alertsResponse] = await Promise.all([
        getClient(id),
        getAlerts(id, { status: 'active' }),
      ]);

      const industry = (apiClient.metadata?.industry as string | undefined) ?? 'Marketing Services';

      client = {
        id: apiClient.id,
        name: apiClient.name,
        industry,
        overallHealth: mapHealthStatus(apiClient.healthStatus),
        activeServices: apiClient.services
          .filter((s) => s.isActive === 'active')
          .map((s) => ({
            type: mapServiceType(s.serviceType) as ServiceType,
            status: mapHealthStatus(s.healthStatus),
            summary: '',
            keyMetric: s.serviceName ?? '',
          })),
      };

      openAlerts = alertsResponse.data.map((a) => ({
        id: a.id,
        service: mapServiceType(a.serviceType ?? '') as ServiceType,
        severity: mapAlertSeverity(a.severity) === 'red' ? 'red' : 'yellow',
        message: a.message,
        thresholdBreached: '',
        timestamp: a.triggeredAt,
      }));
    } catch {
      notFound();
    }
  } else {
    const mockClient = getClientById(id);
    if (!mockClient) notFound();

    useMockSparks = true;
    client = {
      id: mockClient.id,
      name: mockClient.name,
      industry: mockClient.industry,
      overallHealth: mockClient.overallHealth,
      activeServices: mockClient.activeServices.map((svc) => {
        const health = mockClient.serviceHealth[svc]!;
        return {
          type: svc,
          status: health.status,
          summary: health.summary,
          keyMetric: health.keyMetric ?? '',
        };
      }),
    };

    openAlerts = getAlertsByClientId(id)
      .filter((a) => a.status === 'open')
      .map((a) => ({
        id: a.id,
        service: a.service,
        severity: a.severity,
        message: a.message,
        thresholdBreached: a.thresholdBreached,
        timestamp: a.timestamp,
      }));
  }

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
        {client.activeServices.map((svc) => {
          const spark = useMockSparks ? getMockSparkInfo(svc.type, id, svc.status) : null;
          const routeKey = SERVICE_ROUTES[svc.type];
          const cardContent = (
            <>
              <div className="service-health-card-top">
                <span className="service-health-card-name">
                  {SERVICE_LABELS[svc.type] ?? svc.type}
                </span>
                <TrafficDot status={svc.status} />
              </div>

              {svc.keyMetric && (
                <p className="service-health-card-metric">{svc.keyMetric}</p>
              )}

              {svc.summary && (
                <p className="service-health-card-summary" title={svc.summary}>
                  {svc.summary}
                </p>
              )}

              {spark && (
                <div className="service-health-card-spark">
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
                    {spark.label}
                  </p>
                  <SparkAreaChart data={spark.data} color={spark.color} />
                </div>
              )}
            </>
          );

          if (routeKey) {
            return (
              <Link
                key={svc.type}
                href={`/clients/${id}/${routeKey}`}
                className="service-health-card"
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={svc.type} className="service-health-card">
              {cardContent}
            </div>
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
                      {SERVICE_LABELS[alert.service] ?? alert.service}
                    </span>
                    {alert.thresholdBreached && (
                      <span className="alert-feed-client" style={{ fontWeight: 400 }}>
                        {alert.thresholdBreached}
                      </span>
                    )}
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
