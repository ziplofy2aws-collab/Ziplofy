import { UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { type AnalyticsHint } from '../components/analytics/AnalyticsInfoLabel';
import AnalyticsCustomersSkeleton from '../components/analytics/AnalyticsCustomersSkeleton';
import AnalyticsDateRangePicker, {
  type AnalyticsPickerRange,
  type CompareMode,
} from '../components/analytics/AnalyticsDateRangePicker';
import { AnalyticsOverTimeLineChart } from '../components/analytics/AnalyticsOverTimeLineChart';
import { AnalyticsSalesByLocationChart } from '../components/analytics/AnalyticsSalesByLocationChart';
import { AnalyticsGrowBar, useAnalyticsReplayKey } from '../components/analytics/analyticsChartMotion';
import {
  AnalyticsCountBarList,
  AnalyticsMetricCard,
  AnalyticsMoneyRowList,
  AnalyticsPanelCard,
  analyticsEmptyTextClass,
  formatAnalyticsDelta,
} from '../components/analytics/analyticsSectionUi';
import { formatCount, formatDays, formatInr, formatPercent } from '../components/analytics/analyticsChartTheme';
import { useAnalytics } from '../contexts/analytics.context';
import { useStore } from '../contexts/store.context';

const HINTS = {
  newCustomers: {
    how: 'Customers whose account was created in the selected date range.',
    interpret: 'New signups, whether or not they bought. Pair with purchased vs never bought to see conversion.',
  },
  buyers: {
    how: 'Unique customers with at least one non-cancelled order in the selected date range.',
    interpret: 'Buyer volume this period. Compare with new customers to see how many signups actually purchased.',
  },
  purchasedVsNeverBought: {
    how: 'Of signups in this range, how many have at least one non-cancelled order vs none. Storewide totals are shown underneath.',
    interpret: 'A large never-bought share means acquisition is not converting. Storewide shows overall list health.',
  },
  newVsReturningBuyers: {
    how: 'Buyers in this range whose first-ever order is in the range (new) vs buyers who also ordered before the range (returning).',
    interpret: 'This is buyer counts, not just a rate. Growth with only new buyers can still be one-time demand.',
  },
  ltvDistribution: {
    how: 'Lifetime order totals (non-cancelled) for every buyer, grouped into spend buckets.',
    interpret: 'Shows concentration of value. If most customers sit in ₹0–999, a few high-LTV buyers may be carrying revenue.',
  },
  ordersPerCustomer: {
    how: 'Average and median lifetime order count among buyers, plus average including customers who never bought.',
    interpret: 'Median is less skewed by whales. All-customers average drops when many signups never purchase.',
  },
  timeToFirstPurchase: {
    how: 'Days from customer signup to their first non-cancelled order. Average and median across buyers.',
    interpret: 'Shorter is better onboarding. A long median means people sign up and wait before buying.',
  },
  recency: {
    how: 'Days since each buyer’s last non-cancelled order, measured to the end of the selected range.',
    interpret: 'Recent buyers are warmer. A pile-up in 180+ days means the list is going cold.',
  },
  purchaseFrequency: {
    how: 'Among buyers with 2+ orders: (last order − first order) ÷ (orders − 1), then average and median.',
    interpret: 'How often repeat customers come back. Smaller days = higher frequency.',
  },
  emailOptIn: {
    how: 'Share of all store customers with agreedToMarketingEmails = true.',
    interpret: 'List permission health. Higher opt-in means more people you can legally email.',
  },
  smsOptIn: {
    how: 'Share of all store customers with agreedToSmsMarketing = true.',
    interpret: 'SMS reach. Often lower than email; useful for COD reminders and launches.',
  },
  customersByTag: {
    how: 'Current customer tag assignments, counted across the whole store.',
    interpret: 'Shows how you label the list. Tags with lots of people are your biggest manual cohorts.',
  },
  segments: {
    how: 'Manual segment membership count, plus GMV and orders from those customers in the selected range.',
    interpret: 'Which saved segments actually spend. Empty GMV means the segment has not bought in this period.',
  },
  languageMix: {
    how: 'All store customers grouped by their language setting.',
    interpret: 'Use this for localization and support coverage. Default is usually English.',
  },
  aovByCountry: {
    how: 'Gross sales ÷ orders in the range, grouped by shipping country.',
    interpret: 'Where baskets are bigger, not just where volume is higher.',
  },
  aovByState: {
    how: 'Gross sales ÷ orders in the range, grouped by shipping state.',
    interpret: 'State-level basket size. Useful for shipping and inventory planning.',
  },
  aovByCity: {
    how: 'Gross sales ÷ orders in the range, grouped by shipping city.',
    interpret: 'City-level basket size. Free-text cities can be messy, so treat small samples carefully.',
  },
  salesByPin: {
    how: 'Gross sales and orders in the range, grouped by shipping pin code.',
    interpret: 'Hyperlocal demand. Good for delivery coverage and dark-store thinking.',
  },
  returningCustomerRate: {
    how: 'Share of customers who ordered in this range and also had at least one earlier non-cancelled order.',
    interpret: 'Higher is healthier loyalty. 0% usually means first-time buyers only in this period.',
  },
  repeatPurchaseRate: {
    how: 'Of customers who ordered in this range, the share whose lifetime order count is 2 or more.',
    interpret: 'Shows repeat buying, not just this period. A low rate means most buyers are still one-time.',
  },
  aovOverTime: {
    how: 'Gross sales divided by order count in each time bucket. Overall AOV is range sales ÷ range orders.',
    interpret: 'Higher AOV means bigger baskets. Watch if volume rises while AOV falls.',
  },
  salesByLocation: {
    how: 'Gross sales grouped by shipping country and state from the order address.',
    interpret: 'Shows where orders are shipping. Useful for inventory and shipping coverage.',
  },
  topCustomers: {
    how: 'Customers ranked by sum of order totals in the selected range (non-cancelled).',
    interpret: 'Your highest spenders this period. Order count shows whether spend is one big order or many.',
  },
} as const satisfies Record<string, AnalyticsHint>;

const AnalyticsCustomersPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const {
    customerInsights,
    compareCustomerInsights,
    insights,
    compareInsights,
    aovOverTime,
    compareAovOverTime,
    range,
    compareRange,
    error,
    setRange,
    setCompare,
    fetchCustomerInsights,
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
      fetchCustomerInsights(activeStoreId, range).catch(() => {}),
      fetchSummary(activeStoreId, range).catch(() => {}),
    ]).finally(() => {
      setHasLoaded(true);
    });
  }, [activeStoreId, range, compareRange, fetchCustomerInsights, fetchSummary]);

  const ltvReplayKey = useAnalyticsReplayKey(customerInsights.ltvDistribution);
  const aovChartPoints = aovOverTime.points.map((point) => ({
    t: point.t,
    label: point.label,
    sales: point.aov,
  }));
  const compareAovChartPoints = compareAovOverTime
    ? compareAovOverTime.points.map((point) => ({
        t: point.t,
        label: point.label,
        sales: point.aov,
      }))
    : null;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1000px] pb-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              Customer analytics
            </h1>
          </div>
          <p className="mb-3 text-[13px] text-admin-text-secondary">
            Customer insights from signups, orders, tags, segments, and shipping addresses.
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
          <AnalyticsCustomersSkeleton />
        ) : (
          <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetricCard
            title="New customers"
            hint={HINTS.newCustomers}
            value={formatCount(customerInsights.newCustomers)}
            delta={formatAnalyticsDelta(
              customerInsights.newCustomers,
              compareCustomerInsights?.newCustomers,
            )}
          />
          <AnalyticsMetricCard
            title="Buyers"
            hint={HINTS.buyers}
            value={formatCount(customerInsights.newVsReturningBuyers.totalBuyers)}
            delta={formatAnalyticsDelta(
              customerInsights.newVsReturningBuyers.totalBuyers,
              compareCustomerInsights?.newVsReturningBuyers.totalBuyers,
            )}
          />
          <AnalyticsMetricCard
            title="Email opt-in"
            hint={HINTS.emailOptIn}
            value={formatPercent(customerInsights.emailOptIn.rate)}
            delta={formatAnalyticsDelta(
              customerInsights.emailOptIn.rate,
              compareCustomerInsights?.emailOptIn.rate,
            )}
          />
          <AnalyticsMetricCard
            title="SMS opt-in"
            hint={HINTS.smsOptIn}
            value={formatPercent(customerInsights.smsOptIn.rate)}
            delta={formatAnalyticsDelta(
              customerInsights.smsOptIn.rate,
              compareCustomerInsights?.smsOptIn.rate,
            )}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnalyticsMetricCard
            title="Returning customer rate"
            hint={HINTS.returningCustomerRate}
            value={formatPercent(insights.returningCustomerRate.rate)}
            delta={formatAnalyticsDelta(
              insights.returningCustomerRate.rate,
              compareInsights?.returningCustomerRate.rate,
            )}
            sparkline={insights.sparkline.returningRate}
          />
          <AnalyticsMetricCard
            title="Repeat purchase rate"
            hint={HINTS.repeatPurchaseRate}
            value={formatPercent(insights.repeatPurchaseRate.rate)}
            delta={formatAnalyticsDelta(
              insights.repeatPurchaseRate.rate,
              compareInsights?.repeatPurchaseRate.rate,
            )}
          />
          <AnalyticsMetricCard
            title="AOV"
            hint={HINTS.aovOverTime}
            value={formatInr(aovOverTime.averageOrderValue)}
            delta={formatAnalyticsDelta(
              aovOverTime.averageOrderValue,
              compareAovOverTime?.averageOrderValue,
            )}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <AnalyticsPanelCard title="Purchased vs never bought" hint={HINTS.purchasedVsNeverBought}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[12px] text-admin-text-secondary">Signups who purchased</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">
                  {formatCount(customerInsights.purchasedVsNeverBought.purchased)}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-admin-text-secondary">Signups who never bought</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">
                  {formatCount(customerInsights.purchasedVsNeverBought.neverBought)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-admin-text-subdued">
              Storewide {formatCount(customerInsights.purchasedVsNeverBought.storePurchased)}{' '}
              purchased · {formatCount(customerInsights.purchasedVsNeverBought.storeNeverBought)} never
              bought · {formatCount(customerInsights.purchasedVsNeverBought.storeCustomers)} customers
            </p>
          </AnalyticsPanelCard>

          <AnalyticsPanelCard title="New vs returning buyers" hint={HINTS.newVsReturningBuyers}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[12px] text-admin-text-secondary">New buyers</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">
                  {formatCount(customerInsights.newVsReturningBuyers.newBuyers)}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-admin-text-secondary">Returning buyers</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">
                  {formatCount(customerInsights.newVsReturningBuyers.returningBuyers)}
                </p>
              </div>
              <p className="col-span-2 text-[12px] text-admin-text-subdued">
                {formatCount(customerInsights.newVsReturningBuyers.totalBuyers)} buyers in this range
              </p>
            </div>
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <AnalyticsPanelCard title="Average order value over time" hint={HINTS.aovOverTime} className="min-h-[280px] lg:col-span-2">
            <div className="flex items-baseline gap-2">
              <p className="text-[22px] font-semibold tracking-tight text-admin-text">
                {formatInr(aovOverTime.averageOrderValue)}
              </p>
              <span className="text-[13px] text-admin-text-subdued">
                {formatAnalyticsDelta(
                  aovOverTime.averageOrderValue,
                  compareAovOverTime?.averageOrderValue,
                )}
              </span>
            </div>
            <AnalyticsOverTimeLineChart
              points={aovChartPoints}
              comparePoints={compareAovChartPoints}
              primaryLabel="Selected range"
              compareLabel={compareRange ? 'Compare' : null}
              valueLabel="AOV"
              loading={false}
              height={200}
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Total sales by location" hint={HINTS.salesByLocation}>
            <AnalyticsSalesByLocationChart rows={insights.salesByLocation} loading={false} />
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <AnalyticsPanelCard title="Top customers by spend" hint={HINTS.topCustomers}>
            {insights.topCustomers.length === 0 ? (
              <p className={analyticsEmptyTextClass}>No customers in this date range</p>
            ) : (
              <ul className="space-y-2">
                {insights.topCustomers.map((row) => (
                  <li key={row.customerId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-admin-text">{row.name}</p>
                      {row.email ? (
                        <p className="truncate text-[12px] text-admin-text-subdued">{row.email}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular-nums text-[13px] font-semibold text-admin-text">
                        {formatInr(row.sales)}
                      </p>
                      <p className="text-[11px] text-admin-text-subdued">
                        {formatCount(row.orders)} orders
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <AnalyticsPanelCard title="Orders per customer" hint={HINTS.ordersPerCustomer}>
            <div className="space-y-2 text-[13px]">
              <p>
                <span className="text-admin-text-secondary">Average (buyers) </span>
                <strong className="tabular-nums text-admin-text">
                  {customerInsights.ordersPerCustomer.average.toFixed(1)}
                </strong>
              </p>
              <p>
                <span className="text-admin-text-secondary">Median (buyers) </span>
                <strong className="tabular-nums text-admin-text">
                  {customerInsights.ordersPerCustomer.median.toFixed(1)}
                </strong>
              </p>
              <p>
                <span className="text-admin-text-secondary">Average (all customers) </span>
                <strong className="tabular-nums text-admin-text">
                  {customerInsights.ordersPerCustomer.allCustomersAverage.toFixed(1)}
                </strong>
              </p>
              <p className="text-[12px] text-admin-text-subdued">
                {formatCount(customerInsights.ordersPerCustomer.buyers)} buyers
              </p>
            </div>
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Time to first purchase" hint={HINTS.timeToFirstPurchase}>
            <div className="space-y-2 text-[13px]">
              <p className="text-[22px] font-semibold tracking-tight text-admin-text">
                {formatDays(customerInsights.timeToFirstPurchase.averageDays)}
              </p>
              <p className="text-admin-text-secondary">
                Median {formatDays(customerInsights.timeToFirstPurchase.medianDays)} ·{' '}
                {formatCount(customerInsights.timeToFirstPurchase.sample)} buyers
              </p>
            </div>
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Recency" hint={HINTS.recency}>
            <div>
              <p className="text-[22px] font-semibold tracking-tight text-admin-text">
                {formatDays(customerInsights.recency.averageDays)}
              </p>
              <p className="mb-3 text-[12px] text-admin-text-secondary">
                Median {formatDays(customerInsights.recency.medianDays)} since last order
              </p>
              <AnalyticsCountBarList
                rows={customerInsights.recency.buckets}
                empty="No buyers yet"
                loading={false}
              />
            </div>
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Purchase frequency" hint={HINTS.purchaseFrequency}>
            <div className="space-y-2 text-[13px]">
              <p className="text-[22px] font-semibold tracking-tight text-admin-text">
                {formatDays(customerInsights.purchaseFrequency.averageDays)}
              </p>
              <p className="text-admin-text-secondary">
                Median {formatDays(customerInsights.purchaseFrequency.medianDays)} between orders
              </p>
              <p className="text-[12px] text-admin-text-subdued">
                {formatCount(customerInsights.purchaseFrequency.sample)} repeat buyers (2+ orders)
              </p>
            </div>
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <AnalyticsPanelCard title="Customer LTV distribution" hint={HINTS.ltvDistribution}>
            {customerInsights.ltvDistribution.every((row) => row.customers === 0) ? (
              <p className={analyticsEmptyTextClass}>No buyer LTV yet</p>
            ) : (
              <ul className="space-y-2">
                {customerInsights.ltvDistribution.map((row) => {
                  const max = Math.max(...customerInsights.ltvDistribution.map((item) => item.customers), 0);
                  const widthPct = max > 0 ? Math.max((row.customers / max) * 100, row.customers > 0 ? 8 : 0) : 0;
                  return (
                    <li key={row.key}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                        <span className="text-admin-text">{row.label}</span>
                        <span className="tabular-nums text-admin-text-secondary">
                          {formatCount(row.customers)}
                        </span>
                      </div>
                      <div className="h-6 overflow-hidden rounded-sm bg-admin-row-hover">
                        <AnalyticsGrowBar widthPct={widthPct} replayKey={`${row.key}:${ltvReplayKey}`} />
                      </div>
                      <p className="mt-1 text-[11px] text-admin-text-subdued">{formatInr(row.sales)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Customers by tag" hint={HINTS.customersByTag}>
            <AnalyticsCountBarList
              rows={customerInsights.customersByTag}
              empty="No customer tags yet"
              loading={false}
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Language mix" hint={HINTS.languageMix}>
            <AnalyticsCountBarList
              rows={customerInsights.languageMix}
              empty="No customers yet"
              loading={false}
            />
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <AnalyticsPanelCard title="Segment size + GMV" hint={HINTS.segments}>
            {customerInsights.segments.length === 0 ? (
              <p className={analyticsEmptyTextClass}>No customer segments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-[12px] text-admin-text-secondary">
                      <th className="pb-2 font-medium">Segment</th>
                      <th className="pb-2 text-right font-medium">Customers</th>
                      <th className="pb-2 text-right font-medium">Orders</th>
                      <th className="pb-2 text-right font-medium">GMV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInsights.segments.map((row) => (
                      <tr key={row.segmentId} className="border-t border-admin-divider">
                        <td className="py-2.5 font-medium text-admin-text">{row.name}</td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                          {formatCount(row.customers)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text-secondary">
                          {formatCount(row.orders)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-admin-text">
                          {formatInr(row.gmv)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnalyticsPanelCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <AnalyticsPanelCard title="AOV by country" hint={HINTS.aovByCountry}>
            <AnalyticsMoneyRowList
              rows={customerInsights.aovByCountry}
              empty="No location sales in this range"
              loading={false}
              showAov
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="AOV by state" hint={HINTS.aovByState}>
            <AnalyticsMoneyRowList
              rows={customerInsights.aovByState}
              empty="No location sales in this range"
              loading={false}
              showAov
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="AOV by city" hint={HINTS.aovByCity}>
            <AnalyticsMoneyRowList
              rows={customerInsights.aovByCity}
              empty="No location sales in this range"
              loading={false}
              showAov
            />
          </AnalyticsPanelCard>
          <AnalyticsPanelCard title="Sales by pin code" hint={HINTS.salesByPin}>
            <AnalyticsMoneyRowList
              rows={customerInsights.salesByPin}
              empty="No pin codes in this range"
              loading={false}
            />
          </AnalyticsPanelCard>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCustomersPage;
