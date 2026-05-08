"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type {
  MonthlyTrendPoint,
  LeadSourceRow,
  LeadMediumRow,
  LeadTypeRow,
} from "@/lib/lead-gen-dashboard-data";

// Recharts configuration objects — these are library props, not HTML inline styles
const TOOLTIP_STYLE = {
  backgroundColor: "var(--bg-surface)",
  borderColor: "var(--border-color)",
  borderRadius: "8px",
  fontSize: "12px",
};

const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 11 };

// ─── Monthly Lead Trend ────────────────────────────────────────────────────────

export function MonthlyLeadTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <div className="lg-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
          />
          <Line type="monotone" dataKey="total"       name="Total"        stroke="#1A3D63" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="quotable"    name="Quotable"     stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="notQuotable" name="Not Quotable" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="spam"        name="Spam"         stroke="#eab308" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Leads by Source ──────────────────────────────────────────────────────────

export function LeadsBySourceChart({ data }: { data: LeadSourceRow[] }) {
  return (
    <div className="lg-chart--source">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <YAxis
            dataKey="source"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS_TICK, fill: "var(--text-secondary)" }}
            width={56}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
          />
          <Bar dataKey="quotable" name="Quotable" fill="#22c55e" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="spam"     name="Spam"     fill="#eab308" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="total"    name="Total"    fill="#4A7FA7" radius={[0, 3, 3, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Leads by Medium ──────────────────────────────────────────────────────────

export function LeadsByMediumChart({ data }: { data: LeadMediumRow[] }) {
  return (
    <div className="lg-chart--medium">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <YAxis
            dataKey="medium"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS_TICK, fill: "var(--text-secondary)" }}
            width={56}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
          />
          <Bar dataKey="quotable" name="Quotable" fill="#22c55e" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="spam"     name="Spam"     fill="#eab308" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="total"    name="Total"    fill="#4A7FA7" radius={[0, 3, 3, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Lead Type stacked bar ────────────────────────────────────────────────────

interface LeadTypeChartProps {
  data: LeadTypeRow[];
  mode: "counts" | "pct";
}

function toPct(row: LeadTypeRow) {
  const total = row.quotable + row.notQuotable + row.spam;
  if (total === 0) return { type: row.type, quotable: 0, notQuotable: 0, spam: 0 };
  return {
    type: row.type,
    quotable:    parseFloat(((row.quotable    / total) * 100).toFixed(1)),
    notQuotable: parseFloat(((row.notQuotable / total) * 100).toFixed(1)),
    spam:        parseFloat(((row.spam        / total) * 100).toFixed(1)),
  };
}

export function LeadTypeChart({ data, mode }: LeadTypeChartProps) {
  const chartData = mode === "pct" ? data.map(toPct) : data;
  const suffix = mode === "pct" ? "%" : "";

  return (
    <div className="lg-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="type" axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            tickFormatter={(v) => `${v}${suffix}`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}${suffix}`]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
          />
          <Bar dataKey="quotable"    name="Quotable"     stackId="a" fill="#22c55e" />
          <Bar dataKey="notQuotable" name="Not Quotable" stackId="a" fill="#ef4444" />
          <Bar dataKey="spam"        name="Spam"         stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Classification (quotable rate & spam % per client) ───────────────────────

interface ClassificationRow {
  client: string;
  quotablePct: number;
  spamPct: number;
}

export function ClassificationChart({ data }: { data: ClassificationRow[] }) {
  return (
    <div className="lg-chart--classification">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            dataKey="client"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS_TICK, fill: "var(--text-secondary)" }}
            width={96}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
          />
          <Bar dataKey="quotablePct" name="Quotable %" fill="#22c55e" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="spamPct"     name="Spam %"     fill="#eab308" radius={[0, 3, 3, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
