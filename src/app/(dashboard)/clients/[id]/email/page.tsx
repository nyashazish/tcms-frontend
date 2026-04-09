import { getClientById, getEmailMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendUp,
  TrendDown,
  Envelope,
  EnvelopeOpen,
  CursorClick,
  Warning,
  UserMinus,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import { EmailRateTrendChart } from "@/components/dashboard/DynamicServiceCharts";

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getEmailMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["email"];

  return (
    <div>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <Link href={`/clients/${id}`} className="back-link">
        <ArrowLeft size={14} />
        {client.name}
      </Link>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2>Email Marketing</h2>
          {health && <TrafficDot status={health.status} size="md" />}
        </div>
        <div className="stats-filters">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {metrics.dateRange}
          </span>
        </div>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-title">
            <Envelope size={16} /> Total Sends
          </div>
          <p className="kpi-value">{metrics.sends.toLocaleString()}</p>
          <p className="card-subtitle">across all campaigns</p>
        </div>

        <div className="card">
          <div className="card-title">
            <EnvelopeOpen size={16} /> Open Rate
          </div>
          <p className="kpi-value">{metrics.openRate}%</p>
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
            <CursorClick size={16} /> Click Rate
          </div>
          <p className="kpi-value">{metrics.clickRate}%</p>
          <p className="card-subtitle">on total sends</p>
        </div>

        <div className="card">
          <div className="card-title">
            <Warning size={16} /> Bounces
          </div>
          <p className="kpi-value">{metrics.bounces}</p>
          <p className="card-subtitle">
            {((metrics.bounces / metrics.sends) * 100).toFixed(1)}% bounce rate
          </p>
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <p className="card-title">Engagement Rates (14 Days)</p>
        </div>
        <EmailRateTrendChart data={metrics.trend} />
      </div>

      {/* ── Campaign Table ────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "20px 24px 16px", marginBottom: 0 }}>
          <p className="card-title" style={{ margin: 0 }}>Campaign Breakdown</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ padding: "0 24px 12px", textAlign: "left" }}>Campaign</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Sent Date</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Sends</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Open Rate</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Click Rate</th>
                <th style={{ textAlign: "right", padding: "0 12px 12px" }}>Bounces</th>
                <th style={{ textAlign: "right", padding: "0 24px 12px" }}>Unsubs</th>
              </tr>
            </thead>
            <tbody>
              {metrics.campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: "12px 24px", fontWeight: 500, fontSize: 13 }}>{c.name}</td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>
                    {new Date(c.sentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>{c.sends.toLocaleString()}</td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>{c.openRate}%</td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>{c.clickRate}%</td>
                  <td style={{ textAlign: "right", padding: "12px 12px" }}>{c.bounces}</td>
                  <td style={{ textAlign: "right", padding: "12px 24px" }}>{c.unsubscribes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
