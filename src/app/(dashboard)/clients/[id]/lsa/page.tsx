import { getClientById, getLSAMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendUp,
  TrendDown,
  Phone,
  ChatCircleText,
  CalendarCheck,
  WarningCircle,
  ShieldCheck,
  TrendUp as TrendIcon,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import {
  LSAVolumeTrendChart,
  LSALeadTypeChart as LeadTypeBreakdownChart,
} from "@/components/dashboard/DynamicServiceCharts";

export default async function LSAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getLSAMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["lsa"];

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
          <h2>Local Services Ads (LSA)</h2>
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
            <TrendIcon size={16} /> Lead Volume
          </div>
          <p className="kpi-value">{metrics.leadVolume}</p>
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
            <Phone size={16} /> Cost Per Lead
          </div>
          <p className="kpi-value">${metrics.costPerLead}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {metrics.momChange >= 0 ? (
              <TrendDown size={14} color="var(--accent-red)" />
            ) : (
              <TrendUp size={14} color="var(--accent-green)" />
            )}
            <span
              style={{
                fontSize: 12,
                color: metrics.momChange >= 0 ? "var(--accent-red)" : "var(--accent-green)",
              }}
            >
              {Math.abs(metrics.momChange)}%
            </span>
            <span className="text-muted" style={{ fontSize: 11 }}>
              vs last month
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <ShieldCheck size={16} /> Charged Leads
          </div>
          <p className="kpi-value">{metrics.chargedLeads}</p>
          <p className="card-subtitle">
            {((metrics.chargedLeads / metrics.leadVolume) * 100).toFixed(0)}% of total
          </p>
        </div>

        <div className="card">
          <div className="card-title">
            <WarningCircle size={16} /> Disputed
          </div>
          <p className="kpi-value">{metrics.disputedLeads}</p>
          <p className="card-subtitle">awaiting refund</p>
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-header">
            <p className="card-title">Lead Volume Trend (14 Days)</p>
          </div>
          <LSAVolumeTrendChart data={metrics.trend} />
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title">Lead Type Breakdown</p>
          </div>
          <LeadTypeBreakdownChart data={metrics.leadTypes} />
        </div>
      </div>

      {/* ── Lead Breakdown Table ───────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "20px 24px 16px", marginBottom: 0 }}>
          <p className="card-title" style={{ margin: 0 }}>Lead Type Performance</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding: "0 24px 12px", textAlign: "left" }}>Lead Type</th>
                <th style={{ textAlign: "right", padding: "0 24px 12px" }}>Count</th>
                <th style={{ textAlign: "right", padding: "0 24px 12px" }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {metrics.leadTypes.map((lt) => (
                <tr key={lt.type}>
                  <td style={{ padding: "12px 24px", fontWeight: 500 }}>{lt.type}</td>
                  <td style={{ textAlign: "right", padding: "12px 24px" }}>{lt.count}</td>
                  <td style={{ textAlign: "right", padding: "12px 24px" }}>
                    {((lt.count / metrics.leadVolume) * 100).toFixed(1)}%
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
