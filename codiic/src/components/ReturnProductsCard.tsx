import { CubeIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { dashboardCardShell } from './dashboard-ui';

interface ReturnProductsCardProps {
  returnProducts?: number;
  percentageChange?: number;
  lastMonth?: number;
}

const ReturnProductsCard: React.FC<ReturnProductsCardProps> = ({
  returnProducts = 0,
  percentageChange = 0,
  lastMonth = 0,
}) => {
  const absPct = Math.abs(percentageChange);
  return (
    <div className={dashboardCardShell}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-admin-text-secondary">Return products</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-admin-text tabular-nums">
            {returnProducts.toLocaleString()}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-admin-secondary px-2 py-0.5 text-[12px] font-medium text-admin-text-secondary">
              <ArrowTrendingDownIcon className="h-3.5 w-3.5" aria-hidden />
              −{absPct}%
            </span>
            <span className="text-[12px] text-admin-text-subdued">
              vs last month ({lastMonth.toLocaleString()})
            </span>
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-secondary">
          <CubeIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default ReturnProductsCard;
