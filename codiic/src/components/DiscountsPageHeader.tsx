import { PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface DiscountsPageHeaderProps {
  onExport?: () => void;
  onCreateDiscount: () => void;
  /** Count for the currently selected discount type */
  activeCount?: number;
  activeTabLabel?: string;
}

const DiscountsPageHeader: React.FC<DiscountsPageHeaderProps> = ({
  onExport,
  onCreateDiscount,
  activeCount,
  activeTabLabel,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Discounts</h1>
            {activeCount !== undefined && activeTabLabel ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                <TagIcon className="h-3.5 w-3.5" aria-hidden />
                {activeCount} {activeTabLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage amount-off, buy X get Y, order, and free-shipping promotions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              Export
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCreateDiscount}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" aria-hidden />
            Create discount
          </button>
        </div>
      </div>
      <div className="mt-4 hidden rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-2.5 sm:block">
        <p className="text-xs leading-relaxed text-blue-950/80">
          <span className="font-semibold text-blue-950">Tip:</span> choose a tab below, then create a discount that matches how you want to reward customers at checkout.
        </p>
      </div>
    </div>
  );
};

export default DiscountsPageHeader;
