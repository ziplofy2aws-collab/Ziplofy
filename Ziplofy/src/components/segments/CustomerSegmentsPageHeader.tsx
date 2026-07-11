import { Squares2X2Icon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  segmentPrimaryButtonClass,
  segmentSecondaryButtonClass,
} from './customer-segment-ui.util';

type CustomerSegmentsPageHeaderProps = {
  onCreateSegment: () => void;
  onViewCustomers: () => void;
};

const CustomerSegmentsPageHeader: React.FC<CustomerSegmentsPageHeaderProps> = ({
  onCreateSegment,
  onViewCustomers,
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Squares2X2Icon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Customer segments</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onViewCustomers} className={segmentSecondaryButtonClass}>
          View customers
        </button>
        <button type="button" onClick={onCreateSegment} className={segmentPrimaryButtonClass}>
          Create segment
        </button>
      </div>
    </div>
  );
};

export default CustomerSegmentsPageHeader;
