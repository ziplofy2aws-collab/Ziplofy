import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';
import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';

type PurchaseOrderFormHeaderProps = {
  title: string;
  status?: string;
  backLabel?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  actions?: ReactNode;
};

const PurchaseOrderFormHeader: React.FC<PurchaseOrderFormHeaderProps> = ({
  title,
  status,
  backLabel = 'Back to purchase orders',
  onBack,
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled = false,
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
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-lg font-medium tracking-tight text-gray-800">{title}</h1>
          {status ? <PurchaseOrderStatusBadge status={status} /> : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-200/60 bg-white px-3 py-2 text-sm font-normal text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          ) : null}
          {onSubmit && submitLabel ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitDisabled}
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderFormHeader;
