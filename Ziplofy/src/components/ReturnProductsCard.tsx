import { ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import { CubeIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ReturnProductsCardProps {
  returnProducts?: number;
  percentageChange?: number;
  lastMonth?: number;
}

const cardShell =
  'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-dashboard-card transition-shadow duration-200 hover:shadow-dashboard-card-hover';

const ReturnProductsCard: React.FC<ReturnProductsCardProps> = ({
  returnProducts = 0,
  percentageChange = 0,
  lastMonth = 0,
}) => {
  const absPct = Math.abs(percentageChange);
  return (
    <div className={cardShell}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">Return products</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {returnProducts.toLocaleString()}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10">
              <ArrowTrendingDownIcon className="h-3.5 w-3.5" aria-hidden />
              −{absPct}%
            </span>
            <span className="text-xs text-slate-500">vs last month ({lastMonth.toLocaleString()})</span>
          </div>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100/80">
          <CubeIcon className="h-7 w-7 text-amber-600" aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default ReturnProductsCard;
