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
import type { AnalyticsProductSalesRow } from '../../contexts/analytics.context';
import {
  ANALYTICS_CHART_ANIMATION_MS,
  useAnalyticsReplayKey,
} from './analyticsChartMotion';
import { ANALYTICS_CHART, formatAxisMoney, formatCount, formatInr } from './analyticsChartTheme';

type TooltipPayloadItem = {
  payload?: {
    title: string;
    sales: number;
    units: number;
  };
  value?: number | string;
};

function ProductTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div
      className="max-w-[240px] rounded-lg border px-3 py-2 shadow-md"
      style={{
        background: ANALYTICS_CHART.tooltipBg,
        borderColor: ANALYTICS_CHART.tooltipBorder,
        color: ANALYTICS_CHART.tooltipText,
      }}
    >
      <p className="mb-1 truncate text-[12px] font-semibold">{row.title}</p>
      <p className="text-[12px] tabular-nums">
        <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>Sales </span>
        {formatInr(row.sales)}
      </p>
      <p className="text-[12px] tabular-nums">
        <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>Units </span>
        {formatCount(row.units)}
      </p>
    </div>
  );
}

export function AnalyticsSalesByProductChart({
  products,
  totalSales,
  loading = false,
  height = 240,
}: {
  products: AnalyticsProductSalesRow[];
  totalSales: number;
  loading?: boolean;
  height?: number;
}) {
  const data = useMemo(
    () =>
      products.map((row) => ({
        ...row,
        shortTitle: row.title.length > 18 ? `${row.title.slice(0, 16)}…` : row.title,
      })),
    [products],
  );
  const replayKey = useAnalyticsReplayKey(data);

  if (loading && data.length === 0) {
    return (
      <div
        className="mt-1 flex items-center justify-center text-[12px] text-admin-text-subdued"
        style={{ height }}
      >
        Loading…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="mt-1 flex items-center justify-center text-[13px] text-admin-text-secondary"
        style={{ height }}
      >
        No data for this date range
      </div>
    );
  }

  return (
    <div className="mt-1 flex min-h-[180px] flex-1 flex-col">
      <div className="mb-1 flex items-baseline gap-2">
        <p className="text-[22px] font-semibold tracking-tight text-admin-text">
          {formatInr(totalSales)}
        </p>
        <span className="text-[12px] text-admin-text-subdued">top {data.length} products</span>
      </div>
      <div key={replayKey} className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            barCategoryGap="18%"
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
              dataKey="shortTitle"
              width={96}
              tick={{ fill: '#202223', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: ANALYTICS_CHART.cursor }}
              content={<ProductTooltip />}
            />
            <Bar
              dataKey="sales"
              name="Sales"
              fill={ANALYTICS_CHART.bar}
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              activeBar={{ fill: ANALYTICS_CHART.barHover }}
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
