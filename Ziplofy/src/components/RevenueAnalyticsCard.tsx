import { ChevronDownIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';

interface RevenueAnalyticsCardProps {
  timeframe?: string;
  data?: { day: string; value: number }[];
}

const chartCard =
  'rounded-2xl border border-slate-200/90 bg-white p-6 min-h-[320px] shadow-dashboard-card transition-shadow duration-200 hover:shadow-dashboard-card-hover';

const RevenueAnalyticsCard: React.FC<RevenueAnalyticsCardProps> = ({
  timeframe = 'This Week',
  data = [
    { day: 'Fri', value: 17 },
    { day: 'Sat', value: 13 },
    { day: 'Sun', value: 22 },
    { day: 'Mon', value: 13 },
    { day: 'Tue', value: 17 },
    { day: 'Wed', value: 22 },
    { day: 'Thu', value: 17 },
  ],
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const maxValue = 30;
  const chartHeight = 160;
  const chartWidth = 600;
  const barWidth = 56;
  const barGap = 28;
  const startX = 56;
  const startY = 24;

  const timeframes = ['This Week', 'This Month', 'This Year'];

  const getBarHeight = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  const getBarX = (index: number) => {
    return startX + index * (barWidth + barGap);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className={chartCard}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">Revenue analytics</h3>
          <p className="mt-0.5 text-sm text-slate-500">Revenue over time</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
            >
              {selectedTimeframe}
              <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[132px] rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => {
                      setSelectedTimeframe(tf);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Chart options"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative -mx-1 overflow-x-auto">
        <svg width="100%" height={chartHeight + startY + 36} viewBox={`0 0 ${chartWidth} ${chartHeight + startY + 36}`} className="min-w-[520px]">
          {[0, 5, 10, 15, 20, 25, 30].map((value) => {
            const y = startY + chartHeight - (value / maxValue) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={startX - 8}
                  y1={y}
                  x2={chartWidth - 16}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={startX - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400"
                  fontSize="11"
                  fontWeight="500"
                >
                  {value}k
                </text>
              </g>
            );
          })}

          {data.map((item, index) => {
            const barHeight = getBarHeight(item.value);
            const x = getBarX(index);
            const y = startY + chartHeight - barHeight;

            return (
              <g key={item.day}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#2563eb"
                  rx="8"
                  className="transition-opacity hover:opacity-90"
                />
                <text
                  x={x + barWidth / 2}
                  y={startY + chartHeight + 18}
                  textAnchor="middle"
                  className="fill-slate-500"
                  fontSize="11"
                  fontWeight="500"
                >
                  {item.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RevenueAnalyticsCard;
