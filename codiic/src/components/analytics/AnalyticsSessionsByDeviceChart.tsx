import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ANALYTICS_CHART_ANIMATION_MS } from './analyticsChartMotion';
import { ANALYTICS_CHART, formatCount } from './analyticsChartTheme';

const DEVICE_COLORS = ['#005bd3', '#79aaf7', '#b4d0fb', '#d6e4fd'] as const;

export type LiveDeviceSlice = {
  key: string;
  name: string;
  value: number;
};

function DeviceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-md"
      style={{
        background: ANALYTICS_CHART.tooltipBg,
        borderColor: ANALYTICS_CHART.tooltipBorder,
        color: ANALYTICS_CHART.tooltipText,
      }}
    >
      <p className="text-[12px]">
        <span style={{ color: ANALYTICS_CHART.tooltipMuted }}>{row.name} </span>
        <span className="font-semibold tabular-nums">{formatCount(Number(row.value) || 0)}</span>
      </p>
    </div>
  );
}

export function AnalyticsSessionsByDeviceChart({
  slices,
  total,
  loading = false,
  height = 180,
}: {
  slices: LiveDeviceSlice[];
  total: number;
  loading?: boolean;
  height?: number;
}) {
  const data = useMemo(() => slices.filter((s) => s.value > 0), [slices]);

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
    <div className="flex min-h-[160px] flex-1 items-center gap-4">
      <div className="relative h-[140px] w-[140px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
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
                <Cell key={entry.key} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<DeviceTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[22px] font-semibold tracking-tight text-admin-text">{formatCount(total)}</p>
          <span className="mt-0.5 h-px w-4 bg-admin-text-subdued/60" />
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((row, index) => (
          <li key={row.key} className="flex items-center gap-2 text-[13px] text-admin-text">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
            />
            <span className="truncate">{row.name}</span>
            <span className="ml-auto tabular-nums text-admin-text-secondary">{formatCount(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
