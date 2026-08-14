import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ANALYTICS_CHART_ANIMATION_MS } from './analyticsChartMotion';
import { ANALYTICS_CHART, formatCount } from './analyticsChartTheme';

export type LiveLocationBar = {
  name: string;
  value: number;
  path: string;
};

function LocationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: LiveLocationBar; value?: number }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div
      className="max-w-60 rounded-lg border px-3 py-2 shadow-md"
      style={{
        background: ANALYTICS_CHART.tooltipBg,
        borderColor: ANALYTICS_CHART.tooltipBorder,
        color: ANALYTICS_CHART.tooltipText,
      }}
    >
      <p className="mb-1 text-[12px] font-semibold">{row.path || row.name}</p>
      <p className="text-[12px] tabular-nums">
        <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>Sessions </span>
        {formatCount(row.value)}
      </p>
    </div>
  );
}

export function AnalyticsSessionsByLocationChart({
  rows,
  breadcrumb,
  loading = false,
  height = 180,
}: {
  rows: LiveLocationBar[];
  breadcrumb?: string | null;
  loading?: boolean;
  height?: number;
}) {
  const data = useMemo(() => rows.filter((r) => r.value > 0), [rows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center text-[12px] text-admin-text-subdued" style={{ height }}>
        Connecting…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-[13px] text-admin-text-secondary" style={{ height }}>
        No live sessions
      </div>
    );
  }

  return (
    <div className="flex min-h-45 flex-1 flex-col">
      {breadcrumb ? (
        <p className="mb-2 truncate text-[12px] text-admin-text-subdued" title={breadcrumb}>
          {breadcrumb}
        </p>
      ) : null}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
            barCategoryGap="28%"
          >
            <CartesianGrid stroke={ANALYTICS_CHART.grid} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: ANALYTICS_CHART.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: ANALYTICS_CHART.grid }}
            />
            <YAxis type="category" dataKey="name" hide width={0} />
            <Tooltip cursor={{ fill: 'rgba(0, 91, 211, 0.08)' }} content={<LocationTooltip />} />
            <Bar
              dataKey="value"
              fill="#005bd3"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
              label={{ position: 'right', fill: '#616161', fontSize: 12 }}
              isAnimationActive
              animationDuration={ANALYTICS_CHART_ANIMATION_MS}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
