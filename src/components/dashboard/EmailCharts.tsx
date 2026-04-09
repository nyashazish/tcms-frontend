"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { EmailTrendPoint } from "@/lib/types";

interface RateTrendProps {
  data: EmailTrendPoint[];
}

export function EmailRateTrendChart({ data }: RateTrendProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="openRate"
            name="Open Rate"
            stroke="var(--accent-purple)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="clickRate"
            name="Click Rate"
            stroke="var(--accent-green)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
