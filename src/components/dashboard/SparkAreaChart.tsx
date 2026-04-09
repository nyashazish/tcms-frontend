"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface Props {
  data: number[];
  color: string;
}

export function SparkAreaChart({ data, color }: Props) {
  const chartData = data.map((value, i) => ({ i, value }));
  return (
    <div style={{ width: "100%", height: 48 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.12}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
