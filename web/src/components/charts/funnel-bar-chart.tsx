"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors, chartTooltipStyle } from "./palette";

export type FunnelStage = {
  label: string;
  value: number;
};

export function FunnelBarChart({ stages }: { stages: FunnelStage[] }) {
  const colors = [chartColors.brandSoft, chartColors.brand, chartColors.accent];

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={stages}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          barCategoryGap={20}
        >
          <CartesianGrid stroke={chartColors.grid} horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: chartColors.axis }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={100}
            tick={{ fontSize: 13, fill: chartColors.label, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: chartColors.grid, opacity: 0.4 }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {stages.map((stage, index) => (
              <Cell key={stage.label} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
