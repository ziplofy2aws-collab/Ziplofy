import React from 'react';
import { adminListPrimaryButtonClass } from '../admin-list-ui';

function DraftOrderIllustration() {
  return (
    <div className="relative mx-auto mb-6 h-[148px] w-[210px]" aria-hidden>
      <div className="absolute bottom-0 left-1/2 h-[74px] w-[168px] -translate-x-1/2 rounded-t-xl bg-teal-300/80" />
      <div className="absolute bottom-0 left-1/2 h-[70px] w-[160px] -translate-x-1/2 rounded-t-lg bg-teal-400 shadow-sm" />

      <div className="absolute left-1/2 top-0 h-[108px] w-[118px] -translate-x-1/2 rounded-lg border border-admin-border bg-admin-surface shadow-md">
        <div
          className="absolute right-0 top-0 h-5 w-5 rounded-bl-md border-b border-l border-admin-border bg-admin-secondary"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
        />

        <div className="flex h-full flex-col items-center justify-center px-3 pt-1">
          <svg viewBox="0 0 48 48" className="h-14 w-14 text-rose-400" fill="currentColor">
            <path d="M16 8c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v2h4c1.1 0 2 .9 2 2v3c0 .6-.3 1.2-.8 1.5L36 38c-.4 1.6-1.9 2.8-3.6 2.8H15.6c-1.7 0-3.2-1.2-3.6-2.8L8.8 16.5c-.5-.3-.8-.9-.8-1.5v-3c0-1.1.9-2 2-2h4V8zm6 0v2h4V8c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1z" />
          </svg>

          <div className="mt-2 w-full space-y-1.5">
            <div className="mx-auto h-1.5 w-[78%] rounded-full bg-admin-secondary" />
            <div className="mx-auto h-1.5 w-[58%] rounded-full bg-admin-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}

type DraftsEmptyStateProps = {
  onCreateDraftOrder: () => void;
};

const DraftsEmptyState: React.FC<DraftsEmptyStateProps> = ({ onCreateDraftOrder }) => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
      <DraftOrderIllustration />

      <h2 className="text-[15px] font-semibold text-admin-text">
        Manually create orders and invoices
      </h2>

      <p className="mt-1.5 max-w-[520px] text-[13px] leading-relaxed text-admin-text-secondary">
        Use draft orders to take orders over the phone, email invoices to customers, and collect
        payments.
      </p>

      <button
        type="button"
        onClick={onCreateDraftOrder}
        className={`mt-6 ${adminListPrimaryButtonClass}`}
      >
        Create draft order
      </button>
    </div>
  );
};

export default DraftsEmptyState;
