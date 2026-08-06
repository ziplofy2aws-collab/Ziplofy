import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminListFilterBarClass, adminListSearchInputClass } from '../admin-list-ui';

interface VendorsPageFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const VendorsPageFilters: React.FC<VendorsPageFiltersProps> = ({ search, onSearchChange }) => {
  return (
    <div className={adminListFilterBarClass}>
      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
        <input
          type="search"
          placeholder="Search vendors"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={adminListSearchInputClass}
        />
      </div>
    </div>
  );
};

export default VendorsPageFilters;
