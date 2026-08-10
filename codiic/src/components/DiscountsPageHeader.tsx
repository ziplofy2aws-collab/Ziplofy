import { PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';

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
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Discounts</h1>
          {activeCount !== undefined && activeTabLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-admin-secondary px-2.5 py-0.5 text-[12px] font-medium text-admin-text-secondary">
              {activeCount} {activeTabLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Create and manage amount-off, buy X get Y, order, and free-shipping promotions.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {onExport ? (
          <button type="button" onClick={onExport} className={adminListSecondaryButtonClass}>
            Export
          </button>
        ) : null}
        <button type="button" onClick={onCreateDiscount} className={adminListPrimaryButtonClass}>
          <PlusIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Create discount
        </button>
      </div>
    </header>
  );
};

export default DiscountsPageHeader;
