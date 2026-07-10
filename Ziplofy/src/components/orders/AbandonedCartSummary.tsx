import { BanknotesIcon, ClockIcon, CubeIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import React from 'react';

interface AbandonedCartSummaryProps {
  totalItems: number;
  uniqueProducts: number;
  totalValue: number;
  lastUpdated: string;
  formatDate: (dateString: string) => string;
}

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AbandonedCartSummary: React.FC<AbandonedCartSummaryProps> = ({
  totalItems,
  uniqueProducts,
  totalValue,
  lastUpdated,
  formatDate,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <h3 className="text-sm font-semibold text-gray-900">Cart summary</h3>
        <p className="mt-0.5 text-xs text-gray-500">Totals for this abandoned checkout</p>
      </div>
      <div className="space-y-3 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <CubeIcon className="h-3.5 w-3.5 text-blue-600" aria-hidden />
              Items
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">{totalItems}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <Squares2X2Icon className="h-3.5 w-3.5 text-blue-600" aria-hidden />
              SKUs
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">{uniqueProducts}</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <BanknotesIcon className="h-4 w-4 text-blue-600" aria-hidden />
            Estimated value
          </span>
          <span className="text-lg font-bold tabular-nums text-blue-700">{formatInr(totalValue)}</span>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-xs text-gray-600">
          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <span>
            <span className="font-semibold text-gray-700">Last updated</span>
            <br />
            {formatDate(lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AbandonedCartSummary;
