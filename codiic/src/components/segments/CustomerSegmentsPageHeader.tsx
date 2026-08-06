import { Squares2X2Icon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../admin-list-ui';

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
        <Squares2X2Icon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Customer segments</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onViewCustomers} className={adminListSecondaryButtonClass}>
          View customers
        </button>
        <button type="button" onClick={onCreateSegment} className={adminListPrimaryButtonClass}>
          Create segment
        </button>
      </div>
    </div>
  );
};

export default CustomerSegmentsPageHeader;
