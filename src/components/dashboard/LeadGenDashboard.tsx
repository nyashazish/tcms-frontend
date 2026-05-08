"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Warning,
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldWarning,
  Fingerprint,
  Lightning,
  Phone,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import type {
  MonthlyTrendPoint,
  ServiceRequestRow,
  LeadSourceRow,
  LeadMediumRow,
  LeadTypeRow,
  ClientBreakdownRow,
  Anomaly,
} from "@/lib/lead-gen-dashboard-data";

// ─── Dynamic chart imports (ssr: false required for Recharts) ─────────────────

const MonthlyLeadTrendChart = dynamic(
  () => import("./LeadGenPageCharts").then((m) => m.MonthlyLeadTrendChart),
  { ssr: false, loading: () => <div className="lg-chart" /> }
);

const LeadsBySourceChart = dynamic(
  () => import("./LeadGenPageCharts").then((m) => m.LeadsBySourceChart),
  { ssr: false, loading: () => <div className="lg-chart--source" /> }
);

const LeadsByMediumChart = dynamic(
  () => import("./LeadGenPageCharts").then((m) => m.LeadsByMediumChart),
  { ssr: false, loading: () => <div className="lg-chart--medium" /> }
);

const LeadTypeChart = dynamic(
  () => import("./LeadGenPageCharts").then((m) => m.LeadTypeChart),
  { ssr: false, loading: () => <div className="lg-chart" /> }
);

const ClassificationChart = dynamic(
  () => import("./LeadGenPageCharts").then((m) => m.ClassificationChart),
  { ssr: false, loading: () => <div className="lg-chart--classification" /> }
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPI {
  totalLeads: number;
  quotable: number;
  notQuotable: number;
  pending: number;
  spam: number;
  uniqueLeads: number;
  quotableRate: number;
  calls: number;
  forms: number;
}

interface Props {
  kpi: KPI;
  monthlyTrend: MonthlyTrendPoint[];
  serviceRequests: ServiceRequestRow[];
  leadSources: LeadSourceRow[];
  leadMediums: LeadMediumRow[];
  leadTypes: LeadTypeRow[];
  clientBreakdown: ClientBreakdownRow[];
  anomalies: Anomaly[];
}

// ─── Anomaly badge ────────────────────────────────────────────────────────────

const ANOMALY_CLASS: Record<Anomaly["type"], string> = {
  "quotable drop": "lg-anomaly-badge lg-anomaly-badge--quotable-drop",
  "volume drop":   "lg-anomaly-badge lg-anomaly-badge--volume-drop",
  "spam spike":    "lg-anomaly-badge lg-anomaly-badge--spam-spike",
};

function AnomalyBadge({ type }: { type: Anomaly["type"] }) {
  return <span className={ANOMALY_CLASS[type]}>{type}</span>;
}

// ─── Tab navigation ───────────────────────────────────────────────────────────

const TABS = ["By Source", "By Medium", "Classification", "Lead Type"] as const;
type Tab = (typeof TABS)[number];

// ─── Main component ───────────────────────────────────────────────────────────

export function LeadGenDashboard({
  kpi,
  monthlyTrend,
  serviceRequests,
  leadSources,
  leadMediums,
  leadTypes,
  clientBreakdown,
  anomalies,
}: Props) {
  const [anomaliesExpanded, setAnomaliesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("By Source");
  const [typeMode, setTypeMode] = useState<"counts" | "pct">("counts");
  const [sortCol, setSortCol] = useState<keyof ClientBreakdownRow>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [srPage, setSrPage] = useState(1);
  const [cbPage, setCbPage] = useState(1);

  const PAGE_SIZE = 10;

  const PREVIEW_COUNT = 3;
  const visibleAnomalies = anomaliesExpanded ? anomalies : anomalies.slice(0, PREVIEW_COUNT);
  const hiddenCount = anomalies.length - PREVIEW_COUNT;

  function handleSort(col: keyof ClientBreakdownRow) {
    if (col === sortCol) {
      setSortAsc((a) => !a);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
    setCbPage(1);
  }

  const sortedClients = [...clientBreakdown].sort((a, b) => {
    const av = a[sortCol];
    const bv = b[sortCol];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortAsc ? cmp : -cmp;
  });

  const srTotals = serviceRequests.reduce(
    (acc, r) => ({
      jan: acc.jan + r.jan,
      feb: acc.feb + r.feb,
      mar: acc.mar + r.mar,
      apr: acc.apr + r.apr,
      may: acc.may + r.may,
      ytd: acc.ytd + r.ytd,
    }),
    { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, ytd: 0 }
  );

  const classificationData = clientBreakdown.map((c) => ({
    client: c.client.split(" ").slice(0, 2).join(" "),
    quotablePct: c.quotablePct,
    spamPct: c.spamPct,
  }));

  const srCount = serviceRequests.length;
  const srTotalPages = Math.max(1, Math.ceil(srCount / PAGE_SIZE));
  const srStart = srCount === 0 ? 0 : (srPage - 1) * PAGE_SIZE + 1;
  const srEnd = Math.min(srPage * PAGE_SIZE, srCount);
  const pagedServiceRequests = serviceRequests.slice((srPage - 1) * PAGE_SIZE, srPage * PAGE_SIZE);

  const cbCount = sortedClients.length;
  const cbTotalPages = Math.max(1, Math.ceil(cbCount / PAGE_SIZE));
  const cbStart = cbCount === 0 ? 0 : (cbPage - 1) * PAGE_SIZE + 1;
  const cbEnd = Math.min(cbPage * PAGE_SIZE, cbCount);
  const pagedClients = sortedClients.slice((cbPage - 1) * PAGE_SIZE, cbPage * PAGE_SIZE);

  function SortIcon({ col }: { col: keyof ClientBreakdownRow }) {
    if (col !== sortCol) return <span className="lg-sort-icon"><ArrowsDownUp size={11} /></span>;
    return sortAsc
      ? <span className="lg-sort-icon--active"><CaretUp size={11} /></span>
      : <span className="lg-sort-icon--active"><CaretDown size={11} /></span>;
  }

  return (
    <div>
      {/* ── Section header ───────────────────────────────────────────────────── */}
      <div className="section-header">
        <div>
          <h2>Lead Generation</h2>
          <p className="text-muted lg-page-subtitle">
            AI-classified lead performance across all clients
          </p>
        </div>
        <div className="stats-filters">
          <select className="form-select lg-filter-select">
            <option>All Clients</option>
            {clientBreakdown.map((c) => (
              <option key={c.client}>{c.client}</option>
            ))}
          </select>
          <select className="form-select lg-filter-select">
            <option>YTD</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* ── Anomalies banner ─────────────────────────────────────────────────── */}
      {anomalies.length > 0 && (
        <div className="card lg-anomalies-card">
          <div className="lg-anomalies-header" onClick={() => setAnomaliesExpanded((v) => !v)}>
            <span className="lg-anomalies-title">
              <Warning size={16} weight="fill" />
              Anomalies Detected ({anomalies.length})
            </span>
            {anomaliesExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
          </div>

          <div className="lg-anomalies-list">
            {visibleAnomalies.map((a, i) => (
              <div key={i} className="lg-anomaly-row">
                <AnomalyBadge type={a.type} />
                <span>
                  <strong>{a.client}</strong>
                  <span className="text-muted"> — {a.message}</span>
                </span>
              </div>
            ))}
            {!anomaliesExpanded && hiddenCount > 0 && (
              <button className="lg-anomalies-expand-btn" onClick={() => setAnomaliesExpanded(true)}>
                +{hiddenCount} more — click to expand
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── KPI row 1 ────────────────────────────────────────────────────────── */}
      <div className="kpi-grid lg-kpi-row">
        <div className="card">
          <div className="card-title"><Users size={14} /> TOTAL LEADS</div>
          <p className="kpi-value">{kpi.totalLeads.toLocaleString()}</p>
        </div>

        <div className="card lg-kpi-card--quotable">
          <div className="card-title">
            <CheckCircle size={14} weight="fill" /> QUOTABLE
          </div>
          <p className="kpi-value kpi-value--green">{kpi.quotable.toLocaleString()}</p>
        </div>

        <div className="card lg-kpi-card--not-quotable">
          <div className="card-title">
            <XCircle size={14} weight="fill" /> NOT QUOTABLE
          </div>
          <p className="kpi-value kpi-value--red">{kpi.notQuotable.toLocaleString()}</p>
        </div>

        <div className="card lg-kpi-card--pending">
          <div className="card-title"><Clock size={14} /> PENDING</div>
          <p className="kpi-value">{kpi.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* ── KPI row 2 ────────────────────────────────────────────────────────── */}
      <div className="kpi-grid lg-kpi-row--last">
        <div className="card lg-kpi-card--spam">
          <div className="card-title">
            <ShieldWarning size={14} weight="fill" /> SPAM
          </div>
          <p className="kpi-value kpi-value--yellow">{kpi.spam.toLocaleString()}</p>
          <p className="card-subtitle lg-kpi-note">Click for breakdown</p>
        </div>

        <div className="card">
          <div className="card-title"><Fingerprint size={14} /> UNIQUE LEADS</div>
          <p className="kpi-value">{kpi.uniqueLeads.toLocaleString()}</p>
        </div>

        <div className="card">
          <div className="card-title"><Lightning size={14} /> QUOTABLE RATE</div>
          <p className="kpi-value">{kpi.quotableRate}%</p>
          <p className="card-subtitle lg-kpi-note">Click for trend</p>
        </div>

        <div className="card">
          <div className="card-title"><Phone size={14} /> CALLS / FORMS</div>
          <p className="kpi-value lg-kpi-value--compact">
            {kpi.calls.toLocaleString()} / {kpi.forms.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Monthly Lead Trend chart ─────────────────────────────────────────── */}
      <div className="card lg-section">
        <div className="card-header">
          <p className="lg-card-title">Monthly Lead Trend</p>
        </div>
        <MonthlyLeadTrendChart data={monthlyTrend} />
      </div>

      {/* ── Service Requests Breakdown table ─────────────────────────────────── */}
      <div className="card lg-table-card">
        <div className="card-header lg-table-card-header">
          <p className="lg-card-title--flush">
            <span className="text-muted"><Warning size={14} weight="fill" /></span>
            {" "}Service Requests Breakdown
            <span className="lg-table-count">{srCount} services</span>
          </p>
        </div>
        <div className="lg-table-scroll">
          <table className="data-table lg-sr-table">
            <thead>
              <tr>
                <th className="lg-th-service">SERVICE</th>
                <th className="lg-th-num">Jan</th>
                <th className="lg-th-num">Feb</th>
                <th className="lg-th-num">Mar</th>
                <th className="lg-th-num">Apr</th>
                <th className="lg-th-num">May</th>
                <th className="lg-th-ytd">YTD</th>
              </tr>
            </thead>
            <tbody>
              {pagedServiceRequests.length === 0 ? (
                <tr><td colSpan={7} className="lg-td-empty">No service request data.</td></tr>
              ) : (
                <>
                  {pagedServiceRequests.map((row) => (
                    <tr key={row.service}>
                      <td className="lg-td-service">{row.service}</td>
                      <td className="lg-td-num">{row.jan.toLocaleString()}</td>
                      <td className="lg-td-num">{row.feb.toLocaleString()}</td>
                      <td className="lg-td-num">{row.mar.toLocaleString()}</td>
                      <td className="lg-td-num">{row.apr.toLocaleString()}</td>
                      <td className="lg-td-num">{row.may.toLocaleString()}</td>
                      <td className="lg-td-ytd">{row.ytd.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="lg-tr-totals">
                    <td className="lg-td-service">Total</td>
                    <td className="lg-td-num">{srTotals.jan.toLocaleString()}</td>
                    <td className="lg-td-num">{srTotals.feb.toLocaleString()}</td>
                    <td className="lg-td-num">{srTotals.mar.toLocaleString()}</td>
                    <td className="lg-td-num">{srTotals.apr.toLocaleString()}</td>
                    <td className="lg-td-num">{srTotals.may.toLocaleString()}</td>
                    <td className="lg-td-ytd">{srTotals.ytd.toLocaleString()}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="lg-pagination">
          <span className="lg-pagination-info">
            Showing {srStart}–{srEnd} of {srCount} services
          </span>
          <div className="lg-pagination-controls">
            <button
              className="btn-page"
              onClick={() => setSrPage((p) => p - 1)}
              disabled={srPage === 1}
            >
              <CaretLeft size={12} /> Prev
            </button>
            <span className="lg-pagination-page">{srPage} / {srTotalPages}</span>
            <button
              className="btn-page"
              onClick={() => setSrPage((p) => p + 1)}
              disabled={srPage === srTotalPages}
            >
              Next <CaretRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabbed charts section ────────────────────────────────────────────── */}
      <div className="lg-tab-section">
        <div className="lg-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`lg-tab-btn${activeTab === tab ? " lg-tab-btn--active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "By Source" && (
          <div className="card">
            <p className="lg-card-title">Leads by Source</p>
            <LeadsBySourceChart data={leadSources} />
          </div>
        )}

        {activeTab === "By Medium" && (
          <div className="card">
            <p className="lg-card-title">Leads by Medium</p>
            <LeadsByMediumChart data={leadMediums} />
          </div>
        )}

        {activeTab === "Classification" && (
          <div className="card">
            <p className="lg-card-title">Quotable Rate &amp; Spam % by Client</p>
            <ClassificationChart data={classificationData} />
          </div>
        )}

        {activeTab === "Lead Type" && (
          <div className="card">
            <div className="lg-lead-type-header">
              <p className="lg-card-title--flush">
                Quotable / Not Quotable / Spam by Lead Type
              </p>
              <div className="lg-toggle">
                {(["counts", "pct"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTypeMode(m)}
                    className={`lg-toggle-btn${typeMode === m ? " lg-toggle-btn--active" : ""}`}
                  >
                    {m === "counts" ? "Counts" : "%"}
                  </button>
                ))}
              </div>
            </div>
            <LeadTypeChart data={leadTypes} mode={typeMode} />
          </div>
        )}
      </div>

      {/* ── Client Breakdown table ───────────────────────────────────────────── */}
      <div className="card lg-table-card--last">
        <div className="card-header lg-table-card-header">
          <p className="lg-card-title--flush">
            Client Breakdown
            <span className="lg-table-count">{cbCount} clients</span>
          </p>
        </div>
        <div className="lg-table-scroll">
          <table className="data-table lg-cb-table">
            <thead>
              <tr>
                {(
                  [
                    { key: "client",      label: "CLIENT",      first: true  },
                    { key: "total",       label: "TOTAL",       first: false },
                    { key: "quotable",    label: "QUOTABLE",    first: false },
                    { key: "quotablePct", label: "QUOTABLE %",  first: false },
                    { key: "spam",        label: "SPAM",        first: false },
                    { key: "spamPct",     label: "SPAM %",      first: false },
                    { key: "unique",      label: "UNIQUE",      first: false },
                  ] as { key: keyof ClientBreakdownRow; label: string; first: boolean }[]
                ).map(({ key, label, first }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={first ? "lg-th-sortable--first" : "lg-th-sortable"}
                  >
                    <span className="lg-th-label">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedClients.length === 0 ? (
                <tr><td colSpan={7} className="lg-td-empty">No client data.</td></tr>
              ) : (
                pagedClients.map((row) => (
                  <tr key={row.client}>
                    <td className="lg-td-client">{row.client}</td>
                    <td className="lg-td-num">{row.total.toLocaleString()}</td>
                    <td className="lg-td-quotable">{row.quotable.toLocaleString()}</td>
                    <td className="lg-td-num">{row.quotablePct}%</td>
                    <td className="lg-td-spam">{row.spam.toLocaleString()}</td>
                    <td className="lg-td-num">{row.spamPct}%</td>
                    <td className="lg-td-num">{row.unique.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="lg-pagination">
          <span className="lg-pagination-info">
            Showing {cbStart}–{cbEnd} of {cbCount} clients
          </span>
          <div className="lg-pagination-controls">
            <button
              className="btn-page"
              onClick={() => setCbPage((p) => p - 1)}
              disabled={cbPage === 1}
            >
              <CaretLeft size={12} /> Prev
            </button>
            <span className="lg-pagination-page">{cbPage} / {cbTotalPages}</span>
            <button
              className="btn-page"
              onClick={() => setCbPage((p) => p + 1)}
              disabled={cbPage === cbTotalPages}
            >
              Next <CaretRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
