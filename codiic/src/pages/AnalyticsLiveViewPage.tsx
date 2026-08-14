import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminListCardClass } from '../components/admin-list-ui';
import { AnalyticsSessionsByDeviceChart } from '../components/analytics/AnalyticsSessionsByDeviceChart';
import {
  LiveViewGlobe,
  type LiveViewGlobeHandle,
} from '../components/analytics/LiveViewGlobe';
import { formatCount, formatInr } from '../components/analytics/analyticsChartTheme';
import { useSocket } from '../contexts/socket.context';
import { useStore } from '../contexts/store.context';
import { SocketEventType } from '../types/event.types';

const metricLabelClass = 'text-[13px] font-medium text-admin-text';

const titleDottedClass =
  'inline-block border-b border-dotted border-admin-text-subdued pb-px text-[13px] font-semibold text-admin-text';

type LiveSessionsPayload = {
  storeId?: string;
  total?: number;
  activeCarts?: number;
  checkingOut?: number;
  newCustomers?: number;
  returningCustomers?: number;
  byDevice?: Array<{ key: string; name: string; value: number }>;
  byLocation?: Array<{ name: string; value: number; path: string }>;
  locationBreadcrumb?: string | null;
};

type LiveCommercePayload = {
  storeId?: string;
  orders?: number;
  totalSales?: number;
  byProduct?: Array<{
    productId: string;
    title: string;
    sales: number;
    units: number;
  }>;
};

function MetricSparkline({
  variant = 'line',
}: {
  variant?: 'line' | 'bars' | 'flat';
}) {
  if (variant === 'bars') {
    return (
      <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full text-[#00a0ac]" aria-hidden>
        {[8, 14, 10, 18, 12, 16, 9, 20, 11, 15].map((h, i) => (
          <rect
            key={i}
            x={4 + i * 11.5}
            y={26 - h}
            width="6"
            height={h}
            rx="1"
            fill="currentColor"
            opacity={0.85}
          />
        ))}
      </svg>
    );
  }

  if (variant === 'flat') {
    return (
      <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full text-[#00a0ac]" aria-hidden>
        <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full text-[#00a0ac]" aria-hidden>
      <path
        d="M0 22 L48 22 L56 6 L68 22 L120 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniMetricCard({
  title,
  value,
  sparkline,
}: {
  title: string;
  value: string;
  sparkline?: 'line' | 'bars' | 'flat' | 'none';
}) {
  return (
    <div className={`${adminListCardClass} p-4`}>
      <p className={metricLabelClass}>{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-[22px] font-semibold tracking-tight text-admin-text">{value}</p>
      </div>
      {sparkline && sparkline !== 'none' ? <MetricSparkline variant={sparkline} /> : null}
    </div>
  );
}

function PanelCard({
  title,
  children,
  className = '',
  dottedTitle = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  dottedTitle?: boolean;
}) {
  return (
    <section className={`${adminListCardClass} flex flex-col p-4 ${className}`.trim()}>
      <h2 className={`mb-3 ${dottedTitle ? titleDottedClass : 'text-[13px] font-semibold text-admin-text'}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const AnalyticsLiveViewPage: React.FC = () => {
  const globeRef = useRef<LiveViewGlobeHandle>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const { activeStoreId } = useStore();
  const { socket, isConnected } = useSocket();

  const [visitorsNow, setVisitorsNow] = useState(0);
  const [activeCarts, setActiveCarts] = useState(0);
  const [checkingOut, setCheckingOut] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [returningCustomers, setReturningCustomers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [salesByProduct, setSalesByProduct] = useState<
    Array<{ productId: string; title: string; sales: number; units: number }>
  >([]);
  const [locationBreadcrumb, setLocationBreadcrumb] = useState<string | null>(null);
  const [locationRows, setLocationRows] = useState<
    Array<{ name: string; value: number; path: string }>
  >([]);
  const [deviceSlices, setDeviceSlices] = useState<
    Array<{ key: string; name: string; value: number }>
  >([]);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');

  const toggleFullscreen = useCallback(async () => {
    const el = pageRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const request =
        el.requestFullscreen?.bind(el) ||
        (el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
          .webkitRequestFullscreen?.bind(el);
      if (request) await request();
    } catch {
      // Browser may reject without a user gesture or if permission is denied.
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!socket || !activeStoreId) {
      setLiveStatus(socket ? 'connecting' : 'offline');
      return;
    }

    setLiveStatus(isConnected ? 'live' : 'connecting');

    const onSessions = (payload: LiveSessionsPayload) => {
      if (payload?.storeId && payload.storeId !== activeStoreId) return;
      setVisitorsNow(payload.total ?? 0);
      setActiveCarts(payload.activeCarts ?? 0);
      setCheckingOut(payload.checkingOut ?? 0);
      setNewCustomers(payload.newCustomers ?? 0);
      setReturningCustomers(payload.returningCustomers ?? 0);
      setLocationRows(Array.isArray(payload.byLocation) ? payload.byLocation : []);
      setDeviceSlices(Array.isArray(payload.byDevice) ? payload.byDevice : []);
      setLocationBreadcrumb(payload.locationBreadcrumb ?? null);
    };

    const onCommerce = (payload: LiveCommercePayload) => {
      if (payload?.storeId && payload.storeId !== activeStoreId) return;
      setOrders(payload.orders ?? 0);
      setTotalSales(payload.totalSales ?? 0);
      setSalesByProduct(Array.isArray(payload.byProduct) ? payload.byProduct : []);
    };

    const onConnect = () => {
      setLiveStatus('live');
      socket.emit(SocketEventType.AnalyticsSubscribe, { storeId: activeStoreId });
    };

    const onDisconnect = () => setLiveStatus('offline');

    socket.on(SocketEventType.StoreSessionsUpdate, onSessions);
    socket.on(SocketEventType.StoreLiveCommerceUpdate, onCommerce);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      socket.emit(SocketEventType.AnalyticsSubscribe, { storeId: activeStoreId });
    }

    return () => {
      socket.emit(SocketEventType.AnalyticsUnsubscribe, { storeId: activeStoreId });
      socket.off(SocketEventType.StoreSessionsUpdate, onSessions);
      socket.off(SocketEventType.StoreLiveCommerceUpdate, onCommerce);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket, isConnected, activeStoreId]);

  const topLocation = locationRows[0] ?? null;
  const locationMax = useMemo(
    () => locationRows.reduce((max, row) => Math.max(max, row.value), 0),
    [locationRows],
  );
  const newReturningTotal = Math.max(newCustomers + returningCustomers, visitorsNow, 0);
  const newCustomerArc = useMemo(() => {
    const circumference = 88;
    if (newReturningTotal <= 0) return 0;
    return (newCustomers / newReturningTotal) * circumference;
  }, [newCustomers, newReturningTotal]);
  const productSalesMax = useMemo(
    () => salesByProduct.reduce((max, row) => Math.max(max, row.sales), 0),
    [salesByProduct],
  );

  const statusLabel =
    liveStatus === 'live' ? 'Just now' : liveStatus === 'connecting' ? 'Connecting…' : 'Offline';

  return (
    <div
      ref={pageRef}
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-page-background-color"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Live View</h1>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[13px] text-admin-text-secondary">
            <span className="relative flex h-2 w-2">
              {liveStatus === 'live' ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00a0ac] opacity-60" />
              ) : null}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  liveStatus === 'live'
                    ? 'bg-[#00a0ac]'
                    : liveStatus === 'connecting'
                      ? 'bg-amber-500'
                      : 'bg-admin-text-subdued'
                }`}
              />
            </span>
            {statusLabel}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border bg-admin-surface transition-colors hover:bg-admin-row-hover ${
              leftPanelVisible ? 'text-admin-text-secondary' : 'text-[#00a0ac]'
            }`}
            aria-label={leftPanelVisible ? 'Hide metrics panel' : 'Show metrics panel'}
            aria-pressed={leftPanelVisible}
            onClick={() => setLeftPanelVisible((v) => !v)}
          >
            {leftPanelVisible ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeSlashIcon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border bg-admin-surface transition-colors hover:bg-admin-row-hover ${
              isFullscreen ? 'text-[#00a0ac]' : 'text-admin-text-secondary'
            }`}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-4 w-4" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-admin-secondary">
        <motion.div
          className="relative min-h-0 shrink-0 overflow-hidden"
          initial={false}
          animate={{
            width: leftPanelVisible ? '45%' : '0%',
          }}
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.aside
            className="h-full min-h-0 w-full overflow-y-auto bg-transparent p-3 [scrollbar-width:none] sm:p-4 [&::-webkit-scrollbar]:hidden"
            initial={false}
            animate={{
              x: leftPanelVisible ? '0%' : '-100%',
            }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            style={{ pointerEvents: leftPanelVisible ? 'auto' : 'none' }}
            aria-hidden={!leftPanelVisible}
          >
          <div className="grid grid-cols-2 gap-3">
            <MiniMetricCard
              title="Visitors right now"
              value={formatCount(visitorsNow)}
              sparkline="none"
            />
            <MiniMetricCard
              title="Total sales"
              value={formatInr(totalSales)}
              sparkline="bars"
            />
            <MiniMetricCard
              title="Sessions"
              value={formatCount(visitorsNow)}
              sparkline="line"
            />
            <MiniMetricCard title="Orders" value={formatCount(orders)} sparkline="flat" />
          </div>

          <PanelCard title="Customer behavior" className="mt-3">
            <div className="grid grid-cols-3 divide-x divide-admin-divider">
              {[
                { label: 'Active carts', value: formatCount(activeCarts) },
                { label: 'Checking out', value: formatCount(checkingOut) },
                { label: 'Purchased', value: formatCount(orders) },
              ].map((row) => (
                <div key={row.label} className="px-3 first:pl-0 last:pr-0">
                  <p className="text-[12px] text-admin-text-secondary">{row.label}</p>
                  <p className="mt-1 text-[20px] font-semibold tracking-tight text-admin-text">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard title="Sessions by device" dottedTitle className="mt-3">
            <AnalyticsSessionsByDeviceChart
              slices={deviceSlices}
              total={visitorsNow}
              loading={liveStatus === 'connecting'}
            />
          </PanelCard>

          <PanelCard title="Sessions by location" dottedTitle className="mt-3">
            {topLocation ? (
              <>
                <p className="mb-3 text-[12px] text-admin-text-subdued">
                  {locationBreadcrumb || topLocation.path || topLocation.name}
                </p>
                <ul className="space-y-2">
                  {locationRows.slice(0, 5).map((row) => {
                    const widthPct =
                      locationMax > 0 ? Math.max((row.value / locationMax) * 100, 8) : 0;
                    return (
                      <li key={row.path || row.name} className="relative">
                        <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                          <span className="truncate text-admin-text">{row.name}</span>
                          <span className="tabular-nums text-admin-text-secondary">
                            {formatCount(row.value)}
                          </span>
                        </div>
                        <div className="h-7 overflow-hidden rounded-sm bg-admin-row-hover">
                          <div
                            className="h-full rounded-sm bg-[#00a0ac]"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="flex min-h-16 items-center justify-center text-[13px] text-admin-text-secondary">
                {liveStatus === 'connecting' ? 'Connecting…' : 'No live sessions'}
              </div>
            )}
          </PanelCard>

          <PanelCard title="New vs returning customers" dottedTitle className="mt-3">
            <div className="flex items-center gap-4">
              <div className="relative h-22 w-22 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e3e3e3" strokeWidth="4" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#00a0ac"
                    strokeWidth="4"
                    strokeDasharray={`${newCustomerArc} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[16px] font-semibold text-admin-text">
                    {formatCount(newReturningTotal)}
                  </span>
                  <span className="mt-0.5 h-px w-3 bg-admin-text-subdued/60" />
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2 text-[13px]">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#00a0ac]" />
                  <span className="truncate text-admin-text">New</span>
                  <span className="ml-auto tabular-nums text-admin-text-secondary">
                    {formatCount(newCustomers)}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-xs bg-admin-fill" />
                  <span className="truncate text-admin-text">Returning</span>
                  <span className="ml-auto tabular-nums text-admin-text-secondary">
                    {formatCount(returningCustomers)}
                  </span>
                </li>
              </ul>
            </div>
          </PanelCard>

          <PanelCard title="Total sales by product" dottedTitle className="mt-3 mb-1">
            {salesByProduct.length > 0 ? (
              <ul className="space-y-2">
                {salesByProduct.slice(0, 5).map((row) => {
                  const widthPct =
                    productSalesMax > 0 ? Math.max((row.sales / productSalesMax) * 100, 8) : 0;
                  return (
                    <li key={row.productId} className="relative">
                      <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                        <span className="truncate text-admin-text" title={row.title}>
                          {row.title}
                        </span>
                        <span className="shrink-0 tabular-nums text-admin-text-secondary">
                          {formatInr(row.sales)}
                        </span>
                      </div>
                      <div className="h-7 overflow-hidden rounded-sm bg-admin-row-hover">
                        <div
                          className="h-full rounded-sm bg-[#00a0ac]"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex min-h-16 items-center justify-center text-[13px] text-admin-text-secondary">
                {liveStatus === 'connecting' ? 'Connecting…' : 'No live product sales yet'}
              </div>
            )}
          </PanelCard>
          </motion.aside>
        </motion.div>

        <section className="relative min-h-105 min-w-0 flex-1 overflow-hidden bg-admin-secondary lg:min-h-0">
          <LiveViewGlobe ref={globeRef} />

          <div className="absolute bottom-5 left-5 rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5 shadow-sm">
            <ul className="space-y-1.5 text-[12px] text-admin-text">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#8a3ffc]" />
                Orders
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 bg-[#00a0ac]"
                  style={{
                    clipPath:
                      'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                  }}
                />
                Visitors right now
              </li>
            </ul>
          </div>

          <div className="absolute bottom-5 right-5 flex flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-sm">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              aria-label="Zoom in"
              onClick={() => globeRef.current?.zoomIn()}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <div className="h-px bg-admin-border" />
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              aria-label="Zoom out"
              onClick={() => globeRef.current?.zoomOut()}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsLiveViewPage;
