"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SEOTrendPoint } from "@/lib/types";

interface SEOTrendProps {
  data: SEOTrendPoint[];
}

export function SEOTrendChart({ data }: SEOTrendProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
            </linearGradient>
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
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
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
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="clicks"
            name="Clicks"
            stroke="var(--accent-purple)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClicks)"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="impressions"
            name="Impressions"
            stroke="var(--accent-blue)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorImpr)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
