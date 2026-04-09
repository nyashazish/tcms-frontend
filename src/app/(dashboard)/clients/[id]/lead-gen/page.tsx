import { getClientById, getLeadGenMetrics } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendUp,
  TrendDown,
  UserPlus,
  Target,
  ChartBar,
  GoogleLogo,
  Envelope,
  Browser,
  IdentificationCard,
  Table,
} from "@phosphor-icons/react/dist/ssr";
import { TrafficDot } from "@/components/dashboard/TrafficDot";
import {
  LeadGenTrendChart as LeadTrendChart,
  LeadGenSourceChart as LeadSourceChart,
} from "@/components/dashboard/DynamicServiceCharts";

export default async function LeadGenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  const metrics = getLeadGenMetrics(id);

  if (!client || !metrics) notFound();

  const health = client.serviceHealth["lead-gen"];

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
          <h2>Lead Generation & Tracking</h2>
          {health && <TrafficDot status={health.status} size="md" />}
        </div>
        <div className="stats-filters">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {metrics.dateRange}
          </span>
        </div>
      </div>

      {/* ── Source Note ───────────────────────────────────────────────────── */}
      <div
        className="data-lag-banner"
        style={{
          background: "var(--accent-purple-bg)",
          borderColor: "var(--accent-purple)",
          color: "var(--accent-purple)",
          marginBottom: 20,
        }}
      >
        <Table size={14} weight="fill" />
        <span>Source: Multi-channel intake via Google Sheets integration</span>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-title">
            <UserPlus size={16} /> Total Leads
          </div>
          <p className="kpi-value">{metrics.totalLeads}</p>
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
            <IdentificationCard size={16} /> Qualified
          </div>
          <p className="kpi-value">{metrics.qualifiedLeads}</p>
          <p className="card-subtitle">{metrics.conversionRate}% conversion</p>
        </div>

        <div className="card">
          <div className="card-title">
            <Target size={16} /> Top Source
          </div>
          <p
            className="kpi-value"
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: "8px 0 4px",
              height: 32,
              display: "flex",
              alignItems: "center",
            }}
          >
            {metrics.sources[0]?.source}
          </p>
          <p className="card-subtitle">{metrics.sources[0]?.count} leads</p>
        </div>

        <div className="card">
          <div className="card-title">
            <ChartBar size={16} /> Win Rate
          </div>
          <p className="kpi-value">
            {(
              (metrics.conversionStages.find((s) => s.stage === "Won")?.count ||
                0 / metrics.qualifiedLeads) * 100
            ).toFixed(0)}
            %
          </p>
          <p className="card-subtitle">from qualified</p>
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-header">
            <p className="card-title">Lead Volume (14 Days)</p>
          </div>
          <LeadTrendChart data={metrics.trend} />
        </div>

        <div className="card">
          <div className="card-header">
            <p className="card-title">Lead Sources</p>
          </div>
          <LeadSourceChart sources={metrics.sources} />
        </div>
      </div>

      {/* ── Bottom Grid: Stages + Source Table ────────────────────────────── */}
      <div className="dashboard-grid today-grid" style={{ marginBottom: 28 }}>
        {/* Conversion Funnel */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Conversion Pipeline</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {metrics.conversionStages.map((s, i) => (
              <div key={s.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{s.stage}</span>
                  <span className="text-muted">{s.count}</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-base)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "var(--accent-purple)",
                      width: `${(s.count / metrics.totalLeads) * 100}%`,
                      opacity: 1 - i * 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Performance */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px 24px 12px", marginBottom: 0 }}>
            <p className="card-title" style={{ margin: 0 }}>Source Breakdown</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "0 24px 10px", textAlign: "left" }}>Source</th>
                  <th style={{ textAlign: "right", padding: "0 12px 10px" }}>Total</th>
                  <th style={{ textAlign: "right", padding: "0 24px 10px" }}>Qual.</th>
                </tr>
              </thead>
              <tbody>
                {metrics.sources.map((s) => (
                  <tr key={s.source}>
                    <td style={{ padding: "10px 24px", fontSize: 12, fontWeight: 500 }}>{s.source}</td>
                    <td style={{ textAlign: "right", padding: "10px 12px" }}>{s.count}</td>
                    <td style={{ textAlign: "right", padding: "10px 24px" }}>{s.qualified}</td>
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
