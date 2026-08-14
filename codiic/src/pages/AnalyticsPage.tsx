import { ChartBarIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminListFooterLinkClass } from '../components/admin-list-ui';
import {
  AnalyticsInfoLabel,
  type AnalyticsHint,
} from '../components/analytics/AnalyticsInfoLabel';
import { AnalyticsOverTimeLineChart } from '../components/analytics/AnalyticsOverTimeLineChart';
import { AnalyticsPaymentMethodChart } from '../components/analytics/AnalyticsPaymentMethodChart';
import { AnalyticsSalesByLocationChart } from '../components/analytics/AnalyticsSalesByLocationChart';
import { AnalyticsSalesByProductChart } from '../components/analytics/AnalyticsSalesByProductChart';
import { AnalyticsSessionsByDeviceChart } from '../components/analytics/AnalyticsSessionsByDeviceChart';
import AnalyticsDateRangePicker, {
  type AnalyticsPickerRange,
  type CompareMode,
} from '../components/analytics/AnalyticsDateRangePicker';
import { AnalyticsGrowBar, useAnalyticsReplayKey } from '../components/analytics/analyticsChartMotion';
import { formatCount, formatInr, formatPercent } from '../components/analytics/analyticsChartTheme';
import { AnalyticsOverviewSkeleton } from '../components/analytics/analyticsSkeletonUi';
import {
  AnalyticsMetricCard,
  AnalyticsPanelCard,
  analyticsEmptyTextClass,
  formatAnalyticsDelta,
} from '../components/analytics/analyticsSectionUi';
import {
  useAnalytics,
  type AnalyticsRecentOrderRow,
  type AnalyticsSalesBreakdown,
} from '../contexts/analytics.context';
import { useSocket } from '../contexts/socket.context';
import { useStore } from '../contexts/store.context';
import { SocketEventType } from '../types/event.types';

const HINTS = {
  grossSales: {
    how: 'Sum of order subtotals in the selected date range, excluding cancelled orders.',
    interpret: 'This is product sales before shipping and tax. A rising sparkline means more merchandise revenue.',
  },
  returningCustomerRate: {
    how: 'Share of customers who ordered in this range and also had at least one earlier non-cancelled order.',
    interpret: 'Higher is healthier loyalty. 0% usually means first-time buyers only in this period.',
  },
  ordersFulfilled: {
    how: 'Count of non-cancelled orders whose status is shipped or delivered.',
    interpret: 'Compare with Orders. A big gap means many orders are still waiting to be fulfilled.',
  },
  orders: {
    how: 'Count of all non-cancelled orders created in the selected date range.',
    interpret: 'Use this as order volume. Pair it with gross sales to see if AOV is going up or down.',
  },
  repeatPurchaseRate: {
    how: 'Of customers who ordered in this range, the share whose lifetime order count is 2 or more.',
    interpret: 'Shows repeat buying, not just this period. A low rate means most buyers are still one-time.',
  },
  unpaidOrders: {
    how: 'Non-cancelled orders in this range with payment status unpaid, plus their total amount.',
    interpret: 'These still need collection (COD, UPI, bank transfer). High unpaid amount is cash-flow risk.',
  },
  unfulfilledOrders: {
    how: 'Non-cancelled orders still in pending or paid status (not shipped or delivered).',
    interpret: 'Work queue for fulfillment. Growing unfulfilled usually means ops is behind demand.',
  },
  aov: {
    how: 'Gross sales divided by order count in the selected range.',
    interpret: 'Higher AOV means bigger baskets. Full AOV over time is on Customer analytics.',
  },
  totalSales: {
    how: 'Sum of order totals for non-refunded, non-cancelled orders (net + shipping + tax).',
    interpret: 'What customers actually paid. Best single number for “how much came in”.',
  },
  taxCollected: {
    how: 'Sum of tax on non-refunded, non-cancelled orders in this range.',
    interpret: 'Collected tax, not profit. Still part of Total sales.',
  },
  shippingRevenue: {
    how: 'Sum of shipping cost on non-refunded, non-cancelled orders.',
    interpret: 'Delivery income. Compare with fulfillment cost outside analytics.',
  },
  liveVisitors: {
    how: 'Live storefront visitors right now from in-memory sessions. Resets if the server restarts.',
    interpret: 'Realtime snapshot only. Open Live View for globe and full device/location detail.',
  },
  liveCarts: {
    how: 'Live sessions currently in the cart stage.',
    interpret: 'Intent right now. Rising carts without checkout may mean friction.',
  },
  liveCheckout: {
    how: 'Live sessions currently on checkout.',
    interpret: 'People about to pay. Compare with live orders to see conversion.',
  },
  liveOrders: {
    how: 'Orders placed since this server process started. In-memory only.',
    interpret: 'Realtime commerce since boot, not the date range above.',
  },
  inventoryRiskGlimpse: {
    how: 'Variants whose available inventory is 0 (sold out) or 5 or fewer (low stock).',
    interpret: 'Act on sold-out first. Full SKU tables are on Inventory analytics.',
  },
  salesOverTime: {
    how: 'Gross sales (order subtotals) grouped by hour, day, or month depending on the date range.',
    interpret: 'Look for peaks, flat days, and compare against the dashed comparison period.',
  },
  salesBreakdown: {
    how: 'Gross sales minus refunded subtotals, then shipping and tax added. Cancelled orders are excluded.',
    interpret: 'Use this to see what makes up Total sales. Discounts and return fees stay ₹0 until those amounts are stored on orders.',
  },
  grossSalesRow: {
    how: 'Sum of order subtotals, including refunded orders, excluding cancelled.',
    interpret: 'Starting point of the breakdown before returns and extras.',
  },
  discountsRow: {
    how: 'Discount rupee amounts are not stored on orders yet, so this is currently always ₹0.',
    interpret: 'When checkout starts saving discount totals, this row will show money given off.',
  },
  salesReversalsRow: {
    how: 'Subtotals of orders marked refunded in this date range.',
    interpret: 'Money taken back after sale. Rising reversals can mean quality or return issues.',
  },
  netSalesRow: {
    how: 'Gross sales minus discounts minus sales reversals.',
    interpret: 'Core merchandise revenue after refunds. This is the cleanest sales figure.',
  },
  shippingChargesRow: {
    how: 'Sum of shipping cost on non-refunded, non-cancelled orders.',
    interpret: 'Delivery income. Compare with fulfillment cost outside analytics.',
  },
  returnFeesRow: {
    how: 'Return fees are not recorded on orders yet, so this is currently always ₹0.',
    interpret: 'Will show restocking or return charges once those fees are captured.',
  },
  taxesRow: {
    how: 'Sum of tax on non-refunded, non-cancelled orders.',
    interpret: 'Collected tax, not profit. It still contributes to Total sales.',
  },
  totalSalesRow: {
    how: 'Sum of order totals for non-refunded, non-cancelled orders (net + shipping + tax).',
    interpret: 'What customers actually paid. Best single number for “how much came in”.',
  },
  salesByPaymentMethod: {
    how: 'Gross sales grouped by the payment method saved on each order (COD, UPI, bank transfer, etc.).',
    interpret: 'Tells you how customers prefer to pay. Unspecified means the method was not set.',
  },
  recentOrders: {
    how: 'The latest 8 non-cancelled orders in the selected range, with unpaid and unfulfilled totals above.',
    interpret: 'Quick ops feed. Check unpaid for collection and unfulfilled for shipping work.',
  },
  marginRate: {
    how: 'Line sales minus estimated COGS (sold qty × current cost), then ÷ line sales.',
    interpret: 'Estimated margin using today’s cost, not cost at sale. Missing costs make COGS look too low.',
  },
  digitalRate: {
    how: 'Digital line sales ÷ all line sales. Digital = isPhysicalProduct = false.',
    interpret: 'How much revenue is non-shippable. High digital share usually means lower fulfillment load.',
  },
  catalogActive: {
    how: 'Current products with status active and not deleted. Snapshot now.',
    interpret: 'Live catalog size. Pair with draft count on Products analytics.',
  },
  markdownRate: {
    how: 'Variants whose current compare-at is higher than current price, ÷ all in-catalog variants.',
    interpret: 'Weak markdown signal — compare-at is today’s value, not the price at checkout.',
  },
  salesByProduct: {
    how: 'Line-item totals from non-cancelled orders, rolled up to the product.',
    interpret: 'Ranked by revenue. Full SKU velocity is on Products analytics.',
  },
  sellThrough: {
    how: 'Units sold in this range ÷ (units sold + current on-hand) for each product.',
    interpret: 'Closer to 100% means stock is moving. Very high with low on-hand is restock risk.',
  },
  onHand: {
    how: 'Sum of InventoryLevel.onHand across tracked variants. Snapshot now.',
    interpret: 'Physical units on the shelf. Does not drop when an order is placed.',
  },
  available: {
    how: 'Sum of InventoryLevel.available. Snapshot now.',
    interpret: 'What can still sell. If this is 0 while on-hand is not, stock is reserved or unavailable.',
  },
  committed: {
    how: 'Sum of InventoryLevel.committed. Snapshot now.',
    interpret: 'Open orders still holding stock.',
  },
  inventoryValue: {
    how: 'On-hand × current variant/product cost. Snapshot now.',
    interpret: 'Inventory at cost today. SKUs missing cost are undercounted.',
  },
  daysOfCover: {
    how: 'Storewide on-hand ÷ (units sold in the selected range ÷ days).',
    interpret: 'How many days current stock lasts at this period’s sell rate. No sales → —.',
  },
  incoming: {
    how: 'Sum of InventoryLevel.incoming (POs + inbound transfers). Snapshot now.',
    interpret: 'Pipeline arriving. Useful when available is low.',
  },
  newCustomers: {
    how: 'Customers whose account was created in the selected date range.',
    interpret: 'New signups, whether or not they bought.',
  },
  buyers: {
    how: 'Unique customers with at least one non-cancelled order in the selected date range.',
    interpret: 'Buyer volume this period. Compare with new customers to see conversion.',
  },
  emailOptIn: {
    how: 'Share of all store customers with agreedToMarketingEmails = true.',
    interpret: 'List permission health.',
  },
  smsOptIn: {
    how: 'Share of all store customers with agreedToSmsMarketing = true.',
    interpret: 'SMS reach. Often lower than email.',
  },
  purchasedVsNeverBought: {
    how: 'Of signups in this range, how many have at least one non-cancelled order vs none.',
    interpret: 'A large never-bought share means acquisition is not converting.',
  },
  aovOverTime: {
    how: 'Gross sales divided by order count in each time bucket.',
    interpret: 'Watch if volume rises while AOV falls.',
  },
  salesByLocation: {
    how: 'Gross sales grouped by shipping country and state.',
    interpret: 'Where orders are shipping. Useful for inventory and shipping coverage.',
  },
  topCustomers: {
    how: 'Customers ranked by sum of order totals in the selected range.',
    interpret: 'Highest spenders this period.',
  },
  newsletterSignups: {
    how: 'Newsletter records whose subscribedAt falls in the selected date range.',
    interpret: 'New list joins this period.',
  },
  unsubRate: {
    how: 'Unsubscribes ÷ (signups + unsubscribes) in this range.',
    interpret: 'High rate with few signups means the list is shrinking.',
  },
  netList: {
    how: 'Signups minus unsubscribes in the selected date range. Can be negative.',
    interpret: 'Net list change this period.',
  },
  listSize: {
    how: 'Current subscribed newsletter records storewide.',
    interpret: 'Live reachable list.',
  },
  contactVolume: {
    how: 'Contact form submissions created in the selected date range.',
    interpret: 'Inbound interest / support load.',
  },
  contactUnread: {
    how: 'Range submissions still pending, plus storewide unread snapshot.',
    interpret: 'Work queue. Storewide unread is the full backlog.',
  },
  blogPublished: {
    how: 'Blog posts created in this range that are currently visible.',
    interpret: 'Publishing cadence this period.',
  },
  pagesPublished: {
    how: 'Store pages created in this range that are currently visible.',
    interpret: 'Content site growth this period.',
  },
  liveSessionsByDevice: {
    how: 'Live storefront sessions grouped by device type (desktop, mobile, tablet).',
    interpret: 'How people are browsing right now. Resets if the server restarts.',
  },
  liveSessionsByLocation: {
    how: 'Live storefront sessions grouped by IP geo location.',
    interpret: 'Where visitors are right now. Open Live View for the globe.',
  },
} as const satisfies Record<string, AnalyticsHint>;

const BREAKDOWN_ROWS: Array<{
  key: keyof AnalyticsSalesBreakdown;
  label: string;
  hint: AnalyticsHint;
}> = [
  { key: 'grossSales', label: 'Gross sales', hint: HINTS.grossSalesRow },
  { key: 'discounts', label: 'Discounts', hint: HINTS.discountsRow },
  { key: 'salesReversals', label: 'Sales reversals', hint: HINTS.salesReversalsRow },
  { key: 'netSales', label: 'Net sales', hint: HINTS.netSalesRow },
  { key: 'shippingCharges', label: 'Shipping charges', hint: HINTS.shippingChargesRow },
  { key: 'returnFees', label: 'Return fees', hint: HINTS.returnFeesRow },
  { key: 'taxes', label: 'Taxes', hint: HINTS.taxesRow },
];

function statusLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatCover(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 10) return `${value.toFixed(1)} d`;
  return `${Math.round(value)} d`;
}

function OverviewSection({
  title,
  to,
  children,
}: {
  title: string;
  to?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-admin-text">{title}</h2>
        {to ? (
          <Link to={to} className="text-[12px] font-medium text-[#00a0ac] hover:underline">
            View all →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SalesBreakdownCard({
  breakdown,
  compareBreakdown,
}: {
  breakdown: AnalyticsSalesBreakdown;
  compareBreakdown?: AnalyticsSalesBreakdown | null;
}) {
  return (
    <AnalyticsPanelCard title="Total sales breakdown" hint={HINTS.salesBreakdown} className="h-full">
      <ul className="overflow-hidden rounded-lg border border-admin-divider">
        {BREAKDOWN_ROWS.map((row, index) => (
          <li
            key={row.key}
            className={`flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] ${
              index % 2 === 0 ? 'bg-admin-surface' : 'bg-admin-row-hover'
            }`}
          >
            <AnalyticsInfoLabel label={row.label} hint={row.hint} className="text-[13px] text-admin-text" />
            <span className="tabular-nums text-admin-text-secondary">
              {`${formatInr(breakdown[row.key])} ${formatAnalyticsDelta(breakdown[row.key], compareBreakdown?.[row.key])}`}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 border-t border-admin-divider bg-admin-table-header px-3 py-2.5 text-[13px] font-semibold text-admin-text">
          <AnalyticsInfoLabel
            label="Total sales"
            hint={HINTS.totalSalesRow}
            dotted={false}
            className="text-[13px] font-semibold text-admin-text"
          />
          <span className="tabular-nums">
            {`${formatInr(breakdown.totalSales)} ${formatAnalyticsDelta(breakdown.totalSales, compareBreakdown?.totalSales)}`}
          </span>
        </li>
      </ul>
    </AnalyticsPanelCard>
  );
}

function RecentOrdersTable({ orders }: { orders: AnalyticsRecentOrderRow[] }) {
  if (orders.length === 0) {
    return <p className={analyticsEmptyTextClass}>No orders in this date range</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-admin-text-secondary">
            <th className="pb-2 font-medium">Order</th>
            <th className="pb-2 font-medium">Customer</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Payment</th>
            <th className="pb-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="border-t border-admin-divider">
              <td className="py-2.5 font-medium text-admin-text">{order.displayOrderId}</td>
              <td className="py-2.5 text-admin-text">{order.customerName}</td>
              <td className="py-2.5 capitalize text-admin-text-secondary">{statusLabel(order.status)}</td>
              <td className="py-2.5 capitalize text-admin-text-secondary">
                {statusLabel(order.paymentStatus)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text">{formatInr(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EMPTY_LIVE = {
  visitors: 0,
  activeCarts: 0,
  checkingOut: 0,
  newCustomers: 0,
  returningCustomers: 0,
  orders: 0,
  totalSales: 0,
  byDevice: [] as Array<{ key: string; name: string; value: number }>,
  byLocation: [] as Array<{ name: string; value: number; path: string }>,
};

const AnalyticsPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const { socket, isConnected } = useSocket();
  const {
    summary,
    compareSummary,
    salesOverTime,
    compareSalesOverTime,
    aovOverTime,
    compareAovOverTime,
    salesByProduct,
    insights,
    compareInsights,
    customerInsights,
    compareCustomerInsights,
    contentInsights,
    compareContentInsights,
    productInsights,
    compareProductInsights,
    inventoryInsights,
    compareInventoryInsights,
    range,
    compareRange,
    error,
    setRange,
    setCompare,
    fetchSummary,
    fetchCustomerInsights,
    fetchContentInsights,
    fetchProductInsights,
    fetchInventoryInsights,
  } = useAnalytics();

  const [live, setLive] = useState(EMPTY_LIVE);
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
      fetchSummary(activeStoreId, range).catch(() => {}),
      fetchCustomerInsights(activeStoreId, range).catch(() => {}),
      fetchContentInsights(activeStoreId, range).catch(() => {}),
      fetchProductInsights(activeStoreId, range).catch(() => {}),
      fetchInventoryInsights(activeStoreId, range).catch(() => {}),
    ]).finally(() => {
      setHasLoaded(true);
    });
  }, [
    activeStoreId,
    range,
    compareRange,
    fetchSummary,
    fetchCustomerInsights,
    fetchContentInsights,
    fetchProductInsights,
    fetchInventoryInsights,
  ]);

  useEffect(() => {
    if (!socket || !activeStoreId) return;

    const onSessions = (payload: {
      storeId?: string;
      total?: number;
      activeCarts?: number;
      checkingOut?: number;
      newCustomers?: number;
      returningCustomers?: number;
      byDevice?: Array<{ key: string; name: string; value: number }>;
      byLocation?: Array<{ name: string; value: number; path: string }>;
    }) => {
      if (payload?.storeId && payload.storeId !== activeStoreId) return;
      setLive((prev) => ({
        ...prev,
        visitors: payload.total ?? 0,
        activeCarts: payload.activeCarts ?? 0,
        checkingOut: payload.checkingOut ?? 0,
        newCustomers: payload.newCustomers ?? 0,
        returningCustomers: payload.returningCustomers ?? 0,
        byDevice: Array.isArray(payload.byDevice) ? payload.byDevice : [],
        byLocation: Array.isArray(payload.byLocation) ? payload.byLocation : [],
      }));
    };

    const onCommerce = (payload: {
      storeId?: string;
      orders?: number;
      totalSales?: number;
    }) => {
      if (payload?.storeId && payload.storeId !== activeStoreId) return;
      setLive((prev) => ({
        ...prev,
        orders: payload.orders ?? 0,
        totalSales: payload.totalSales ?? 0,
      }));
    };

    socket.on(SocketEventType.StoreSessionsUpdate, onSessions);
    socket.on(SocketEventType.StoreLiveCommerceUpdate, onCommerce);
    socket.emit(SocketEventType.AnalyticsSubscribe, { storeId: activeStoreId });

    return () => {
      socket.emit(SocketEventType.AnalyticsUnsubscribe, { storeId: activeStoreId });
      socket.off(SocketEventType.StoreSessionsUpdate, onSessions);
      socket.off(SocketEventType.StoreLiveCommerceUpdate, onCommerce);
    };
  }, [socket, isConnected, activeStoreId]);

  const primaryLegend = useMemo(() => {
    if (!range) return 'Selected range';
    if (range.from.getTime() === range.to.getTime()) {
      return range.from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return `${range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [range]);

  const compareLegend = useMemo(() => {
    if (!compareRange) return null;
    if (compareRange.from.getTime() === compareRange.to.getTime()) {
      return compareRange.from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return `${compareRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${compareRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [compareRange]);

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

  const sellThroughRows = insights.sellThrough.slice(0, 5);
  const sellThroughMax = Math.max(...sellThroughRows.map((row) => row.rate), 0);
  const sellThroughReplayKey = useAnalyticsReplayKey(sellThroughRows);
  const topCustomers = insights.topCustomers.slice(0, 5);
  const inventoryRisk = insights.inventoryRisk.slice(0, 8);
  const locationMax = Math.max(...live.byLocation.map((row) => row.value), 0);
  const soldOutCount = insights.inventoryRisk.filter((row) => row.status === 'sold_out').length;
  const lowStockCount = insights.inventoryRisk.length - soldOutCount;

  const margin = productInsights.margin;
  const digital = productInsights.digitalMix;
  const catalog = productInsights.catalog;
  const markdown = productInsights.markdown;
  const inv = inventoryInsights.totals;
  const newsletter = contentInsights.newsletter;
  const contact = contentInsights.contactForm;
  const posts = contentInsights.blogPosts;
  const pages = contentInsights.pages;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1400px] pb-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              Analytics overview
            </h1>
          </div>
          <p className="mb-3 text-[13px] text-admin-text-secondary">
            Snapshot of sales, products, inventory, customers, content, and live traffic. Open any
            section for the full breakdown.
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
          <AnalyticsOverviewSkeleton />
        ) : (
          <>
            <OverviewSection title="Sales">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Gross sales"
                  hint={HINTS.grossSales}
                  value={formatInr(summary.grossSales)}
                  delta={formatAnalyticsDelta(summary.grossSales, compareSummary?.grossSales)}
                  sparkline={insights.sparkline.grossSales}
                />
                <AnalyticsMetricCard
                  title="Orders"
                  hint={HINTS.orders}
                  value={formatCount(summary.orders)}
                  delta={formatAnalyticsDelta(summary.orders, compareSummary?.orders)}
                  sparkline={insights.sparkline.orders}
                />
                <AnalyticsMetricCard
                  title="Orders fulfilled"
                  hint={HINTS.ordersFulfilled}
                  value={formatCount(summary.ordersFulfilled)}
                  delta={formatAnalyticsDelta(summary.ordersFulfilled, compareSummary?.ordersFulfilled)}
                  sparkline={insights.sparkline.ordersFulfilled}
                />
                <AnalyticsMetricCard
                  title="AOV"
                  hint={HINTS.aov}
                  value={formatInr(aovOverTime.averageOrderValue)}
                  delta={formatAnalyticsDelta(
                    aovOverTime.averageOrderValue,
                    compareAovOverTime?.averageOrderValue,
                  )}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Total sales"
                  hint={HINTS.totalSales}
                  value={formatInr(insights.salesBreakdown.totalSales)}
                  delta={formatAnalyticsDelta(
                    insights.salesBreakdown.totalSales,
                    compareInsights?.salesBreakdown.totalSales,
                  )}
                />
                <AnalyticsMetricCard
                  title="Tax collected"
                  hint={HINTS.taxCollected}
                  value={formatInr(insights.salesBreakdown.taxes)}
                  delta={formatAnalyticsDelta(
                    insights.salesBreakdown.taxes,
                    compareInsights?.salesBreakdown.taxes,
                  )}
                />
                <AnalyticsMetricCard
                  title="Shipping revenue"
                  hint={HINTS.shippingRevenue}
                  value={formatInr(insights.salesBreakdown.shippingCharges)}
                  delta={formatAnalyticsDelta(
                    insights.salesBreakdown.shippingCharges,
                    compareInsights?.salesBreakdown.shippingCharges,
                  )}
                />
                <AnalyticsMetricCard
                  title="Unpaid orders"
                  hint={HINTS.unpaidOrders}
                  value={formatCount(insights.orderHealth.unpaid)}
                  delta={formatInr(insights.orderHealth.unpaidAmount)}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AnalyticsMetricCard
                  title="Unfulfilled orders"
                  hint={HINTS.unfulfilledOrders}
                  value={formatCount(insights.orderHealth.unfulfilled)}
                  delta={formatInr(insights.orderHealth.unfulfilledAmount)}
                />
                <AnalyticsMetricCard
                  title="Net sales"
                  hint={HINTS.netSalesRow}
                  value={formatInr(insights.salesBreakdown.netSales)}
                  delta={formatAnalyticsDelta(
                    insights.salesBreakdown.netSales,
                    compareInsights?.salesBreakdown.netSales,
                  )}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
                <AnalyticsPanelCard
                  title="Total sales over time"
                  hint={HINTS.salesOverTime}
                  className="min-h-[320px] xl:col-span-2"
                >
                  <div className="flex items-baseline gap-2">
                    <p className="text-[22px] font-semibold tracking-tight text-admin-text">
                      {formatInr(salesOverTime.totalGrossSales)}
                    </p>
                    <span className="text-[13px] text-admin-text-subdued">
                      {formatAnalyticsDelta(
                        salesOverTime.totalGrossSales,
                        compareSalesOverTime?.totalGrossSales,
                      )}
                    </span>
                  </div>
                  <AnalyticsOverTimeLineChart
                    points={salesOverTime.points}
                    comparePoints={compareSalesOverTime?.points ?? null}
                    primaryLabel={primaryLegend}
                    compareLabel={compareLegend}
                    valueLabel="Gross sales"
                    loading={false}
                    height={240}
                  />
                </AnalyticsPanelCard>
                <SalesBreakdownCard
                  breakdown={insights.salesBreakdown}
                  compareBreakdown={compareInsights?.salesBreakdown}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AnalyticsPanelCard title="Total sales by payment method" hint={HINTS.salesByPaymentMethod}>
                  <AnalyticsPaymentMethodChart rows={insights.salesByPaymentMethod} loading={false} />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Recent orders" hint={HINTS.recentOrders} className="lg:col-span-2">
                  <div className="mb-3 flex flex-wrap gap-4 text-[13px] text-admin-text-secondary">
                    <span>
                      Unpaid{' '}
                      <strong className="font-semibold text-admin-text">
                        {`${formatCount(insights.orderHealth.unpaid)} · ${formatInr(insights.orderHealth.unpaidAmount)}`}
                      </strong>
                    </span>
                    <span>
                      Unfulfilled{' '}
                      <strong className="font-semibold text-admin-text">
                        {`${formatCount(insights.orderHealth.unfulfilled)} · ${formatInr(insights.orderHealth.unfulfilledAmount)}`}
                      </strong>
                    </span>
                  </div>
                  <RecentOrdersTable orders={insights.recentOrders} />
                </AnalyticsPanelCard>
              </div>
            </OverviewSection>

            <OverviewSection title="Products" to="/analytics/products">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Est. gross margin"
                  hint={HINTS.marginRate}
                  value={formatPercent(margin.marginRate)}
                  delta={formatAnalyticsDelta(
                    margin.marginRate,
                    compareProductInsights?.margin.marginRate,
                  )}
                />
                <AnalyticsMetricCard
                  title="Digital sales mix"
                  hint={HINTS.digitalRate}
                  value={formatPercent(digital.digitalRate)}
                  delta={formatAnalyticsDelta(
                    digital.digitalRate,
                    compareProductInsights?.digitalMix.digitalRate,
                  )}
                />
                <AnalyticsMetricCard
                  title="Active catalog"
                  hint={HINTS.catalogActive}
                  value={formatCount(catalog.active)}
                  delta={`${formatCount(catalog.draft)} draft`}
                />
                <AnalyticsMetricCard
                  title="Markdown variants"
                  hint={HINTS.markdownRate}
                  value={formatPercent(markdown.catalogRate)}
                  delta={formatAnalyticsDelta(
                    markdown.catalogRate,
                    compareProductInsights?.markdown.catalogRate,
                  )}
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
                <AnalyticsPanelCard title="Total sales by product" hint={HINTS.salesByProduct}>
                  <AnalyticsSalesByProductChart
                    products={salesByProduct.products.slice(0, 8)}
                    totalSales={salesByProduct.totalSales}
                    loading={false}
                    height={220}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard
                  title="Products by sell-through"
                  hint={HINTS.sellThrough}
                  className="lg:col-span-2"
                >
                  {sellThroughRows.length === 0 ? (
                    <p className={analyticsEmptyTextClass}>No data for this date range</p>
                  ) : (
                    <ul className="space-y-2">
                      {sellThroughRows.map((row) => {
                        const widthPct =
                          sellThroughMax > 0 ? Math.max((row.rate / sellThroughMax) * 100, 8) : 0;
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
            </OverviewSection>

            <OverviewSection title="Inventory" to="/analytics/inventory">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="On hand"
                  hint={HINTS.onHand}
                  value={formatCount(inv.onHand)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Available"
                  hint={HINTS.available}
                  value={formatCount(inv.available)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Committed"
                  hint={HINTS.committed}
                  value={formatCount(inv.committed)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Inventory value"
                  hint={HINTS.inventoryValue}
                  value={formatInr(inv.value)}
                  delta="now"
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Days of cover"
                  hint={HINTS.daysOfCover}
                  value={formatCover(inv.daysOfCover)}
                  delta={formatAnalyticsDelta(
                    inv.daysOfCover,
                    compareInventoryInsights?.totals.daysOfCover,
                  )}
                />
                <AnalyticsMetricCard
                  title="Incoming"
                  hint={HINTS.incoming}
                  value={formatCount(inv.incoming)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Sold out"
                  hint={HINTS.inventoryRiskGlimpse}
                  value={formatCount(soldOutCount)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Low stock"
                  hint={HINTS.inventoryRiskGlimpse}
                  value={formatCount(lowStockCount)}
                  delta="≤ 5 available"
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <AnalyticsPanelCard title="Inventory risk" hint={HINTS.inventoryRiskGlimpse}>
                  {inventoryRisk.length === 0 ? (
                    <p className={analyticsEmptyTextClass}>No low-stock products</p>
                  ) : (
                    <ul className="space-y-2">
                      {inventoryRisk.map((row) => (
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
            </OverviewSection>

            <OverviewSection title="Customers" to="/analytics/customers">
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
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                <AnalyticsMetricCard
                  title="Signups who purchased"
                  hint={HINTS.purchasedVsNeverBought}
                  value={formatCount(customerInsights.purchasedVsNeverBought.purchased)}
                  delta={`${formatCount(customerInsights.purchasedVsNeverBought.neverBought)} never bought`}
                />
                <AnalyticsMetricCard
                  title="New vs returning buyers"
                  hint={HINTS.buyers}
                  value={formatCount(customerInsights.newVsReturningBuyers.newBuyers)}
                  delta={`${formatCount(customerInsights.newVsReturningBuyers.returningBuyers)} returning`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AnalyticsPanelCard
                  title="Average order value over time"
                  hint={HINTS.aovOverTime}
                  className="min-h-[280px] lg:col-span-2"
                >
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
                  {topCustomers.length === 0 ? (
                    <p className={analyticsEmptyTextClass}>No customers in this date range</p>
                  ) : (
                    <ul className="space-y-2">
                      {topCustomers.map((row) => (
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
            </OverviewSection>

            <OverviewSection title="Content / CRM" to="/analytics/content">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Newsletter signups"
                  hint={HINTS.newsletterSignups}
                  value={formatCount(newsletter.signups)}
                  delta={formatAnalyticsDelta(
                    newsletter.signups,
                    compareContentInsights?.newsletter.signups,
                  )}
                />
                <AnalyticsMetricCard
                  title="Unsub rate"
                  hint={HINTS.unsubRate}
                  value={formatPercent(newsletter.unsubRate)}
                  delta={formatAnalyticsDelta(
                    newsletter.unsubRate,
                    compareContentInsights?.newsletter.unsubRate,
                  )}
                />
                <AnalyticsMetricCard
                  title="Net list"
                  hint={HINTS.netList}
                  value={formatCount(newsletter.netList)}
                  delta={formatAnalyticsDelta(
                    newsletter.netList,
                    compareContentInsights?.newsletter.netList,
                  )}
                />
                <AnalyticsMetricCard
                  title="List size"
                  hint={HINTS.listSize}
                  value={formatCount(newsletter.storeSubscribed)}
                  delta={`${formatCount(newsletter.storeUnsubscribed)} unsubscribed`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Contact form volume"
                  hint={HINTS.contactVolume}
                  value={formatCount(contact.volume)}
                  delta={formatAnalyticsDelta(
                    contact.volume,
                    compareContentInsights?.contactForm.volume,
                  )}
                />
                <AnalyticsMetricCard
                  title="Unread contacts"
                  hint={HINTS.contactUnread}
                  value={formatCount(contact.unread)}
                  delta={`${formatCount(contact.storeUnread)} storewide`}
                />
                <AnalyticsMetricCard
                  title="Blog posts published"
                  hint={HINTS.blogPublished}
                  value={formatCount(posts.published)}
                  delta={formatAnalyticsDelta(
                    posts.published,
                    compareContentInsights?.blogPosts.published,
                  )}
                />
                <AnalyticsMetricCard
                  title="Pages published"
                  hint={HINTS.pagesPublished}
                  value={formatCount(pages.published)}
                  delta={formatAnalyticsDelta(
                    pages.published,
                    compareContentInsights?.pages.published,
                  )}
                />
              </div>
            </OverviewSection>

            <OverviewSection title="Live View" to="/analytics/live-view">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Visitors right now"
                  hint={HINTS.liveVisitors}
                  value={formatCount(live.visitors)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Active carts"
                  hint={HINTS.liveCarts}
                  value={formatCount(live.activeCarts)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Checking out"
                  hint={HINTS.liveCheckout}
                  value={formatCount(live.checkingOut)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="Live sales"
                  hint={HINTS.liveOrders}
                  value={formatInr(live.totalSales)}
                  delta={`${formatCount(live.orders)} orders`}
                />
              </div>
              <p className="mt-2 text-[12px] text-admin-text-subdued">
                Live numbers reset if the server restarts. Date range above does not apply here.
                {live.newCustomers + live.returningCustomers > 0
                  ? ` · ${formatCount(live.newCustomers)} new · ${formatCount(live.returningCustomers)} returning`
                  : ''}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <AnalyticsPanelCard title="Sessions by device" hint={HINTS.liveSessionsByDevice}>
                  <AnalyticsSessionsByDeviceChart
                    slices={live.byDevice}
                    total={live.visitors}
                    loading={!isConnected}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Sessions by location" hint={HINTS.liveSessionsByLocation}>
                  {live.byLocation.length === 0 ? (
                    <p className={analyticsEmptyTextClass}>
                      {isConnected ? 'No live sessions' : 'Connecting…'}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {live.byLocation.slice(0, 6).map((row) => {
                        const widthPct =
                          locationMax > 0 ? Math.max((row.value / locationMax) * 100, 8) : 0;
                        return (
                          <li key={row.path || row.name}>
                            <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                              <span className="truncate text-admin-text">{row.name}</span>
                              <span className="tabular-nums text-admin-text-secondary">
                                {formatCount(row.value)}
                              </span>
                            </div>
                            <div className="h-6 overflow-hidden rounded-sm bg-admin-row-hover">
                              <div
                                className="h-full rounded-sm bg-[#00a0ac]"
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </AnalyticsPanelCard>
              </div>
            </OverviewSection>
          </>
        )}

        <footer className="mt-8 border-t border-admin-border pt-5 text-center">
          <p className="text-[13px] text-admin-text-secondary">
            Learn more about{' '}
            <a href="#" className={`${adminListFooterLinkClass} underline underline-offset-2`}>
              analytics
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
