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
import type { AnalyticsLocationSalesRow } from '../../contexts/analytics.context';
import {
  ANALYTICS_CHART_ANIMATION_MS,
  useAnalyticsReplayKey,
} from './analyticsChartMotion';
import { ANALYTICS_CHART, formatAxisMoney, formatCount, formatInr } from './analyticsChartTheme';

function LocationSalesTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: AnalyticsLocationSalesRow }>;
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
        <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>Sales </span>
        {formatInr(row.sales)}
      </p>
      <p className="text-[12px] tabular-nums">
        <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>Orders </span>
        {formatCount(row.orders)}
      </p>
    </div>
  );
}

export function AnalyticsSalesByLocationChart({
  rows,
  loading = false,
  height = 200,
}: {
  rows: AnalyticsLocationSalesRow[];
  loading?: boolean;
  height?: number;
}) {
  const data = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        shortName: row.name.length > 16 ? `${row.name.slice(0, 14)}…` : row.name,
      })),
    [rows],
  );
  const replayKey = useAnalyticsReplayKey(data);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center text-[12px] text-admin-text-subdued" style={{ height }}>
        Loading…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-[13px] text-admin-text-secondary" style={{ height }}>
        No data for this date range
      </div>
    );
  }

  return (
    <div key={replayKey} className="w-full" style={{ height }}>
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
            tick={{ fill: ANALYTICS_CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: ANALYTICS_CHART.grid }}
            tickFormatter={formatAxisMoney}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={92}
            tick={{ fill: '#202223', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(0, 160, 172, 0.08)' }} content={<LocationSalesTooltip />} />
          <Bar
            dataKey="sales"
            fill={ANALYTICS_CHART.bar}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            isAnimationActive
            animationDuration={ANALYTICS_CHART_ANIMATION_MS}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
