import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsSalesPoint } from '../../contexts/analytics.context';
import {
  ANALYTICS_CHART_ANIMATION_MS,
  useAnalyticsReplayKey,
} from './analyticsChartMotion';
import { ANALYTICS_CHART, formatAxisMoney, formatInr } from './analyticsChartTheme';

type SeriesPoint = {
  label: string;
  primary: number;
  compare?: number;
};

type TooltipPayloadItem = {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  name?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  valueLabel: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-md"
      style={{
        background: ANALYTICS_CHART.tooltipBg,
        borderColor: ANALYTICS_CHART.tooltipBorder,
        color: ANALYTICS_CHART.tooltipText,
      }}
    >
      <p className="mb-1.5 text-[12px] font-medium" style={{ color: ANALYTICS_CHART.tooltipMuted }}>
        {label}
      </p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={String(item.dataKey)} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: item.color ?? ANALYTICS_CHART.primary }}
            />
            <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>{item.name ?? valueLabel}</span>
            <span className="ml-auto tabular-nums font-semibold">
              {formatInr(Number(item.value) || 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsOverTimeLineChart({
  points,
  comparePoints = null,
  primaryLabel,
  compareLabel,
  valueLabel = 'Amount',
  loading = false,
  height = 220,
}: {
  points: AnalyticsSalesPoint[];
  comparePoints?: AnalyticsSalesPoint[] | null;
  primaryLabel: string;
  compareLabel?: string | null;
  valueLabel?: string;
  loading?: boolean;
  height?: number;
}) {
  const data = useMemo<SeriesPoint[]>(() => {
    return points.map((point, index) => ({
      label: point.label,
      primary: point.sales,
      ...(comparePoints
        ? { compare: comparePoints[index]?.sales ?? 0 }
        : {}),
    }));
  }, [points, comparePoints]);

  const xInterval = useMemo(() => {
    if (data.length <= 6) return 0;
    if (data.length <= 12) return 1;
    return Math.ceil(data.length / 7) - 1;
  }, [data.length]);
  const replayKey = useAnalyticsReplayKey(data);

  if (loading && data.length === 0) {
    return (
      <div
        className="mt-3 flex items-center justify-center text-[12px] text-admin-text-subdued"
        style={{ height }}
      >
        Loading…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="mt-3 flex items-center justify-center text-[13px] text-admin-text-secondary"
        style={{ height }}
      >
        No data for this date range
      </div>
    );
  }

  return (
    <div key={replayKey} className="mt-2 w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={ANALYTICS_CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: ANALYTICS_CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: ANALYTICS_CHART.grid }}
            interval={xInterval}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: ANALYTICS_CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={formatAxisMoney}
          />
          <Tooltip
            cursor={{ stroke: ANALYTICS_CHART.primary, strokeWidth: 1, strokeDasharray: '4 4' }}
            content={<ChartTooltip valueLabel={valueLabel} />}
          />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#616161', paddingTop: 4 }}
          />
          {compareLabel ? (
            <Line
              type="monotone"
              dataKey="compare"
              name={compareLabel}
              stroke={ANALYTICS_CHART.compare}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={ANALYTICS_CHART_ANIMATION_MS}
              animationEasing="ease-out"
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="primary"
            name={primaryLabel}
            stroke={ANALYTICS_CHART.primary}
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: ANALYTICS_CHART.primary }}
            isAnimationActive
            animationDuration={ANALYTICS_CHART_ANIMATION_MS}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
