import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';
import {
  customerPrimaryButtonClass,
  customerSecondaryButtonClass,
} from './customer-ui.util';

type CustomerFormHeaderProps = {
  mode?: 'create' | 'edit';
  title: string;
  backLabel?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  actions?: ReactNode;
};

const CustomerFormHeader: React.FC<CustomerFormHeaderProps> = ({
  mode = 'create',
  title,
  backLabel = 'Back to customers',
  onBack,
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  actions,
}) => {
  const heading = mode === 'create' ? title : title || 'Customer';

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
        <h1 className="truncate text-lg font-semibold text-gray-900">{heading}</h1>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {onCancel ? (
            <button type="button" onClick={onCancel} className={customerSecondaryButtonClass}>
              Cancel
            </button>
          ) : null}
          {onSubmit && submitLabel ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitDisabled}
              className={customerPrimaryButtonClass}
            >
              {submitLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerFormHeader;
