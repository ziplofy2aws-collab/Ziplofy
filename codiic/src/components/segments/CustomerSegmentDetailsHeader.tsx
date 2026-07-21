import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';
import {
  segmentPrimaryButtonClass,
} from './customer-segment-ui.util';

type CustomerSegmentDetailsHeaderProps = {
  title: string;
  backLabel?: string;
  onBack?: () => void;
  onAddCustomer?: () => void;
  actions?: ReactNode;
};

const CustomerSegmentDetailsHeader: React.FC<CustomerSegmentDetailsHeaderProps> = ({
  title,
  backLabel = 'Back to segments',
  onBack,
  onAddCustomer,
  actions,
}) => {
  return (
    <div className="mb-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-normal text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {backLabel}
        </button>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {onAddCustomer ? (
            <button type="button" onClick={onAddCustomer} className={segmentPrimaryButtonClass}>
              Add customer
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentDetailsHeader;
