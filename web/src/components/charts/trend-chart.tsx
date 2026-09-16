"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsSeriesPoint } from "@/lib/analytics/types";
import { chartColors, chartTooltipStyle } from "./palette";

const seriesConfig = [
  { key: "impressions", label: "Impressions", color: chartColors.brandSoft },
  { key: "visits", label: "Visits", color: chartColors.brand },
  { key: "conversions", label: "Conversions", color: chartColors.accent },
] as const;

function formatDateTick(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TrendChart({ data }: { data: AnalyticsSeriesPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            {seriesConfig.map((series) => (
              <linearGradient
                key={series.key}
                id={`fill-${series.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={series.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={{ fontSize: 12, fill: chartColors.axis }}
            axisLine={{ stroke: chartColors.grid }}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: chartColors.axis }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            labelFormatter={(value) => formatDateLabel(value as string)}
            contentStyle={chartTooltipStyle}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
          {seriesConfig.map((series) => (
            <Area
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              fill={`url(#fill-${series.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
