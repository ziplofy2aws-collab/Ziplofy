import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminListCardClass } from './admin-list-ui';

interface PastBillsSectionProps {
  onViewCharges: () => void;
}

const PastBillsSection: React.FC<PastBillsSectionProps> = ({ onViewCharges }) => {
  const [billFilter, setBillFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleViewChargesClick = useCallback(() => {
    handleMenuClose();
    onViewCharges();
  }, [handleMenuClose, onViewCharges]);

  const handleFilterChange = useCallback((newFilter: 'all' | 'paid' | 'unpaid') => {
    setBillFilter(newFilter);
  }, []);

  const handleFilterAll = useCallback(() => {
    handleFilterChange('all');
  }, [handleFilterChange]);

  const handleFilterPaid = useCallback(() => {
    handleFilterChange('paid');
  }, [handleFilterChange]);

  const handleFilterUnpaid = useCallback(() => {
    handleFilterChange('unpaid');
  }, [handleFilterChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        handleMenuClose();
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, handleMenuClose]);

  const filterChipClass = (active: boolean) =>
    active
      ? 'rounded-lg bg-admin-text px-3 py-1.5 text-[12px] font-medium text-white transition-colors'
      : 'rounded-lg px-3 py-1.5 text-[12px] font-medium text-admin-text-secondary transition-colors hover:bg-admin-row-hover hover:text-admin-text';

  const iconBtnClass =
    'rounded-lg border border-admin-border p-2 text-admin-text-secondary transition-colors hover:bg-admin-row-hover hover:text-admin-text';

  return (
    <div className={adminListCardClass}>
      <div className="relative flex items-center justify-between border-b border-admin-divider p-5">
        <div>
          <h2 className="text-[13px] font-semibold text-admin-text">Past bills</h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            View and download previous invoices.
          </p>
        </div>
        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            className="rounded-lg p-2 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
            onClick={handleMenuToggle}
            aria-label="More options"
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full z-10 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-admin-border bg-admin-surface shadow-lg"
            >
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-[13px] text-admin-text transition-colors hover:bg-admin-row-hover"
                onClick={handleViewChargesClick}
              >
                View in charge table
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-b border-admin-divider px-5 py-3 sm:flex-row sm:items-center">
        <div className="flex gap-1">
          <button type="button" className={filterChipClass(billFilter === 'all')} onClick={handleFilterAll}>
            All
          </button>
          <button type="button" className={filterChipClass(billFilter === 'paid')} onClick={handleFilterPaid}>
            Paid
          </button>
          <button
            type="button"
            className={filterChipClass(billFilter === 'unpaid')}
            onClick={handleFilterUnpaid}
          >
            Unpaid
          </button>
        </div>

        <div className="flex gap-1">
          <button type="button" className={iconBtnClass} aria-label="Search">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
          <button type="button" className={iconBtnClass} aria-label="Filter">
            <FunnelIcon className="h-4 w-4" />
          </button>
          <button type="button" className={iconBtnClass} aria-label="Refresh">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-5 my-6 flex h-[200px] items-center justify-center rounded-lg border border-admin-border bg-admin-secondary">
        <p className="text-[13px] text-admin-text-subdued">Your past bills will appear here.</p>
      </div>

      <div className="flex items-center justify-between border-t border-admin-divider bg-admin-table-header px-5 py-3">
        <p className="text-[12px] text-admin-text-subdued">Showing 0 results</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="min-w-[32px] cursor-not-allowed rounded border border-admin-border px-2 py-1.5 text-[12px] text-admin-text-subdued"
            disabled
          >
            ‹
          </button>
          <button
            type="button"
            className="min-w-[32px] cursor-not-allowed rounded border border-admin-border px-2 py-1.5 text-[12px] text-admin-text-subdued"
            disabled
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastBillsSection;
