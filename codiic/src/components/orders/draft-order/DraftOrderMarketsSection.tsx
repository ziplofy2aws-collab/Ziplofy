import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import React from 'react';
import DraftOrderCard from './DraftOrderCard';

const DraftOrderMarketsSection: React.FC = () => {
  return (
    <DraftOrderCard
      title="Markets"
      headerAction={
        <GlobeAltIcon className="h-4 w-4 text-gray-400" aria-hidden />
      }
      bodyClassName="space-y-3 px-4 py-3"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-700">
        <GlobeAltIcon className="h-3.5 w-3.5 text-gray-500" aria-hidden />
        India
      </span>

      <div>
        <label htmlFor="draft-order-currency" className="mb-1 block text-[12px] text-gray-500">
          Currency
        </label>
        <div className="relative">
          <select
            id="draft-order-currency"
            defaultValue="inr"
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-[13px] text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
          >
            <option value="inr">Indian Rupee (INR ₹)</option>
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
        </div>
      </div>
    </DraftOrderCard>
  );
};

export default DraftOrderMarketsSection;
