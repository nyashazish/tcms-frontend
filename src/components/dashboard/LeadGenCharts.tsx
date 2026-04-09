"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { LeadSource, LeadGenTrendPoint } from "@/lib/types";

interface LeadTrendProps {
  data: LeadGenTrendPoint[];
}

export function LeadTrendChart({ data }: LeadTrendProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="leads" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SourceBreakdownProps {
  sources: LeadSource[];
}

const COLORS = ["#1A3D63", "#4A7FA7", "#22c55e", "#3b82f6", "#eab308"];

export function LeadSourceChart({ sources }: SourceBreakdownProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sources}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="source"
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
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {sources.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
