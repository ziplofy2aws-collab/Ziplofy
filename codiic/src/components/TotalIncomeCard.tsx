import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { dashboardChartCardShell } from './dashboard-ui';

interface TotalIncomeCardProps {
  data?: {
    month: string;
    profit: number;
    loss: number;
  }[];
}

/** Hardcoded chart fills — do not swap these for admin-text tokens (bars go flat). */
const PROFIT_BAR_COLOR = '#2563eb';
const LOSS_BAR_COLOR = '#93c5fd';

const TotalIncomeCard: React.FC<TotalIncomeCardProps> = ({
  data = [
    { month: 'Jan', profit: 23, loss: 23 },
    { month: 'Feb', profit: 20, loss: 23 },
    { month: 'Mar', profit: 23, loss: 28 },
    { month: 'Apr', profit: 37, loss: 18 },
    { month: 'May', profit: 33, loss: 20 },
    { month: 'Jun', profit: 23, loss: 18 },
    { month: 'Jul', profit: 21, loss: 22 },
  ],
}) => {
  const maxValue = 50;
  const chartHeight = 160;
  const chartWidth = 600;
  const barWidth = 52;
  const barGap = 22;
  const startX = 56;
  const startY = 24;

  const getBarHeight = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  const getBarX = (index: number) => {
    return startX + index * (barWidth + barGap);
  };

  return (
    <div className={dashboardChartCardShell}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-admin-text">Total income</h3>
          <p className="mt-0.5 text-[12px] text-admin-text-secondary">Profit and loss over time</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-admin-text-secondary">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PROFIT_BAR_COLOR }}
              />
              Profit
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-admin-text-secondary">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: LOSS_BAR_COLOR }}
              />
              Loss
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
            aria-label="Chart options"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative -mx-1 overflow-x-auto">
        <svg width="100%" height={chartHeight + startY + 36} viewBox={`0 0 ${chartWidth} ${chartHeight + startY + 36}`} className="min-w-[520px]">
          {[0, 10, 20, 30, 40, 50].map((value) => {
            const y = startY + chartHeight - (value / maxValue) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={startX - 8}
                  y1={y}
                  x2={chartWidth - 16}
                  y2={y}
                  stroke="#ebebeb"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={startX - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="#8a8a8a"
                  fontSize="11"
                  fontWeight="500"
                >
                  {value === 0 ? '0' : `${value}k`}
                </text>
              </g>
            );
          })}

          {data.map((item, index) => {
            const profitHeight = getBarHeight(item.profit);
            const lossHeight = getBarHeight(item.loss);
            const totalHeight = profitHeight + lossHeight;
            const x = getBarX(index);
            const profitY = startY + chartHeight - totalHeight;
            const lossY = profitY + profitHeight;

            return (
              <g key={item.month}>
                <rect
                  x={x}
                  y={profitY}
                  width={barWidth}
                  height={profitHeight}
                  fill={PROFIT_BAR_COLOR}
                  rx="6"
                  className="transition-opacity hover:opacity-90"
                />
                <rect
                  x={x}
                  y={lossY}
                  width={barWidth}
                  height={lossHeight}
                  fill={LOSS_BAR_COLOR}
                  rx="6"
                  className="transition-opacity hover:opacity-90"
                />
                <text
                  x={x + barWidth / 2}
                  y={startY + chartHeight + 18}
                  textAnchor="middle"
                  fill="#616161"
                  fontSize="11"
                  fontWeight="500"
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default TotalIncomeCard;
