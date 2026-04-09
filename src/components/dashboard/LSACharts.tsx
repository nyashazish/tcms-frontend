"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { LSATrendPoint, LSALeadType } from "@/lib/types";

interface VolumeTrendProps {
  data: LSATrendPoint[];
}

export function LSAVolumeTrendChart({ data }: VolumeTrendProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
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
            dataKey="leads"
            stroke="var(--accent-green)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLeads)"
            name="Leads"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LeadTypePieProps {
  data: LSALeadType[];
}

const COLORS = ["#7b61ff", "#22c55e", "#3b82f6", "#eab308"];

export function LeadTypeBreakdownChart({ data }: LeadTypePieProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="type"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
