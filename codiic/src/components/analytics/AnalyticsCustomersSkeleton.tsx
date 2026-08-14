import React from 'react';
import { AnalyticsMetricCardSkeleton, AnalyticsPanelSkeleton } from './analyticsSkeletonUi';

export default function AnalyticsCustomersSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading customer analytics">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsMetricCardSkeleton sparkline />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AnalyticsPanelSkeleton statPairs={2} />
        <AnalyticsPanelSkeleton statPairs={2} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton chartHeight={180} className="lg:col-span-2" />
        <AnalyticsPanelSkeleton chartHeight={180} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton lines={5} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <AnalyticsPanelSkeleton lines={4} />
        <AnalyticsPanelSkeleton lines={3} />
        <AnalyticsPanelSkeleton bars={4} />
        <AnalyticsPanelSkeleton lines={3} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AnalyticsPanelSkeleton bars={5} />
        <AnalyticsPanelSkeleton bars={5} />
        <AnalyticsPanelSkeleton bars={4} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <AnalyticsPanelSkeleton tableRows={4} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <AnalyticsPanelSkeleton bars={4} />
        <AnalyticsPanelSkeleton bars={4} />
        <AnalyticsPanelSkeleton bars={4} />
        <AnalyticsPanelSkeleton bars={4} />
      </div>
    </div>
  );
}
