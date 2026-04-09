"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ServiceType } from "@/lib/types";

// Matches CSS variables --accent-green / --accent-yellow / --accent-red
const GREEN  = "#22c55e";
const YELLOW = "#eab308";
const RED    = "#ef4444";

const SHORT_LABELS: Record<ServiceType, string> = {
  "google-ads": "Google Ads",
  lsa:          "LSA",
  gbp:          "GBP",
  email:        "Email",
  seo:          "SEO",
  reviews:      "Reviews",
  "lead-gen":   "Lead Gen",
};

export interface ServiceHealthPoint {
  service: ServiceType;
  total: number;
  green: number;
  yellow: number;
  red: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {p.name}: <strong style={{ color: "var(--text-primary)" }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ServiceHealthBars({ data }: { data: ServiceHealthPoint[] }) {
  const chartData = data.map((d) => ({
    name: SHORT_LABELS[d.service],
    Healthy:  d.green,
    Warning:  d.yellow,
    Critical: d.red,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          barSize={16}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={82}
            tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-surface-hover)" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
          <Bar dataKey="Healthy"  stackId="a" fill={GREEN}  />
          <Bar dataKey="Warning"  stackId="a" fill={YELLOW} />
          <Bar dataKey="Critical" stackId="a" fill={RED} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
