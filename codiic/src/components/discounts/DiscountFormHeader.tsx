import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';
import {
  discountPrimaryButtonClass,
  discountSecondaryButtonClass,
} from './discount-ui.util';

type DiscountFormHeaderProps = {
  title: string;
  backLabel?: string;
  onBack?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  actions?: ReactNode;
};

const DiscountFormHeader: React.FC<DiscountFormHeaderProps> = ({
  title,
  backLabel = 'Back to discounts',
  onBack,
  onCancel,
  submitLabel,
  submitDisabled = false,
  loading = false,
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
          {onCancel ? (
            <button type="button" onClick={onCancel} className={discountSecondaryButtonClass}>
              Cancel
            </button>
          ) : null}
          {submitLabel ? (
            <button
              type="submit"
              disabled={submitDisabled || loading}
              className={discountPrimaryButtonClass}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : null}
              {loading ? 'Saving…' : submitLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiscountFormHeader;
