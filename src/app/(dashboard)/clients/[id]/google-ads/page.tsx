import { getClientById, getGoogleAdsMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { DataLagBanner } from "@/components/ui/DataLagBanner";
import Link from "next/link";
import {
  ArrowLeft,
  TrendUp,
  TrendDown,
  Target,
  MouseClicker,
  Eye,
  CurrencyDollar,
  ChartBar,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import {
  GoogleAdsSpendTrendChart as SpendTrendChart,
  GoogleAdsCampaignBreakdownChart as CampaignBreakdownChart,
} from "@/components/dashboard/DynamicServiceCharts";

export default async function GoogleAdsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getGoogleAdsMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["google-ads"];

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
          <h2>Google Ads Performance</h2>
          {health && <TrafficDot status={health.status} size="md" />}
        </div>
        <div className="stats-filters">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {metrics.dateRange}
          </span>
        </div>
      </div>

      <DataLagBanner service="google-ads" />

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
            <MouseClicker size={16} /> Clicks
          </div>
          <p className="kpi-value">{metrics.clicks.toLocaleString()}</p>
          <p className="card-subtitle">{metrics.ctr}% CTR</p>
        </div>

        <div className="card">
          <div className="card-title">
            <Target size={16} /> Conversions
          </div>
          <p className="kpi-value">{metrics.conversions}</p>
          <p className="card-subtitle">{metrics.roas}× ROAS</p>
        </div>

        <div className="card">
          <div className="card-title">
            <CurrencyDollar size={16} /> Spend
          </div>
          <p className="kpi-value">${metrics.spend.toLocaleString()}</p>
          <p className="card-subtitle">Budget: ${metrics.budget.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-header">
            <p className="card-title">Spend Trend (14 Days)</p>
          </div>
          <SpendTrendChart data={metrics.trend} />
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title">Conversions by Campaign</p>
          </div>
          <CampaignBreakdownChart campaigns={metrics.campaigns} />
        </div>
      </div>

      {/* ── Campaign Table ────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "20px 24px 16px", marginBottom: 0 }}>
          <p className="card-title" style={{ margin: 0 }}>Campaign Performance</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ padding: "0 24px 12px", width: "30%", textAlign: "left" }}>Campaign</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Impressions</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Clicks</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>CTR</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>CPC</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Conversions</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Spend</th>
                <th style={{ textAlign: "center", padding: "0 24px 12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: "12px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TrafficDot status={c.health} />
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>
                    {c.impressions.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>
                    {c.clicks.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>{c.ctr}%</td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>
                    ${c.cpc.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>{c.conversions}</td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>
                    ${c.spend.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 24px" }}>
                    <span
                      className={`badge ${
                        c.status === "active" ? "positive" : "text-muted"
                      }`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {c.status}
                    </span>
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
