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
import type { GoogleAdsTrendPoint, GoogleAdsCampaign } from "@/lib/types";

interface SpendTrendProps {
  data: GoogleAdsTrendPoint[];
}

export function SpendTrendChart({ data }: SpendTrendProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
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
            tickFormatter={(val) => `$${val}`}
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
            formatter={(value) => [`$${Number(value || 0).toFixed(2)}`, "Spend"]}
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="var(--accent-purple)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSpend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CampaignBarProps {
  campaigns: GoogleAdsCampaign[];
}

export function CampaignBreakdownChart({ campaigns }: CampaignBarProps) {
  const data = campaigns.map((c) => ({
    name: c.name,
    conversions: c.conversions,
    health: c.health,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            cursor={{ fill: "var(--bg-surface-hover)" }}
          />
          <Bar dataKey="conversions" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.health === "red"
                    ? "var(--accent-red)"
                    : entry.health === "yellow"
                    ? "var(--accent-yellow)"
                    : "var(--accent-green)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
