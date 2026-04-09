import { getClientById, getSEOMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { DataLagBanner } from "@/components/ui/DataLagBanner";
import Link from "next/link";
import {
  ArrowLeft,
  TrendUp,
  TrendDown,
  MouseClicker,
  Eye,
  MagnifyingGlass,
  ListNumbers,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import { SEOTrendChart } from "@/components/dashboard/DynamicServiceCharts";

export default async function SEOPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getSEOMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["seo"];

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
          <h2>Search Engine Optimization (SEO)</h2>
          {health && <TrafficDot status={health.status} size="md" />}
        </div>
        <div className="stats-filters">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {metrics.dateRange}
          </span>
        </div>
      </div>

      <DataLagBanner service="seo" />

      {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-title">
            <MouseClicker size={16} /> Organic Clicks
          </div>
          <p className="kpi-value">{metrics.clicks.toLocaleString()}</p>
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
            <Eye size={16} /> Impressions
          </div>
          <p className="kpi-value">{metrics.impressions.toLocaleString()}</p>
          <p className="card-subtitle">{metrics.ctr}% Avg CTR</p>
        </div>

        <div className="card">
          <div className="card-title">
            <ListNumbers size={16} /> Avg Position
          </div>
          <p className="kpi-value">{metrics.avgPosition.toFixed(1)}</p>
          <p className="card-subtitle">across all tracked keywords</p>
        </div>

        <div className="card">
          <div className="card-title">
            <MagnifyingGlass size={16} /> Top Query
          </div>
          <p
            className="kpi-value"
            style={{
              fontSize: 14,
              fontWeight: 600,
              height: 32,
              display: "flex",
              alignItems: "center",
              margin: "8px 0 4px",
            }}
          >
            {metrics.topQueries[0]?.query}
          </p>
          <p className="card-subtitle">
            {metrics.topQueries[0]?.clicks} clicks, pos. {metrics.topQueries[0]?.position}
          </p>
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <p className="card-title">Search Visibility (14 Days)</p>
        </div>
        <SEOTrendChart data={metrics.trend} />
      </div>

      {/* ── Split Tables ─────────────────────────────────────────────────── */}
      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        {/* Top Queries */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px 24px 12px", marginBottom: 0 }}>
            <p className="card-title" style={{ margin: 0 }}>Top Queries</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "0 24px 10px", textAlign: "left" }}>Query</th>
                  <th style={{ textAlign: "right", padding: "0 12px 10px" }}>Clicks</th>
                  <th style={{ textAlign: "right", padding: "0 24px 10px" }}>Pos</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topQueries.slice(0, 5).map((q) => (
                  <tr key={q.query}>
                    <td style={{ padding: "10px 24px", fontSize: 13, fontWeight: 500 }}>{q.query}</td>
                    <td style={{ textAlign: "right", padding: "10px 12px" }}>{q.clicks}</td>
                    <td style={{ textAlign: "right", padding: "10px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        {q.position.toFixed(1)}
                        {q.positionChange !== 0 && (
                          q.positionChange > 0 ? (
                            <CaretUp size={12} weight="bold" color="var(--accent-green)" />
                          ) : (
                            <CaretDown size={12} weight="bold" color="var(--accent-red)" />
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Pages */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px 24px 12px", marginBottom: 0 }}>
            <p className="card-title" style={{ margin: 0 }}>Top Pages</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "0 24px 10px", textAlign: "left" }}>Page Path</th>
                  <th style={{ textAlign: "right", padding: "0 24px 10px" }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topPages.slice(0, 5).map((p) => (
                  <tr key={p.page}>
                    <td
                      style={{
                        padding: "10px 24px",
                        fontSize: 12,
                        color: "var(--accent-purple-hover)",
                        fontWeight: 500,
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                      title={p.page}
                    >
                      {p.page}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 24px" }}>{p.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
