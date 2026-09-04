import { CubeIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { type AnalyticsHint } from '../components/analytics/AnalyticsInfoLabel';
import AnalyticsDateRangePicker, {
  type AnalyticsPickerRange,
  type CompareMode,
} from '../components/analytics/AnalyticsDateRangePicker';
import { AnalyticsSalesByProductChart } from '../components/analytics/AnalyticsSalesByProductChart';
import { AnalyticsGrowBar, useAnalyticsReplayKey } from '../components/analytics/analyticsChartMotion';
import { AnalyticsProductsSkeleton } from '../components/analytics/analyticsSkeletonUi';
import {
  AnalyticsCountBarList,
  AnalyticsMetricCard,
  AnalyticsMoneyRowList,
  AnalyticsPanelCard,
  analyticsEmptyTextClass,
  formatAnalyticsDelta,
} from '../components/analytics/analyticsSectionUi';
import { formatCount, formatInr, formatPercent } from '../components/analytics/analyticsChartTheme';
import { useAnalytics, type AnalyticsSkuRow } from '../contexts/analytics.context';
import { useStore } from '../contexts/store.context';

const HINTS = {
  marginRate: {
    how: 'Line sales minus estimated COGS (sold qty × current variant/product cost), then ÷ line sales. Cancelled orders excluded.',
    interpret: 'Estimated gross margin using today’s cost, not cost at sale. Missing costs make COGS look too low.',
  },
  digitalRate: {
    how: 'Digital line sales ÷ all line sales in the range. Digital = variant/product isPhysicalProduct = false.',
    interpret: 'How much revenue is non-shippable. High digital share usually means lower fulfillment load.',
  },
  catalogActive: {
    how: 'Current products with status active and not deleted. Snapshot now, not limited to the date range.',
    interpret: 'Live catalog size. Pair with draft count to see how much of the catalog is actually selling.',
  },
  markdownRate: {
    how: 'Variants whose current compare-at is higher than current price, ÷ all in-catalog variants.',
    interpret: 'Weak markdown signal — compare-at is today’s value, not the price at checkout.',
  },
  topSkus: {
    how: 'Line items rolled up to the variant SKU. Sales = sum of line totals. Velocity = units ÷ days in range.',
    interpret: 'Your real movers, not just parent products. A cheap high-unit SKU can outrank a premium one on units.',
  },
  topOptions: {
    how: 'Sold units grouped by variant option name and value (Size: L, Color: Black, etc.).',
    interpret: 'Which options customers actually pick. Useful for restock and merchandising.',
  },
  salesByVendor: {
    how: 'Line sales grouped by the product’s current vendor.',
    interpret: 'Which suppliers are driving revenue this period.',
  },
  salesByType: {
    how: 'Line sales grouped by the product’s current product type.',
    interpret: 'Category-of-goods mix. Unspecified means the product has no type set.',
  },
  salesByCategory: {
    how: 'Line sales grouped by the product’s current category.',
    interpret: 'Where demand sits in your category tree. Each product has one category.',
  },
  salesByTag: {
    how: 'Line sales unwound across product tags. A product with 3 tags counts in all 3.',
    interpret: 'Do not add these rows together — tagged products are double-counted.',
  },
  collections: {
    how: 'Line sales attributed to every collection the product belongs to. Products in many collections repeat.',
    interpret: 'Collection performance, not store GMV. Do not sum these rows into total sales.',
  },
  digitalMix: {
    how: 'Physical vs digital line sales and units from isPhysicalProduct on the variant, falling back to the product.',
    interpret: 'Fulfillment mix. Digital units do not need shipping.',
  },
  catalogSnapshot: {
    how: 'Current active vs draft products storewide, excluding deleted.',
    interpret: 'How much of the catalog is live. A large draft share means unpublished work.',
  },
  markdownSold: {
    how: 'Sold units where unit price < current compare-at on the variant/product.',
    interpret: 'Weak on-sale proxy. Compare-at may have changed since the order.',
  },
  salesByProduct: {
    how: 'Line-item totals from non-cancelled orders, rolled up to the product. Shows the top sellers.',
    interpret: 'Ranked by revenue, not just units. A high-unit cheap item may rank below a premium SKU.',
  },
  sellThrough: {
    how: 'Units sold in this range ÷ (units sold + current on-hand inventory) for each product.',
    interpret: 'Closer to 100% means stock is moving. Very high with low on-hand is restock risk.',
  },
} as const satisfies Record<string, AnalyticsHint>;

function formatVelocity(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 / day';
  if (value < 10) return `${value.toFixed(1)} / day`;
  return `${Math.round(value)} / day`;
}

function SkuTable({
  rows,
  loading,
}: {
  rows: AnalyticsSkuRow[];
  loading: boolean;
}) {
  if (loading && rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>Loading…</p>;
  }
  if (rows.length === 0) {
    return <p className={analyticsEmptyTextClass}>No SKU sales in this date range</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-admin-text-secondary">
            <th className="pb-2 font-medium">SKU</th>
            <th className="pb-2 font-medium">Product</th>
            <th className="pb-2 text-right font-medium">Units</th>
            <th className="pb-2 text-right font-medium">Velocity</th>
            <th className="pb-2 text-right font-medium">Sales</th>
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
                {formatCount(row.units)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                {formatVelocity(row.velocity)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text">{formatInr(row.sales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const AnalyticsProductsPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const {
    productInsights,
    compareProductInsights,
    salesByProduct,
    insights,
    range,
    compareRange,
    error,
    setRange,
    setCompare,
    fetchProductInsights,
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
      fetchProductInsights(activeStoreId, range).catch(() => {}),
      fetchSummary(activeStoreId, range).catch(() => {}),
    ]).finally(() => {
      setHasLoaded(true);
    });
  }, [activeStoreId, range, compareRange, fetchProductInsights, fetchSummary]);

  const margin = productInsights.margin;
  const compareMargin = compareProductInsights?.margin;
  const digital = productInsights.digitalMix;
  const compareDigital = compareProductInsights?.digitalMix;
  const catalog = productInsights.catalog;
  const compareCatalog = compareProductInsights?.catalog;
  const markdown = productInsights.markdown;
  const compareMarkdown = compareProductInsights?.markdown;
  const sellThroughMax = Math.max(...insights.sellThrough.map((row) => row.rate), 0);
  const sellThroughReplayKey = useAnalyticsReplayKey(insights.sellThrough);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1000px] pb-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <CubeIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              Products & catalog analytics
            </h1>
          </div>
          <p className="mb-3 text-[13px] text-admin-text-secondary">
            SKU sales, velocity, vendors, types, categories, tags, collections, and catalog mix.
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
          <AnalyticsProductsSkeleton />
        ) : (
          <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetricCard
            title="Est. gross margin"
            hint={HINTS.marginRate}
            value={formatPercent(margin.marginRate)}
            delta={formatAnalyticsDelta(margin.marginRate, compareMargin?.marginRate)}
          />
          <AnalyticsMetricCard
            title="Digital sales mix"
            hint={HINTS.digitalRate}
            value={formatPercent(digital.digitalRate)}
            delta={formatAnalyticsDelta(digital.digitalRate, compareDigital?.digitalRate)}
          />
          <AnalyticsMetricCard
            title="Active catalog"
            hint={HINTS.catalogActive}
            value={formatCount(catalog.active)}
            delta={formatAnalyticsDelta(catalog.active, compareCatalog?.active)}
          />
          <AnalyticsMetricCard
            title="Markdown variants"
            hint={HINTS.markdownRate}
            value={formatPercent(markdown.catalogRate)}
            delta={formatAnalyticsDelta(markdown.catalogRate, compareMarkdown?.catalogRate)}
          />
        </div>
        <p className="mt-2 text-[12px] text-admin-text-subdued">
          Margin {formatInr(margin.grossProfit)} on {formatInr(margin.revenue)} sales · COGS{' '}
          {formatInr(margin.cogs)}
          {margin.unitsMissingCost > 0
            ? ` · ${formatCount(margin.unitsMissingCost)} units missing cost`
            : ''}
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <AnalyticsPanelCard title="Top SKUs" hint={HINTS.topSkus} className="lg:col-span-2">
            <SkuTable rows={productInsights.topSkus} loading={false} />
            <p className="mt-3 text-[12px] text-admin-text-subdued">
              Velocity uses {formatCount(productInsights.daySpan)} day
              {productInsights.daySpan === 1 ? '' : 's'} in the selected range.
            </p>
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Top variant options" hint={HINTS.topOptions}>
            <AnalyticsCountBarList
              rows={productInsights.topOptions}
              empty="No variant options sold in this range"
              loading={false}
            />
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <AnalyticsPanelCard title="Total sales by product" hint={HINTS.salesByProduct}>
            <AnalyticsSalesByProductChart
              products={salesByProduct.products}
              totalSales={salesByProduct.totalSales}
              loading={false}
              height={220}
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Products by sell-through rate" hint={HINTS.sellThrough} className="lg:col-span-2">
            {insights.sellThrough.length === 0 ? (
              <p className={analyticsEmptyTextClass}>No data for this date range</p>
            ) : (
              <ul className="space-y-2">
                {insights.sellThrough.map((row) => {
                  const widthPct = sellThroughMax > 0 ? Math.max((row.rate / sellThroughMax) * 100, 8) : 0;
                  return (
                    <li key={row.productId}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                        <span className="truncate text-admin-text" title={row.title}>
                          {row.title}
                        </span>
                        <span className="shrink-0 tabular-nums text-admin-text-secondary">
                          {formatPercent(row.rate)}
                        </span>
                      </div>
                      <div className="h-7 overflow-hidden rounded-sm bg-admin-row-hover">
                        <AnalyticsGrowBar
                          widthPct={widthPct}
                          replayKey={`${row.productId}:${sellThroughReplayKey}`}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-admin-text-subdued">
                        {formatCount(row.unitsSold)} sold · {formatCount(row.onHand)} on hand
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <AnalyticsPanelCard title="Sales by vendor" hint={HINTS.salesByVendor}>
            <AnalyticsMoneyRowList
              rows={productInsights.salesByVendor}
              empty="No vendor sales in this range"
              loading={false}
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Sales by product type" hint={HINTS.salesByType}>
            <AnalyticsMoneyRowList
              rows={productInsights.salesByType}
              empty="No product type sales in this range"
              loading={false}
            />
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <AnalyticsPanelCard title="Sales by category" hint={HINTS.salesByCategory}>
            <AnalyticsMoneyRowList
              rows={productInsights.salesByCategory}
              empty="No category sales in this range"
              loading={false}
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Sales by product tag" hint={HINTS.salesByTag}>
            <AnalyticsMoneyRowList
              rows={productInsights.salesByTag}
              empty="No tagged product sales in this range"
              loading={false}
            />
            <p className="mt-3 text-[12px] text-admin-text-subdued">
              Tags can overlap. Do not add these rows into store GMV.
            </p>
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <AnalyticsPanelCard title="Collection performance" hint={HINTS.collections}>
            {productInsights.collections.length === 0 ? (
              <p className={analyticsEmptyTextClass}>No collection sales in this range</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-[12px] text-admin-text-secondary">
                      <th className="pb-2 font-medium">Collection</th>
                      <th className="pb-2 text-right font-medium">Products</th>
                      <th className="pb-2 text-right font-medium">Orders</th>
                      <th className="pb-2 text-right font-medium">Units</th>
                      <th className="pb-2 text-right font-medium">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productInsights.collections.map((row) => (
                      <tr key={row.collectionId} className="border-t border-admin-divider">
                        <td className="py-2.5 font-medium text-admin-text">{row.name}</td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                          {formatCount(row.products)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                          {formatCount(row.orders)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                          {formatCount(row.units)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text">
                          {formatInr(row.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-[12px] text-admin-text-subdued">
              A product in multiple collections is counted in each. Do not sum this table into total sales.
            </p>
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <AnalyticsPanelCard title="Digital vs physical" hint={HINTS.digitalMix}>
            <div className="space-y-2 text-[13px]">
                <p>
                  <span className="text-admin-text-secondary">Physical </span>
                  <strong className="tabular-nums text-admin-text">{formatInr(digital.physicalSales)}</strong>
                  <span className="text-admin-text-subdued">
                    {' '}
                    · {formatCount(digital.physicalUnits)} units
                  </span>
                </p>
                <p>
                  <span className="text-admin-text-secondary">Digital </span>
                  <strong className="tabular-nums text-admin-text">{formatInr(digital.digitalSales)}</strong>
                  <span className="text-admin-text-subdued">
                    {' '}
                    · {formatCount(digital.digitalUnits)} units
                  </span>
                </p>
              </div>
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Catalog size" hint={HINTS.catalogSnapshot}>
              <div className="space-y-2 text-[13px]">
                <p>
                  <span className="text-admin-text-secondary">Active </span>
                  <strong className="tabular-nums text-admin-text">{formatCount(catalog.active)}</strong>
                </p>
                <p>
                  <span className="text-admin-text-secondary">Draft </span>
                  <strong className="tabular-nums text-admin-text">{formatCount(catalog.draft)}</strong>
                </p>
                <p className="text-[12px] text-admin-text-subdued">
                  {formatCount(catalog.total)} products · {formatPercent(catalog.activeRate)} active
                </p>
              </div>
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Compare-at / markdown" hint={HINTS.markdownSold}>
              <div className="space-y-2 text-[13px]">
                <p>
                  <span className="text-admin-text-secondary">Variants on sale now </span>
                  <strong className="tabular-nums text-admin-text">
                    {formatCount(markdown.catalogOnSale)}
                  </strong>
                  <span className="text-admin-text-subdued">
                    {' '}
                    / {formatCount(markdown.catalogTotal)}
                  </span>
                </p>
                <p>
                  <span className="text-admin-text-secondary">Units sold below compare-at </span>
                  <strong className="tabular-nums text-admin-text">
                    {formatCount(markdown.soldOnSaleUnits)}
                  </strong>
                  <span className="text-admin-text-subdued">
                    {' '}
                    / {formatCount(markdown.soldUnits)}
                  </span>
                </p>
                <p className="text-[12px] text-admin-text-subdued">
                  Compare-at is current, not stored on the order.
                </p>
              </div>
          </AnalyticsPanelCard>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsProductsPage;
