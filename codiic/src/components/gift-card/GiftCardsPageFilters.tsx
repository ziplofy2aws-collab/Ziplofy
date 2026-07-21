import {
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { giftCardInputClass } from './gift-card-ui.util';

export type GiftCardFilterTab = 'All' | 'Active' | 'Inactive';

interface GiftCardsPageFiltersProps {
  activeTab: GiftCardFilterTab;
  onTabChange: (tab: GiftCardFilterTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const FILTER_OPTIONS: GiftCardFilterTab[] = ['All', 'Active', 'Inactive'];

const GiftCardsPageFilters: React.FC<GiftCardsPageFiltersProps> = ({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  return (
    <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
      <div className="relative shrink-0" ref={filterRef}>
        <button
          type="button"
          onClick={() => setFilterOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
        >
          {activeTab}
          <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        </button>
        {filterOpen ? (
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] rounded-md border border-gray-200 bg-white py-1 shadow-md">
            {FILTER_OPTIONS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  onTabChange(tab);
                  setFilterOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-gray-50 ${
                  activeTab === tab ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search and filter"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${giftCardInputClass} py-1.5 pl-8 pr-3`}
        />
      </div>
    </div>
  );
};

export default GiftCardsPageFilters;
