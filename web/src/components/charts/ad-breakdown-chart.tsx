"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdBreakdown } from "@/lib/analytics/types";
import { chartColors, chartTooltipStyle } from "./palette";

function truncate(title: string, max = 26) {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

export function AdBreakdownChart({ ads }: { ads: AdBreakdown[] }) {
  const data = [...ads]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8)
    .map((ad) => ({ title: truncate(ad.title), visits: ad.visits }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
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
            dataKey="title"
            width={148}
            tick={{ fontSize: 12, fill: chartColors.label }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: chartColors.grid, opacity: 0.4 }} />
          <Bar dataKey="visits" name="Visits" fill={chartColors.brand} radius={[0, 6, 6, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
