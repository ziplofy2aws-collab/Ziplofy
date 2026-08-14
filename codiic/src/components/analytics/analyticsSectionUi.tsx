import React from 'react';
import type { AnalyticsNamedCount, AnalyticsNamedMoney } from '../../contexts/analytics.context';
import { AnalyticsInfoLabel, type AnalyticsHint } from './AnalyticsInfoLabel';
import { AnalyticsGrowBar, useAnalyticsReplayKey } from './analyticsChartMotion';
import { AnalyticsMetricSparkline } from './AnalyticsMetricSparkline';
import { formatCount, formatInr } from './analyticsChartTheme';

export const analyticsCardClass =
  'overflow-hidden rounded-xl border border-admin-border bg-admin-surface';

export const analyticsEmptyTextClass = 'text-[13px] text-admin-text-secondary';

export function formatAnalyticsDelta(current: number, previous: number | null | undefined): string {
  if (previous == null) return '—';
  if (previous === 0) return '—';
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.abs(pct) >= 10 ? pct.toFixed(0) : pct.toFixed(1);
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '';
  return `${arrow} ${Math.abs(Number(rounded))}%`.trim();
}

export function AnalyticsMetricCard({
  title,
  hint,
  value,
  delta = '—',
  sparkline,
  loading = false,
}: {
  title: string;
  hint: AnalyticsHint;
  value: string;
  delta?: string;
  sparkline?: number[];
  loading?: boolean;
}) {
  return (
    <div className={`${analyticsCardClass} p-4`}>
      <AnalyticsInfoLabel
        label={title}
        hint={hint}
        className="text-[13px] font-medium text-admin-text"
      />
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-[22px] font-semibold tracking-tight text-admin-text">
          {loading ? '…' : value}
        </p>
        <span className="text-[13px] text-admin-text-subdued">{loading ? '' : delta}</span>
      </div>
      {sparkline ? <AnalyticsMetricSparkline values={sparkline} /> : null}
    </div>
  );
}

export function AnalyticsPanelCard({
  title,
  hint,
  children,
  className = '',
}: {
  title: string;
  hint: AnalyticsHint;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${analyticsCardClass} flex flex-col p-4 ${className}`.trim()}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-admin-text">
          <AnalyticsInfoLabel label={title} hint={hint} className="text-[13px] font-semibold text-admin-text" />
        </h2>
      </div>
      {children}
    </section>
  );
}

export function AnalyticsCountBarList({
  rows,
  empty,
  loading,
  valueFormat = formatCount,
}: {
  rows: AnalyticsNamedCount[];
  empty: string;
  loading: boolean;
  valueFormat?: (value: number) => string;
}) {
  const replayKey = useAnalyticsReplayKey(rows);
  if (loading && rows.length === 0) return <p className={analyticsEmptyTextClass}>Loading…</p>;
  if (rows.length === 0) return <p className={analyticsEmptyTextClass}>{empty}</p>;
  const max = Math.max(...rows.map((row) => row.value), 0);
  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const widthPct = max > 0 ? Math.max((row.value / max) * 100, 8) : 0;
        return (
          <li key={row.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate text-admin-text" title={row.name}>
                {row.name}
              </span>
              <span className="shrink-0 tabular-nums text-admin-text-secondary">
                {valueFormat(row.value)}
              </span>
            </div>
            <div className="h-6 overflow-hidden rounded-sm bg-admin-row-hover">
              <AnalyticsGrowBar widthPct={widthPct} replayKey={`${row.key}:${replayKey}`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AnalyticsMoneyRowList({
  rows,
  empty,
  loading,
  showAov = false,
}: {
  rows: AnalyticsNamedMoney[];
  empty: string;
  loading: boolean;
  showAov?: boolean;
}) {
  const replayKey = useAnalyticsReplayKey(rows);
  if (loading && rows.length === 0) return <p className={analyticsEmptyTextClass}>Loading…</p>;
  if (rows.length === 0) return <p className={analyticsEmptyTextClass}>{empty}</p>;
  const max = Math.max(...rows.map((row) => (showAov ? row.aov : row.sales)), 0);
  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const value = showAov ? row.aov : row.sales;
        const widthPct = max > 0 ? Math.max((value / max) * 100, 8) : 0;
        return (
          <li key={row.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate text-admin-text" title={row.name}>
                {row.name}
              </span>
              <span className="shrink-0 tabular-nums text-admin-text-secondary">{formatInr(value)}</span>
            </div>
            <div className="h-6 overflow-hidden rounded-sm bg-admin-row-hover">
              <AnalyticsGrowBar widthPct={widthPct} replayKey={`${row.key}:${replayKey}`} />
            </div>
            <p className="mt-1 text-[11px] text-admin-text-subdued">
              {formatCount(row.orders)} orders
              {showAov ? ` · ${formatInr(row.sales)} sales` : ` · AOV ${formatInr(row.aov)}`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
