import { getClientById, getGBPMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { DataLagBanner } from "@/components/ui/DataLagBanner";
import Link from "next/link";
import {
  ArrowLeft,
  TrendUp,
  TrendDown,
  Phone,
  MapPin,
  Globe,
  Star,
  Storefront,
  Eye,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import {
  GBPImpressionsTrendChart,
  GBPActionBreakdownChart,
} from "@/components/dashboard/DynamicServiceCharts";

export default async function GBPPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getGBPMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["gbp"];

  return (
    <div>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <Link href={`/clients/${id}`} className="back-link">
        <ArrowLeft size={14} />
        {client.name}
      </Link>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2>Google Business Profile</h2>
          {health && <TrafficDot status={health.status} size="md" />}
        </div>
        <div className="stats-filters">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {metrics.dateRange}
          </span>
        </div>
      </div>

      <DataLagBanner service="gbp" />

      {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-title">
            <Eye size={16} /> Impressions
          </div>
          <p className="kpi-value">{metrics.impressions.toLocaleString()}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {metrics.wowChange >= 0 ? (
              <TrendUp size={14} color="var(--accent-green)" />
            ) : (
              <TrendDown size={14} color="var(--accent-red)" />
            )}
            <span
              style={{
                fontSize: 12,
                color: metrics.wowChange >= 0 ? "var(--accent-green)" : "var(--accent-red)",
              }}
            >
              {Math.abs(metrics.wowChange)}%
            </span>
            <span className="text-muted" style={{ fontSize: 11 }}>
              vs last week
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <Phone size={16} /> Call Clicks
          </div>
          <p className="kpi-value">{metrics.callClicks}</p>
          <p className="card-subtitle">from listing</p>
        </div>

        <div className="card">
          <div className="card-title">
            <MapPin size={16} /> Directions
          </div>
          <p className="kpi-value">{metrics.directionRequests}</p>
          <p className="card-subtitle">navigation starts</p>
        </div>

        <div className="card">
          <div className="card-title">
            <Star size={16} /> Reviews
          </div>
          <p className="kpi-value">{metrics.reviewAverage}★</p>
          <p className="card-subtitle">{metrics.reviewCount} total reviews</p>
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-header">
            <p className="card-title">Impressions Trend (14 Days)</p>
          </div>
          <GBPImpressionsTrendChart data={metrics.trend} />
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title">Customer Actions</p>
          </div>
          <GBPActionBreakdownChart metrics={metrics} />
        </div>
      </div>

      {/* ── Details Card ──────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 16 }}>
          <p className="card-title" style={{ margin: 0 }}>Listing Details</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          <div>
            <p className="card-subtitle" style={{ marginBottom: 4 }}>Listing Status</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`badge ${metrics.listingStatus === "active" ? "positive" : "negative"}`} style={{ textTransform: "capitalize" }}>
                {metrics.listingStatus}
              </span>
            </div>
          </div>
          <div>
            <p className="card-subtitle" style={{ marginBottom: 4 }}>Website Clicks</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{metrics.websiteClicks}</p>
          </div>
          <div>
            <p className="card-subtitle" style={{ marginBottom: 4 }}>Posts (Last 30 Days)</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{metrics.postCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
