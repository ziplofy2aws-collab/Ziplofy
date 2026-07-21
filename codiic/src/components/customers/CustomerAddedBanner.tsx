import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React from 'react';

type CustomerAddedBannerProps = {
  customerName: string;
  onDismiss: () => void;
  onAddAnother: () => void;
};

const CustomerAddedBanner: React.FC<CustomerAddedBannerProps> = ({
  customerName,
  onDismiss,
  onAddAnother,
}) => {
  return (
    <div
      className="mb-4 overflow-hidden rounded-lg border border-emerald-700/25 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 bg-emerald-700 px-4 py-2.5 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate text-[13px] font-semibold">Added {customerName}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-white/90 transition-colors hover:bg-emerald-600 hover:text-white"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="border-t border-emerald-700/15 bg-white px-4 py-3 text-[13px] text-gray-700">
        <button
          type="button"
          onClick={onAddAnother}
          className="font-normal text-gray-900 underline underline-offset-2 transition-colors hover:text-gray-700"
        >
          Add another customer
        </button>
      </div>
    </div>
  );
};

export default CustomerAddedBanner;
