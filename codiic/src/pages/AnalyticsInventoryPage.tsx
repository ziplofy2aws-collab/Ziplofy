import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { type AnalyticsHint } from '../components/analytics/AnalyticsInfoLabel';
import AnalyticsDateRangePicker, {
  type AnalyticsPickerRange,
  type CompareMode,
} from '../components/analytics/AnalyticsDateRangePicker';
import { AnalyticsInventorySkeleton } from '../components/analytics/analyticsSkeletonUi';
import {
  AnalyticsCountBarList,
  AnalyticsMetricCard,
  AnalyticsPanelCard,
  analyticsEmptyTextClass,
  formatAnalyticsDelta,
} from '../components/analytics/analyticsSectionUi';
import { formatCount, formatInr } from '../components/analytics/analyticsChartTheme';
import {
  useAnalytics,
  type AnalyticsCoverRow,
  type AnalyticsInventoryLocationRow,
  type AnalyticsInventoryQtyRow,
  type AnalyticsNamedCount,
} from '../contexts/analytics.context';
import { useStore } from '../contexts/store.context';

const HINTS = {
  onHand: {
    how: 'Sum of InventoryLevel.onHand across tracked variants at this store’s locations. Snapshot now — not the date range.',
    interpret: 'Physical units on the shelf. Does not drop when an order is placed; committed is reserved separately.',
  },
  available: {
    how: 'Sum of InventoryLevel.available. Available = on-hand − committed − unavailable (damaged + QC + safety + other). Snapshot now.',
    interpret: 'What can still sell. If this is 0 while on-hand is not, stock is reserved or marked unavailable.',
  },
  committed: {
    how: 'Sum of InventoryLevel.committed. Raised when an order is placed. Snapshot now.',
    interpret: 'Open orders still holding stock. Cancel/fulfill may not release this yet, so it can run high vs true open orders.',
  },
  incoming: {
    how: 'Sum of InventoryLevel.incoming (purchase orders + inbound transfers in transit). Snapshot now.',
    interpret: 'Pipeline arriving. Useful with low available — incoming may cover a shortfall soon.',
  },
  value: {
    how: 'On-hand × current variant cost, falling back to product cost. Snapshot now.',
    interpret: 'Inventory at cost today, not at purchase time. SKUs missing cost are undercounted.',
  },
  daysOfCover: {
    how: 'Storewide on-hand ÷ (units sold in the selected range ÷ days). Only tracked inventory SKUs.',
    interpret: 'How many days current stock lasts at this period’s sell rate. Low cover = restock soon. No sales in range → —.',
  },
  unavailable: {
    how: 'Unavailable buckets on InventoryLevel: damaged, qualityControl, safetyStock, other. Snapshot now.',
    interpret: 'Units that cannot sell. QC and safety are often intentional; damaged/other usually need action.',
  },
  bySku: {
    how: 'Current inventory levels rolled up by variant SKU across all locations. Snapshot now.',
    interpret: 'Where units sit by SKU. High on-hand with low available means committed or unavailable is eating sellable stock.',
  },
  byLocation: {
    how: 'Current inventory levels grouped by location. Snapshot now.',
    interpret: 'Which warehouse/store holds stock. Imbalance here is a transfer candidate.',
  },
  committedBySku: {
    how: 'SKUs with InventoryLevel.committed > 0, sorted by committed qty. Snapshot now.',
    interpret: 'Which SKUs open orders are still holding. Pair with unfulfilled orders on Analytics.',
  },
  coverRisk: {
    how: 'On-hand ÷ (units sold in range ÷ days). Lowest cover first. SKUs with no sales in range are omitted.',
    interpret: 'Stockout risk. 0 days with sales = already selling out. High velocity + low on-hand = reorder first.',
  },
  inventoryRisk: {
    how: 'Variants whose available inventory is 0 (sold out) or 5 or fewer (low stock).',
    interpret: 'Act on sold-out first, then low stock. Available is on-hand minus committed.',
  },
} as const satisfies Record<string, AnalyticsHint>;

function formatVelocity(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 / day';
  if (value < 10) return `${value.toFixed(1)} / day`;
  return `${Math.round(value)} / day`;
}

function formatCover(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 10) return `${value.toFixed(1)} d`;
  return `${Math.round(value)} d`;
}

function SkuStockTable({
  rows,
  loading,
  empty,
}: {
  rows: AnalyticsInventoryQtyRow[];
  loading: boolean;
  empty: string;
}) {
  if (loading && rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>Loading…</p>;
  }
  if (rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-admin-text-secondary">
            <th className="pb-2 font-medium">SKU</th>
            <th className="pb-2 font-medium">Product</th>
            <th className="pb-2 text-right font-medium">On hand</th>
            <th className="pb-2 text-right font-medium">Available</th>
            <th className="pb-2 text-right font-medium">Committed</th>
            <th className="pb-2 text-right font-medium">Incoming</th>
            <th className="pb-2 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.variantId} className="border-t border-admin-divider">
              <td className="py-2.5 font-medium text-admin-text">{row.sku}</td>
              <td className="py-2.5 text-admin-text">
                <p className="truncate">{row.title}</p>
                {row.options ? (
                  <p className="truncate text-[12px] text-admin-text-subdued">{row.options}</p>
                ) : null}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.onHand)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.available)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.committed)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.incoming)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text">{formatInr(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LocationTable({
  rows,
  loading,
}: {
  rows: AnalyticsInventoryLocationRow[];
  loading: boolean;
}) {
  if (loading && rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>Loading…</p>;
  }
  if (rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>No inventory locations yet</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-admin-text-secondary">
            <th className="pb-2 font-medium">Location</th>
            <th className="pb-2 text-right font-medium">On hand</th>
            <th className="pb-2 text-right font-medium">Available</th>
            <th className="pb-2 text-right font-medium">Committed</th>
            <th className="pb-2 text-right font-medium">Incoming</th>
            <th className="pb-2 text-right font-medium">Unavailable</th>
            <th className="pb-2 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.locationId} className="border-t border-admin-divider">
              <td className="py-2.5 font-medium text-admin-text">{row.name}</td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.onHand)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.available)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.committed)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.incoming)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.unavailable)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text">{formatInr(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoverTable({ rows, loading }: { rows: AnalyticsCoverRow[]; loading: boolean }) {
  if (loading && rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>Loading…</p>;
  }
  if (rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>No selling SKUs with stock to cover in this range</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-admin-text-secondary">
            <th className="pb-2 font-medium">SKU</th>
            <th className="pb-2 font-medium">Product</th>
            <th className="pb-2 text-right font-medium">On hand</th>
            <th className="pb-2 text-right font-medium">Units sold</th>
            <th className="pb-2 text-right font-medium">Velocity</th>
            <th className="pb-2 text-right font-medium">Cover</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.variantId} className="border-t border-admin-divider">
              <td className="py-2.5 font-medium text-admin-text">{row.sku}</td>
              <td className="py-2.5 text-admin-text">
                <p className="truncate">{row.title}</p>
                {row.options ? (
                  <p className="truncate text-[12px] text-admin-text-subdued">{row.options}</p>
                ) : null}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.onHand)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatCount(row.units)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatVelocity(row.velocity)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text">
                {formatCover(row.daysOfCover)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const AnalyticsInventoryPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const {
    inventoryInsights,
    compareInventoryInsights,
    insights,
    range,
    compareRange,
    error,
    setRange,
    setCompare,
    fetchInventoryInsights,
    fetchSummary,
  } = useAnalytics();
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleRangeChange = useCallback(
    (pickerRange: AnalyticsPickerRange) => {
      setRange({ from: pickerRange.start, to: pickerRange.end });
    },
    [setRange],
  );

  const handleCompareChange = useCallback(
    (payload: { mode: CompareMode; range: AnalyticsPickerRange | null }) => {
      setCompare({
        mode: payload.mode,
        range: payload.range
          ? { from: payload.range.start, to: payload.range.end }
          : null,
      });
    },
    [setCompare],
  );

  useEffect(() => {
    if (!activeStoreId || !range) return;
    void Promise.all([
      fetchInventoryInsights(activeStoreId, range).catch(() => {}),
      fetchSummary(activeStoreId, range).catch(() => {}),
    ]).finally(() => {
      setHasLoaded(true);
    });
  }, [activeStoreId, range, compareRange, fetchInventoryInsights, fetchSummary]);

  const totals = inventoryInsights.totals;
  const compareCover = compareInventoryInsights?.totals.daysOfCover;
  const breakdown = inventoryInsights.unavailableBreakdown;
  const unavailableRows: AnalyticsNamedCount[] = [
    { key: 'damaged', name: 'Damaged', value: breakdown.damaged },
    { key: 'qualityControl', name: 'QC', value: breakdown.qualityControl },
    { key: 'safetyStock', name: 'Safety', value: breakdown.safetyStock },
    { key: 'other', name: 'Other', value: breakdown.other },
  ].filter((row) => row.value > 0);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1000px] pb-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <ArchiveBoxIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              Inventory analytics
            </h1>
          </div>
          <p className="mb-3 text-[13px] text-admin-text-secondary">
            Stock quantities are a snapshot of right now. The date range only changes days of cover
            (on-hand ÷ recent sell rate).
          </p>
          <AnalyticsDateRangePicker
            onRangeChange={handleRangeChange}
            onCompareChange={handleCompareChange}
          />
          {error ? (
            <p className="mt-2 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </header>

        {!hasLoaded ? (
          <AnalyticsInventorySkeleton />
        ) : (
          <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetricCard
            title="On hand"
            hint={HINTS.onHand}
            value={formatCount(totals.onHand)}
            delta="now"
          />
          <AnalyticsMetricCard
            title="Available"
            hint={HINTS.available}
            value={formatCount(totals.available)}
            delta="now"
          />
          <AnalyticsMetricCard
            title="Committed"
            hint={HINTS.committed}
            value={formatCount(totals.committed)}
            delta="now"
          />
          <AnalyticsMetricCard
            title="Incoming"
            hint={HINTS.incoming}
            value={formatCount(totals.incoming)}
            delta="now"
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnalyticsMetricCard
            title="Inventory value"
            hint={HINTS.value}
            value={formatInr(totals.value)}
            delta="now"
          />
          <AnalyticsMetricCard
            title="Days of cover"
            hint={HINTS.daysOfCover}
            value={formatCover(totals.daysOfCover)}
            delta={formatAnalyticsDelta(totals.daysOfCover, compareCover)}
          />
          <AnalyticsMetricCard
            title="Unavailable"
            hint={HINTS.unavailable}
            value={formatCount(totals.unavailable)}
            delta="now"
          />
        </div>
        {totals.skusMissingCost > 0 ? (
          <p className="mt-2 text-[12px] text-admin-text-subdued">
            Value uses current cost. {formatCount(totals.skusMissingCost)} on-hand SKU
            {totals.skusMissingCost === 1 ? '' : 's'} missing cost.
          </p>
        ) : (
          <p className="mt-2 text-[12px] text-admin-text-subdued">
            Cover uses {formatCount(inventoryInsights.daySpan)} day
            {inventoryInsights.daySpan === 1 ? '' : 's'} in the selected range.
          </p>
        )}

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <AnalyticsPanelCard title="Unavailable breakdown" hint={HINTS.unavailable}>
            <AnalyticsCountBarList
              rows={unavailableRows}
              empty="No unavailable units"
              loading={false}
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Stock by location" hint={HINTS.byLocation} className="lg:col-span-2">
            <LocationTable rows={inventoryInsights.byLocation} loading={false} />
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <AnalyticsPanelCard title="On-hand by SKU" hint={HINTS.bySku}>
            <SkuStockTable
              rows={inventoryInsights.bySku}
              loading={false}
              empty="No tracked inventory yet"
            />
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <AnalyticsPanelCard title="Committed inventory" hint={HINTS.committedBySku}>
            <SkuStockTable
              rows={inventoryInsights.committedBySku}
              loading={false}
              empty="No committed stock"
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Lowest days of cover" hint={HINTS.coverRisk}>
            <CoverTable rows={inventoryInsights.coverRisk} loading={false} />
            <p className="mt-3 text-[12px] text-admin-text-subdued">
              Lowest cover first. SKUs with no sales in this range are omitted.
            </p>
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <AnalyticsPanelCard title="Inventory risk" hint={HINTS.inventoryRisk}>
            {insights.inventoryRisk.length === 0 ? (
              <p className={analyticsEmptyTextClass}>No low-stock products</p>
            ) : (
              <ul className="space-y-2">
                {insights.inventoryRisk.map((row) => (
                  <li
                    key={row.variantId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-admin-divider px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-admin-text" title={row.title}>
                        {row.title}
                      </p>
                      {row.sku ? (
                        <p className="truncate text-[12px] text-admin-text-subdued">{row.sku}</p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        row.status === 'sold_out'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {row.status === 'sold_out' ? 'Sold out' : `${formatCount(row.available)} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AnalyticsPanelCard>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsInventoryPage;
