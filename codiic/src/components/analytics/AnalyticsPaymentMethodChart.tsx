import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { AnalyticsPaymentMethodRow } from '../../contexts/analytics.context';
import {
  ANALYTICS_CHART_ANIMATION_MS,
  useAnalyticsReplayKey,
} from './analyticsChartMotion';
import { ANALYTICS_CHART, formatCount, formatInr } from './analyticsChartTheme';

const COLORS = ['#00a0ac', '#005bd3', '#8a3ffc', '#79aaf7', '#f1c21b', '#da1e28'] as const;

function PaymentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: AnalyticsPaymentMethodRow }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-md"
      style={{
        background: ANALYTICS_CHART.tooltipBg,
        borderColor: ANALYTICS_CHART.tooltipBorder,
        color: ANALYTICS_CHART.tooltipText,
      }}
    >
      <p className="mb-1 text-[12px] font-semibold">{row.name}</p>
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

export function AnalyticsPaymentMethodChart({
  rows,
  loading = false,
  height = 180,
}: {
  rows: AnalyticsPaymentMethodRow[];
  loading?: boolean;
  height?: number;
}) {
  const data = useMemo(() => rows.filter((row) => row.sales > 0 || row.orders > 0), [rows]);
  const totalSales = useMemo(() => data.reduce((sum, row) => sum + row.sales, 0), [data]);
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
    <div className="flex min-h-[160px] flex-1 items-center gap-4">
      <div className="relative h-[140px] w-[140px] shrink-0">
        <ResponsiveContainer key={replayKey} width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="sales"
              nameKey="name"
              innerRadius={46}
              outerRadius={64}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive
              animationDuration={ANALYTICS_CHART_ANIMATION_MS}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PaymentTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((row, index) => (
          <li key={row.key} className="flex items-center gap-2 text-[13px] text-admin-text">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{row.name}</span>
            <span className="ml-auto tabular-nums text-admin-text-secondary">
              {totalSales > 0 ? `${Math.round((row.sales / totalSales) * 100)}%` : formatInr(row.sales)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
