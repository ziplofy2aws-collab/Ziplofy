import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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

  // Handle click outside menu
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

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between relative">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Past bills</h2>
          <p className="mt-1 text-sm text-gray-500">View and download previous invoices.</p>
        </div>
        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleMenuToggle}
            aria-label="More options"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px] overflow-hidden"
            >
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleViewChargesClick}
              >
                View in charge table
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 gap-3 border-b border-gray-100">
        <div className="flex gap-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              billFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={handleFilterAll}
          >
            All
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              billFilter === 'paid'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={handleFilterPaid}
          >
            Paid
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              billFilter === 'unpaid'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={handleFilterUnpaid}
          >
            Unpaid
          </button>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Filter"
          >
            <FunnelIcon className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Refresh"
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="mx-5 my-6 rounded-lg border border-gray-100 h-[200px] flex items-center justify-center bg-gray-50/80">
        <p className="text-sm text-gray-500">Your past bills will appear here.</p>
      </div>

      <div className="flex justify-between items-center px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-500">Showing 0 results</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="min-w-[32px] px-2 py-1.5 rounded border border-gray-200 text-xs text-gray-400 cursor-not-allowed"
            disabled
          >
            ‹
          </button>
          <button
            type="button"
            className="min-w-[32px] px-2 py-1.5 rounded border border-gray-200 text-xs text-gray-400 cursor-not-allowed"
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

