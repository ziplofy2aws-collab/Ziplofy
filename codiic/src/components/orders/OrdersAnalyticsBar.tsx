import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type AnalyticsDateRange = 'today' | 'last-7-days' | 'last-30-days';

const DATE_RANGE_OPTIONS: { value: AnalyticsDateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last-7-days', label: 'Last 7 days' },
  { value: 'last-30-days', label: 'Last 30 days' },
];

const DUMMY_METRICS = [
  { label: 'Orders', value: '0 —' },
  { label: 'Items ordered', value: '0 —' },
  { label: 'Returns', value: '₹0 —' },
  { label: 'Orders fulfilled', value: '0 —' },
  { label: 'Orders delivered', value: '0 —' },
  { label: 'Order to fulfillment time', value: null },
] as const;

function SparklinePlaceholder() {
  return (
    <svg viewBox="0 0 48 12" className="mt-1.5 h-3 w-14 text-blue-500" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,10 12,8 24,9 36,4 48,6"
      />
    </svg>
  );
}

const OrdersAnalyticsBar: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('today');
  const [menuOpen, setMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const metricsScrollRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel =
    DATE_RANGE_OPTIONS.find((option) => option.value === dateRange)?.label ?? 'Today';

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const updateScrollState = useCallback(() => {
    const el = metricsScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const scrollMetrics = useCallback((direction: 'left' | 'right') => {
    const el = metricsScrollRef.current;
    if (!el) return;
    const amount = Math.max(180, el.clientWidth * 0.6);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-stretch">
        <div className="relative shrink-0 border-r border-gray-100 px-3 py-3 sm:px-4">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            <CalendarDaysIcon className="h-4 w-4 text-gray-500" aria-hidden />
            {selectedLabel}
            <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
          </button>

          {menuOpen ? (
            <div
              ref={menuRef}
              role="listbox"
              aria-label="Date range"
              className="absolute left-3 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg sm:left-4"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={dateRange === option.value}
                  onClick={() => {
                    setDateRange(option.value);
                    closeMenu();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-50"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      dateRange === option.value
                        ? 'border-gray-900 bg-gray-900'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {dateRange === option.value ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div
          ref={metricsScrollRef}
          onScroll={updateScrollState}
          className="flex min-w-0 flex-1 items-end overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DUMMY_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="min-w-[140px] shrink-0 border-r border-gray-100 px-4 py-3 last:border-r-0 sm:min-w-[160px]"
            >
              <p className="whitespace-nowrap text-[12px] text-gray-500">{metric.label}</p>
              {metric.value ? (
                <p className="mt-0.5 text-[15px] font-semibold text-gray-900">{metric.value}</p>
              ) : (
                <div className="mt-0.5 h-[22px]" aria-hidden />
              )}
              <SparklinePlaceholder />
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-l border-gray-100 px-2 py-3">
          <button
            type="button"
            onClick={() => scrollMetrics('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll metrics left"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollMetrics('right')}
            disabled={!canScrollRight}
            aria-label="Scroll metrics right"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersAnalyticsBar;
