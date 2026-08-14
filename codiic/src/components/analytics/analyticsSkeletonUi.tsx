import React from 'react';
import { analyticsCardClass } from './analyticsSectionUi';

export const analyticsSkeletonBone = 'rounded bg-admin-secondary';

export function AnalyticsMetricCardSkeleton({ sparkline = false }: { sparkline?: boolean }) {
  return (
    <div className={`${analyticsCardClass} p-4`}>
      <div className={`h-3.5 w-28 ${analyticsSkeletonBone}`} />
      <div className={`mt-3 h-7 w-20 ${analyticsSkeletonBone}`} />
      <div className={`mt-2 h-3 w-10 ${analyticsSkeletonBone}`} />
      {sparkline ? <div className={`mt-3 h-7 w-full ${analyticsSkeletonBone}`} /> : null}
    </div>
  );
}

export function AnalyticsPanelSkeleton({
  bars = 0,
  statPairs = 0,
  lines = 0,
  tableRows = 0,
  chartHeight = 0,
  className = '',
}: {
  bars?: number;
  statPairs?: number;
  lines?: number;
  tableRows?: number;
  chartHeight?: number;
  className?: string;
}) {
  return (
    <section className={`${analyticsCardClass} p-4 ${className}`.trim()}>
      <div className={`mb-3 h-3.5 w-36 ${analyticsSkeletonBone}`} />
      {statPairs > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: statPairs }).map((_, index) => (
            <div key={index}>
              <div className={`h-3 w-24 ${analyticsSkeletonBone}`} />
              <div className={`mt-2 h-6 w-16 ${analyticsSkeletonBone}`} />
            </div>
          ))}
        </div>
      ) : null}
      {lines > 0 ? (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`h-3.5 ${index % 2 === 0 ? 'w-4/5' : 'w-3/5'} ${analyticsSkeletonBone}`}
            />
          ))}
        </div>
      ) : null}
      {bars > 0 ? (
        <ul className="space-y-2">
          {Array.from({ length: bars }).map((_, index) => (
            <li key={index}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className={`h-3 w-24 ${analyticsSkeletonBone}`} />
                <div className={`h-3 w-8 ${analyticsSkeletonBone}`} />
              </div>
              <div className={`h-6 w-full ${analyticsSkeletonBone}`} />
            </li>
          ))}
        </ul>
      ) : null}
      {tableRows > 0 ? (
        <div className="space-y-3">
          <div className="flex justify-between gap-3">
            <div className={`h-3 w-20 ${analyticsSkeletonBone}`} />
            <div className={`h-3 w-16 ${analyticsSkeletonBone}`} />
            <div className={`h-3 w-14 ${analyticsSkeletonBone}`} />
            <div className={`h-3 w-12 ${analyticsSkeletonBone}`} />
          </div>
          {Array.from({ length: tableRows }).map((_, index) => (
            <div key={index} className="flex justify-between gap-3 border-t border-admin-divider pt-3">
              <div className={`h-3.5 w-28 ${analyticsSkeletonBone}`} />
              <div className={`h-3.5 w-10 ${analyticsSkeletonBone}`} />
              <div className={`h-3.5 w-10 ${analyticsSkeletonBone}`} />
              <div className={`h-3.5 w-16 ${analyticsSkeletonBone}`} />
            </div>
          ))}
        </div>
      ) : null}
      {chartHeight > 0 ? (
        <>
          <div className={`mb-3 h-7 w-24 ${analyticsSkeletonBone}`} />
          <div className={analyticsSkeletonBone} style={{ height: chartHeight }} />
        </>
      ) : null}
    </section>
  );
}

export function AnalyticsOverviewSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading analytics">
      <div className={`mb-3 mt-8 h-4 w-20 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton sparkline />
        <AnalyticsMetricCardSkeleton sparkline />
        <AnalyticsMetricCardSkeleton sparkline />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <AnalyticsPanelSkeleton chartHeight={240} className="min-h-[320px] xl:col-span-2" />
        <AnalyticsPanelSkeleton lines={8} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton chartHeight={160} />
        <AnalyticsPanelSkeleton tableRows={5} className="lg:col-span-2" />
      </div>

      <div className={`mb-3 mt-8 h-4 w-24 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton chartHeight={180} />
        <AnalyticsPanelSkeleton bars={5} className="lg:col-span-2" />
      </div>

      <div className={`mb-3 mt-8 h-4 w-28 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton lines={5} />
      </div>

      <div className={`mb-3 mt-8 h-4 w-32 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton sparkline />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton chartHeight={180} className="lg:col-span-2" />
        <AnalyticsPanelSkeleton chartHeight={180} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton lines={5} />
      </div>

      <div className={`mb-3 mt-8 h-4 w-36 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>

      <div className={`mb-3 mt-8 h-4 w-24 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton chartHeight={160} />
        <AnalyticsPanelSkeleton bars={5} />
      </div>
    </div>
  );
}

export function AnalyticsContentSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading content analytics">
      <div className={`mb-3 h-4 w-28 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton bars={2} />
        <AnalyticsPanelSkeleton bars={2} />
      </div>

      <div className={`mb-3 mt-8 h-4 w-36 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton bars={3} />
        <AnalyticsPanelSkeleton bars={3} />
        <AnalyticsPanelSkeleton bars={2} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton tableRows={4} />
      </div>

      <div className={`mb-3 mt-8 h-4 w-16 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton bars={2} />
        <AnalyticsPanelSkeleton bars={2} />
        <AnalyticsPanelSkeleton bars={3} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton bars={4} />
        <AnalyticsPanelSkeleton bars={4} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton tableRows={4} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton bars={3} />
        <AnalyticsPanelSkeleton bars={3} />
        <AnalyticsPanelSkeleton lines={5} />
      </div>

      <div className={`mb-3 mt-8 h-4 w-20 ${analyticsSkeletonBone}`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton bars={2} />
        <AnalyticsPanelSkeleton bars={2} />
        <AnalyticsPanelSkeleton bars={3} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton tableRows={4} />
      </div>
    </div>
  );
}

export function AnalyticsProductsSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading product analytics">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className={`mt-2 h-3 w-72 ${analyticsSkeletonBone}`} />
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton tableRows={6} className="lg:col-span-2" />
        <AnalyticsPanelSkeleton bars={5} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton chartHeight={180} />
        <AnalyticsPanelSkeleton bars={5} className="lg:col-span-2" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton bars={5} />
        <AnalyticsPanelSkeleton bars={5} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton bars={5} />
        <AnalyticsPanelSkeleton bars={5} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton tableRows={4} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton lines={3} />
        <AnalyticsPanelSkeleton lines={3} />
        <AnalyticsPanelSkeleton lines={3} />
      </div>
    </div>
  );
}

export function AnalyticsInventorySkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading inventory analytics">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className={`mt-2 h-3 w-64 ${analyticsSkeletonBone}`} />
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton bars={4} />
        <AnalyticsPanelSkeleton tableRows={4} className="lg:col-span-2" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton tableRows={6} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton tableRows={5} />
        <AnalyticsPanelSkeleton tableRows={5} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton lines={5} />
      </div>
    </div>
  );
}
