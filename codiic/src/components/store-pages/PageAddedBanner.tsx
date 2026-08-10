import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { adminListFooterLinkClass } from '../admin-list-ui';

type PageAddedBannerProps = {
  pageTitle: string;
  onDismiss: () => void;
  onAddAnother: () => void;
};

const PageAddedBanner: React.FC<PageAddedBannerProps> = ({
  pageTitle,
  onDismiss,
  onAddAnother,
}) => {
  return (
    <div
      className="mb-4 overflow-hidden rounded-xl border border-[#9ed4b0]/80 bg-admin-surface"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#9ed4b0]/50 bg-[#cdfee1] px-4 py-2.5 text-[#0c5132]">
        <div className="flex min-w-0 items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate text-[13px] font-semibold">Added {pageTitle}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-0.5 text-[#0c5132]/80 transition-colors hover:bg-white/50 hover:text-[#0c5132]"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="px-4 py-3 text-[13px] text-admin-text-secondary">
        <button
          type="button"
          onClick={onAddAnother}
          className={`${adminListFooterLinkClass} font-medium underline-offset-2`}
        >
          Add another page
        </button>
      </div>
    </div>
  );
};

export default PageAddedBanner;
