"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { GBPTrendPoint, GBPMetrics } from "@/lib/types";

interface ImpressionsTrendProps {
  data: GBPTrendPoint[];
}

export function GBPImpressionsTrendChart({ data }: ImpressionsTrendProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorImpr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickFormatter={(str) => {
              const d = new Date(str);
              return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "var(--text-primary)" }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
          />
          <Area
            type="monotone"
            dataKey="impressions"
            stroke="var(--accent-blue)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorImpr)"
            name="Impressions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ActionBreakdownProps {
  metrics: GBPMetrics;
}

export function GBPActionBreakdownChart({ metrics }: ActionBreakdownProps) {
  const data = [
    { name: "Calls", value: metrics.callClicks, color: "#22c55e" },
    { name: "Directions", value: metrics.directionRequests, color: "#3b82f6" },
    { name: "Web Clicks", value: metrics.websiteClicks, color: "#7b61ff" },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            cursor={{ fill: "var(--bg-surface-hover)" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
