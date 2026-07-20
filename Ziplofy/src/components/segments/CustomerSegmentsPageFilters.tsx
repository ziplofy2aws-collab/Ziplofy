import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { segmentInputClass } from './customer-segment-ui.util';

interface CustomerSegmentsPageFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const CustomerSegmentsPageFilters: React.FC<CustomerSegmentsPageFiltersProps> = ({
  search,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search segments by name"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${segmentInputClass} py-1.5 pl-8 pr-3`}
        />
      </div>
    </div>
  );
};

export default CustomerSegmentsPageFilters;
