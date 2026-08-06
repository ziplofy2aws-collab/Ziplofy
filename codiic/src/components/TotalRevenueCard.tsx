import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { dashboardCardShell } from './dashboard-ui';

interface TotalRevenueCardProps {
  totalRevenue?: number;
  lastMonth?: number;
  currency?: string;
  percentageChange?: number;
}

const TotalRevenueCard: React.FC<TotalRevenueCardProps> = ({
  totalRevenue = 0,
  lastMonth = 0,
  currency = '₹',
  percentageChange = 0,
}) => {
  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={dashboardCardShell}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-admin-text-secondary">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-admin-text tabular-nums">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#cdfee1] px-2 py-0.5 text-[12px] font-medium text-[#0c5132]">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5" aria-hidden />
              +{percentageChange}%
            </span>
            <span className="text-[12px] text-admin-text-subdued">
              vs last month ({formatCurrency(lastMonth)})
            </span>
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-secondary">
          <CurrencyDollarIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default TotalRevenueCard;
