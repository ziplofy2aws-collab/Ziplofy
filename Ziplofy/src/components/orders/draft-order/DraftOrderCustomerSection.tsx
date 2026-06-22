import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
import DraftOrderCard from './DraftOrderCard';

type DraftOrderCustomerSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

const DraftOrderCustomerSection: React.FC<DraftOrderCustomerSectionProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <DraftOrderCard title="Customer" bodyClassName="px-4 py-3">
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder=""
          aria-label="Search customers"
          className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-[13px] text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
        />
      </div>
    </DraftOrderCard>
  );
};

export default DraftOrderCustomerSection;
